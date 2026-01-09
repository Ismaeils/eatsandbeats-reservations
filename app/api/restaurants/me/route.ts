import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    const userId = user.userId

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    return successResponse(restaurant)
  } catch (error) {
    console.error('Get restaurant error:', error)
    return errorResponse('Failed to fetch restaurant', 500)
  }
}

