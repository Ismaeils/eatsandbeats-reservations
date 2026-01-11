import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { z } from 'zod'

const manualReservationSchema = z.object({
  guestName: z.string().min(2, 'Guest name must be at least 2 characters'),
  guestContact: z.string().min(5, 'Contact info must be at least 5 characters'),
  numberOfPeople: z.number().int().min(1).max(50),
  timeFrom: z.string().datetime(),
  timeTo: z.string().datetime(),
  tableId: z.string().optional().nullable(),
})

// POST - Create a manual reservation (by employee)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const validatedData = manualReservationSchema.parse(body)

    // Get restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
      include: {
        openingHours: true,
      },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    // Check if restaurant is properly set up
    if (!restaurant.tableLayout || restaurant.tableLayout.length === 0) {
      return errorResponse(
        'Cannot create reservations until you have configured tables in your Floor Plan.',
        400
      )
    }

    const openDays = restaurant.openingHours.filter((h) => h.isOpen)
    if (restaurant.openingHours.length === 0 || openDays.length === 0) {
      return errorResponse(
        'Cannot create reservations until you have configured your opening hours.',
        400
      )
    }

    const timeFrom = new Date(validatedData.timeFrom)
    const timeTo = new Date(validatedData.timeTo)

    // Validate time range
    if (timeFrom >= timeTo) {
      return errorResponse('End time must be after start time', 400)
    }

    // Check table availability if a specific table is selected
    let assignedTableId = validatedData.tableId

    if (assignedTableId) {
      // Check if table exists
      if (!restaurant.tableLayout.includes(assignedTableId)) {
        return errorResponse(`Table ${assignedTableId} does not exist`, 400)
      }

      // Check if table is available at the requested time
      const conflictingReservation = await prisma.reservation.findFirst({
        where: {
          restaurantId: restaurant.id,
          tableId: assignedTableId,
          status: { in: ['CONFIRMED', 'PENDING', 'SEATED'] },
          AND: [
            { timeFrom: { lt: timeTo } },
            { timeTo: { gt: timeFrom } },
          ],
        },
      })

      if (conflictingReservation) {
        return errorResponse(
          `Table ${assignedTableId} is not available at the requested time. Please choose a different table.`,
          400
        )
      }
    } else {
      // Auto-assign a table
      const conflictingReservations = await prisma.reservation.findMany({
        where: {
          restaurantId: restaurant.id,
          tableId: { in: restaurant.tableLayout },
          status: { in: ['CONFIRMED', 'PENDING', 'SEATED'] },
          AND: [
            { timeFrom: { lt: timeTo } },
            { timeTo: { gt: timeFrom } },
          ],
        },
        select: { tableId: true },
      })

      const occupiedTableIds = new Set(conflictingReservations.map((r) => r.tableId))
      const availableTable = restaurant.tableLayout.find(
        (tableId) => !occupiedTableIds.has(tableId)
      )

      if (availableTable) {
        assignedTableId = availableTable
      }
      // If no table is available, leave as null (TBD)
    }

    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        restaurantId: restaurant.id,
        guestName: validatedData.guestName,
        guestContact: validatedData.guestContact,
        numberOfPeople: validatedData.numberOfPeople,
        timeFrom,
        timeTo,
        tableId: assignedTableId,
        status: 'CONFIRMED',
        depositAmount: restaurant.reservationDeposit,
        depositPaid: false, // Manual reservations can be marked as paid later
      },
    })

    return successResponse(
      {
        ...reservation,
        tableAssigned: !!assignedTableId,
        message: assignedTableId 
          ? `Reservation created and assigned to table ${assignedTableId}`
          : 'Reservation created. No tables available at this time - please assign a table manually.',
      },
      'Reservation created successfully'
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Create manual reservation error:', error)
    return errorResponse('Failed to create reservation', 500)
  }
}
