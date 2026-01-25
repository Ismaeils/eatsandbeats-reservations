import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'
import { sendReservationConfirmedEmail } from '@/lib/email'
import { format } from 'date-fns'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    // Find the reservation
    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        restaurantId: restaurant.id,
      },
    })

    if (!reservation) {
      return notFoundResponse()
    }

    // Check if reservation is pending
    if (reservation.status !== 'PENDING') {
      return errorResponse(
        `Cannot approve a reservation that is ${reservation.status.toLowerCase()}`,
        400
      )
    }

    // Update status to confirmed
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    })

    // Send confirmation email if guest contact is an email
    const isEmailContact = reservation.guestContact.includes('@')
    if (isEmailContact && reservation.confirmationCode) {
      await sendReservationConfirmedEmail({
        guestName: reservation.guestName,
        guestEmail: reservation.guestContact,
        restaurantName: restaurant.name,
        confirmationCode: reservation.confirmationCode,
        date: format(reservation.timeFrom, 'EEEE, MMMM d, yyyy'),
        time: format(reservation.timeFrom, 'h:mm a'),
        numberOfPeople: reservation.numberOfPeople,
      })
    }

    return successResponse(updatedReservation, 'Reservation approved successfully')
  } catch (error) {
    console.error('Approve reservation error:', error)
    return errorResponse('Failed to approve reservation', 500)
  }
}
