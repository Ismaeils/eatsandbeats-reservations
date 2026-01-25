import { errorResponse, successResponse, unauthorizedResponse } from '@/lib/api-response'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendInvitationSchema } from '@/lib/validations'
import { randomBytes } from 'crypto'
import { NextRequest } from 'next/server'

function getBaseUrl(request: NextRequest): string {
  // First, try to use the explicitly configured URL
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // On Vercel, use the automatic environment variables
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback: extract from request headers (works for any deployment)
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  if (host) {
    return `${protocol}://${host}`
  }

  // Last resort fallback
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    const userId = user.userId

    const body = await request.json()
    const validatedData = sendInvitationSchema.parse(body)

    // Get restaurant with opening hours
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
      include: {
        openingHours: true,
      },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    // Check if restaurant has opening hours configured
    const openDays = restaurant.openingHours.filter((h) => h.isOpen)
    if (restaurant.openingHours.length === 0 || openDays.length === 0) {
      return errorResponse(
        'Cannot send invitations until you have configured your opening hours. Go to Settings → Opening Hours.',
        400
      )
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

    const baseUrl = getBaseUrl(request)

    return successResponse(
      {
        invitation: updatedInvitation,
        webFormUrl: `${baseUrl}/reservation-form/${webFormToken}`,
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

