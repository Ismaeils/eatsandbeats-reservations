import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

// GET - Get available tables for a given time slot
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const timeFrom = searchParams.get('timeFrom')
    const timeTo = searchParams.get('timeTo')
    const excludeReservationId = searchParams.get('excludeReservationId') // Exclude current reservation when editing

    if (!timeFrom || !timeTo) {
      return errorResponse('timeFrom and timeTo are required', 400)
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
      select: { id: true, tableLayout: true },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    const timeFromDate = new Date(timeFrom)
    const timeToDate = new Date(timeTo)

    // Find all reservations that overlap with the requested time slot
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        restaurantId: restaurant.id,
        status: { in: ['CONFIRMED', 'PENDING', 'SEATED'] },
        tableId: { not: null },
        // Exclude the reservation being edited
        ...(excludeReservationId && { id: { not: excludeReservationId } }),
        // Time overlap check: reservation overlaps if it starts before our end AND ends after our start
        AND: [
          { timeFrom: { lt: timeToDate } },
          { timeTo: { gt: timeFromDate } },
        ],
      },
      select: { tableId: true },
    })

    const occupiedTableIds = new Set(
      conflictingReservations.map((r) => r.tableId).filter(Boolean)
    )

    const availableTables = restaurant.tableLayout.filter(
      (tableId) => !occupiedTableIds.has(tableId)
    )

    const occupiedTables = restaurant.tableLayout.filter(
      (tableId) => occupiedTableIds.has(tableId)
    )

    return successResponse({
      allTables: restaurant.tableLayout,
      availableTables,
      occupiedTables,
    }, 'Available tables fetched successfully')
  } catch (error: any) {
    console.error('Get available tables error:', error)
    return errorResponse('Failed to fetch available tables', 500)
  }
}
