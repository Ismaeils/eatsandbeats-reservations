import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { sendReservationConfirmedEmail } from '@/lib/email'
import { z } from 'zod'
import { format } from 'date-fns'

// Generate a unique confirmation code
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const manualReservationSchema = z.object({
  guestName: z.string().min(2, 'Guest name must be at least 2 characters'),
  guestContact: z.string().min(5, 'Contact info must be at least 5 characters'),
  numberOfPeople: z.number().int().min(1).max(100),
  timeFrom: z.string().datetime(),
  timeTo: z.string().datetime(),
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

    // Check maxSimultaneousReservations capacity
    const overlappingCount = await prisma.reservation.count({
      where: {
        restaurantId: restaurant.id,
        status: { in: ['CONFIRMED', 'PENDING', 'SEATED'] },
        timeFrom: { lt: timeTo },
        timeTo: { gt: timeFrom },
      },
    })

    if (overlappingCount >= restaurant.maxSimultaneousReservations) {
      return errorResponse('This time slot is fully booked. Please choose a different time.', 400)
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode()

    // Create the reservation (manual reservations are always confirmed)
    const reservation = await prisma.reservation.create({
      data: {
        restaurantId: restaurant.id,
        confirmationCode,
        guestName: validatedData.guestName,
        guestContact: validatedData.guestContact,
        numberOfPeople: validatedData.numberOfPeople,
        timeFrom,
        timeTo,
        status: 'CONFIRMED',
        depositAmount: restaurant.reservationDeposit,
        depositPaid: false,
      },
    })

    // Send confirmation email if guest contact is an email
    const isEmailContact = validatedData.guestContact.includes('@')
    if (isEmailContact) {
      await sendReservationConfirmedEmail({
        guestName: validatedData.guestName,
        guestEmail: validatedData.guestContact,
        restaurantName: restaurant.name,
        confirmationCode,
        date: format(timeFrom, 'EEEE, MMMM d, yyyy'),
        time: format(timeFrom, 'h:mm a'),
        numberOfPeople: validatedData.numberOfPeople,
      })
    }

    return successResponse(
      { ...reservation, confirmationCode },
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
