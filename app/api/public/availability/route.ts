import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET: Fetch availability info for a restaurant (public endpoint for guests)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return errorResponse('Invitation token is required', 400)
    }

    // Find the invitation and restaurant
    const invitation = await prisma.reservationInvitation.findUnique({
      where: { webFormToken: token },
      include: {
        restaurant: {
          include: {
            openingHours: true,
            exceptionalDates: {
              where: {
                date: {
                  gte: new Date(),
                },
              },
            },
          },
        },
      },
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

    const restaurant = invitation.restaurant

    return successResponse({
      restaurantName: restaurant.name,
      logoUrl: restaurant.logoUrl,
      reservationDuration: restaurant.reservationDuration || 120,
      slotGranularity: restaurant.slotGranularity || 15,
      maxSimultaneousReservations: restaurant.maxSimultaneousReservations,
      openingHours: restaurant.openingHours.map(h => ({
        dayOfWeek: h.dayOfWeek,
        isOpen: h.isOpen,
        openTime: h.openTime,
        closeTime: h.closeTime,
      })),
      exceptionalDates: restaurant.exceptionalDates.map(d => ({
        date: d.date.toISOString().split('T')[0],
        isOpen: d.isOpen,
        openTime: d.openTime,
        closeTime: d.closeTime,
        note: d.note,
      })),
    })
  } catch (error: any) {
    console.error('Get availability error:', error)
    return errorResponse(error.message || 'Failed to fetch availability', 500)
  }
}
