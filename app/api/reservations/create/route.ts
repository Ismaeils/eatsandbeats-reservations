import { errorResponse, successResponse } from '@/lib/api-response'
import { sendReservationConfirmedEmail, sendReservationPendingEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { format } from 'date-fns'

// Generate a unique confirmation code
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Avoid confusing characters
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const createReservationSchema = z.object({
  invitationToken: z.string().optional(),
  restaurantId: z.string().optional(), // For public reservations without invitation
  guestName: z.string().min(1, 'Guest name is required'),
  guestContact: z.string().min(1, 'Contact information is required'),
  numberOfPeople: z.number().int().min(1, 'Number of people must be at least 1'),
  timeFrom: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid start time format' }
  ),
  timeTo: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid end time format' }
  ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createReservationSchema.parse(body)

    let restaurantId: string | null = null
    let invitationId: string | null = null

    // If invitation token is provided, find the invitation and restaurant
    if (validatedData.invitationToken) {
      const invitation = await prisma.reservationInvitation.findUnique({
        where: { webFormToken: validatedData.invitationToken },
        include: { restaurant: true },
      })

      if (!invitation) {
        return errorResponse('Invalid invitation token', 404)
      }

      if (invitation.status === 'COMPLETED') {
        return errorResponse('This invitation has already been used', 400)
      }

      if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        return errorResponse('This invitation has expired', 400)
      }

      restaurantId = invitation.restaurantId
      invitationId = invitation.id
    } else if (validatedData.restaurantId) {
      // Public reservation - no invitation token required
      restaurantId = validatedData.restaurantId
    } else {
      // If no token and no restaurant ID, return error
      return errorResponse('Restaurant ID or invitation token is required', 400)
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    // Parse dates
    const timeFrom = new Date(validatedData.timeFrom)
    const timeTo = new Date(validatedData.timeTo)

    // Validate dates
    if (isNaN(timeFrom.getTime()) || isNaN(timeTo.getTime())) {
      return errorResponse('Invalid date format', 400)
    }

    if (timeTo <= timeFrom) {
      return errorResponse('End time must be after start time', 400)
    }

    // Check if reservation already exists for this invitation
    if (invitationId) {
      const existingReservation = await prisma.reservation.findUnique({
        where: { invitationId },
      })
      if (existingReservation) {
        return errorResponse('A reservation already exists for this invitation', 400)
      }
    }

    // Check maxSimultaneousReservations capacity
    const overlappingCount = await prisma.reservation.count({
      where: {
        restaurantId,
        status: { in: ['CONFIRMED', 'PENDING', 'SEATED'] },
        timeFrom: { lt: timeTo },
        timeTo: { gt: timeFrom },
      },
    })

    if (overlappingCount >= restaurant.maxSimultaneousReservations) {
      return errorResponse('This time slot is fully booked. Please choose a different time.', 400)
    }

    // Determine status based on auto-confirm setting
    const status = restaurant.autoConfirmReservations ? 'CONFIRMED' : 'PENDING'
    const confirmationCode = generateConfirmationCode()

    // Create reservation
    const reservation = await prisma.$transaction(async (tx: any) => {
      const newReservation = await tx.reservation.create({
        data: {
          restaurantId,
          invitationId: invitationId || null,
          confirmationCode,
          guestName: validatedData.guestName,
          guestContact: validatedData.guestContact,
          numberOfPeople: validatedData.numberOfPeople,
          timeFrom,
          timeTo,
          depositAmount: restaurant.reservationDeposit,
          status,
        },
      })

      // Update invitation status
      if (invitationId) {
        await tx.reservationInvitation.update({
          where: { id: invitationId },
          data: { status: 'COMPLETED' },
        })
      }

      return newReservation
    })

    // Send appropriate email based on status
    const isEmailContact = validatedData.guestContact.includes('@')
    if (isEmailContact) {
      const emailData = {
        guestName: validatedData.guestName,
        guestEmail: validatedData.guestContact,
        restaurantName: restaurant.name,
        confirmationCode,
        date: format(timeFrom, 'EEEE, MMMM d, yyyy'),
        time: format(timeFrom, 'h:mm a'),
        numberOfPeople: validatedData.numberOfPeople,
      }

      if (status === 'CONFIRMED') {
        await sendReservationConfirmedEmail(emailData)
      } else {
        await sendReservationPendingEmail(emailData)
      }
    }

    const message = status === 'CONFIRMED' 
      ? 'Reservation confirmed successfully.' 
      : 'Reservation request submitted. Awaiting approval from the restaurant.'

    return successResponse(
      {
        reservation,
        paymentRequired: restaurant.reservationDeposit > 0,
        depositAmount: restaurant.reservationDeposit,
        status,
        confirmationCode,
      },
      message
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('Validation error:', error.errors)
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Create reservation error:', error)
    const errorMessage = error.message || 'Failed to create reservation'
    return errorResponse(errorMessage, 500)
  }
}
