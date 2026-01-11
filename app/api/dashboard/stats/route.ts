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
    const hasTables = restaurant.tableLayout.length > 0

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

    // Get current reservations (today)
    const currentReservations = await prisma.reservation.findMany({
      where: {
        restaurantId: restaurant.id,
        timeFrom: { lte: todayEnd },
        timeTo: { gte: todayStart },
        status: { in: ['CONFIRMED', 'SEATED'] },
      },
      select: {
        id: true,
        tableId: true,
        timeFrom: true,
        timeTo: true,
        status: true,
      },
    })

    // Calculate table occupancy
    const occupiedTables = new Set(
      currentReservations.map((r: any) => r.tableId).filter(Boolean)
    )
    const availableTables = restaurant.tableLayout.filter(
      (table: string) => !occupiedTables.has(table)
    )

    return successResponse({
      reservations: {
        today: todayCount,
        week: weekCount,
        month: monthCount,
        total: totalCount,
      },
      tables: {
        total: restaurant.tableLayout.length,
        occupied: occupiedTables.size,
        available: availableTables.length,
        occupiedTableIds: Array.from(occupiedTables),
        availableTableIds: availableTables,
      },
      currentReservations: currentReservations,
      setup: {
        hasOpeningHours,
        hasTables,
        isComplete: hasOpeningHours && hasTables,
      },
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return errorResponse('Failed to fetch dashboard stats', 500)
  }
}

