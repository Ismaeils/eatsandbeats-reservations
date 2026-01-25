import { errorResponse, successResponse, unauthorizedResponse } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { endOfDay, startOfDay, subDays } from 'date-fns'
import { NextRequest } from 'next/server'

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
      include: {
        openingHours: true,
      },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    // Check setup status
    const hasOpeningHours = restaurant.openingHours.length > 0 && 
      restaurant.openingHours.some((h) => h.isOpen)

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekAgo = subDays(now, 7)
    const monthAgo = subDays(now, 30)

    // Get reservations count over time
    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      prisma.reservation.count({
        where: {
          restaurantId: restaurant.id,
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.reservation.count({
        where: {
          restaurantId: restaurant.id,
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.reservation.count({
        where: {
          restaurantId: restaurant.id,
          createdAt: { gte: monthAgo },
        },
      }),
      prisma.reservation.count({
        where: { restaurantId: restaurant.id },
      }),
    ])

    return successResponse({
      reservations: {
        today: todayCount,
        week: weekCount,
        month: monthCount,
        total: totalCount,
      },
      setup: {
        hasOpeningHours,
        isComplete: hasOpeningHours,
      },
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return errorResponse('Failed to fetch dashboard stats', 500)
  }
}
