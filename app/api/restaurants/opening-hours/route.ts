import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const openingHoursSchema = z.object({
  hours: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    isOpen: z.boolean(),
    openTime: z.string().nullable(),
    closeTime: z.string().nullable(),
  })),
})

// GET: Fetch opening hours
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
      include: { openingHours: true },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    // Return hours sorted by day
    const hours = restaurant.openingHours.sort((a, b) => a.dayOfWeek - b.dayOfWeek)

    return successResponse(hours)
  } catch (error: any) {
    console.error('Get opening hours error:', error)
    return errorResponse(error.message || 'Failed to fetch opening hours', 500)
  }
}

// POST: Update opening hours
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const validatedData = openingHoursSchema.parse(body)

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    // Upsert each day's hours
    const operations = validatedData.hours.map(hour => 
      prisma.openingHours.upsert({
        where: {
          restaurantId_dayOfWeek: {
            restaurantId: restaurant.id,
            dayOfWeek: hour.dayOfWeek,
          },
        },
        create: {
          restaurantId: restaurant.id,
          dayOfWeek: hour.dayOfWeek,
          isOpen: hour.isOpen,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
        },
        update: {
          isOpen: hour.isOpen,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
        },
      })
    )

    await prisma.$transaction(operations)

    const updatedHours = await prisma.openingHours.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { dayOfWeek: 'asc' },
    })

    return successResponse(updatedHours, 'Opening hours updated successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Update opening hours error:', error)
    return errorResponse(error.message || 'Failed to update opening hours', 500)
  }
}
