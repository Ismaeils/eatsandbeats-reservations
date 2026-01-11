import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET - Fetch floor plans for a restaurant (public access via invitation token)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invitationToken = searchParams.get('token')

    if (!invitationToken) {
      return errorResponse('Invitation token is required', 400)
    }

    // Find the invitation and get restaurant info
    const invitation = await prisma.reservationInvitation.findUnique({
      where: { webFormToken: invitationToken },
      select: {
        restaurantId: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            hasVisualLayout: true,
          },
        },
      },
    })

    if (!invitation || !invitation.restaurant) {
      return errorResponse('Invalid invitation token or restaurant not found', 404)
    }

    // If restaurant doesn't have visual layout, return empty
    if (!invitation.restaurant.hasVisualLayout) {
      return successResponse({
        hasVisualLayout: false,
        floorPlans: [],
      }, 'No visual layout configured')
    }

    // Get active floor plans
    const floorPlans = await prisma.floorPlan.findMany({
      where: { 
        restaurantId: invitation.restaurantId,
        isActive: true,
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        order: true,
        width: true,
        height: true,
        elements: true,
      },
    })

    return successResponse({
      hasVisualLayout: true,
      restaurantName: invitation.restaurant.name,
      floorPlans,
    }, 'Floor plans fetched successfully')
  } catch (error: any) {
    console.error('Get public floor plans error:', error)
    return errorResponse('Failed to fetch floor plans', 500)
  }
}
