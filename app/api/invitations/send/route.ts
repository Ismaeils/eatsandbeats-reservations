import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { sendInvitationSchema } from '@/lib/validations'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    const userId = user.userId

    const body = await request.json()
    const validatedData = sendInvitationSchema.parse(body)

    // Get restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    // Generate unique web form token
    const webFormToken = randomBytes(32).toString('hex')

    // Create invitation
    const invitation = await prisma.reservationInvitation.create({
      data: {
        restaurantId: restaurant.id,
        phoneNumber: validatedData.phoneNumber,
        webFormToken,
        status: 'PENDING',
        invitationType: 'WHATSAPP', // Default, can be changed later
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // TODO: Integrate with WhatsApp/SMS service
    // For now, we'll just create the invitation record
    // The actual messaging integration will be added later

    // Update status to SENT (in real implementation, this would happen after successful message send)
    const updatedInvitation = await prisma.reservationInvitation.update({
      where: { id: invitation.id },
      data: { status: 'SENT' },
    })

    return successResponse(
      {
        invitation: updatedInvitation,
        webFormUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reservation-form/${webFormToken}`,
      },
      'Reservation invitation sent'
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Send invitation error:', error)
    return errorResponse('Failed to send invitation', 500)
  }
}

