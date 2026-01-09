import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication in API route (Node.js runtime)
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    
    const userId = user.userId

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    const where: any = {
      restaurantId: restaurant.id,
    }

    if (status) {
      where.status = status
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      where.timeFrom = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { timeFrom: 'asc' },
      include: {
        invitation: {
          select: {
            phoneNumber: true,
            status: true,
          },
        },
      },
    })

    return successResponse(reservations)
  } catch (error) {
    console.error('Get reservations error:', error)
    return errorResponse('Failed to fetch reservations', 500)
  }
}

