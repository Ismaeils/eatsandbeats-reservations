import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const exceptionalDateSchema = z.object({
  date: z.string(), // ISO date string
  isOpen: z.boolean(),
  openTime: z.string().nullable().optional(),
  closeTime: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
})

// GET: Fetch exceptional dates
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
      include: { exceptionalDates: true },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    // Return dates sorted by date
    const dates = restaurant.exceptionalDates.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return successResponse(dates)
  } catch (error: any) {
    console.error('Get exceptional dates error:', error)
    return errorResponse(error.message || 'Failed to fetch exceptional dates', 500)
  }
}

// POST: Add or update exceptional date
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const validatedData = exceptionalDateSchema.parse(body)

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    const date = new Date(validatedData.date)

    const exceptionalDate = await prisma.exceptionalDate.upsert({
      where: {
        restaurantId_date: {
          restaurantId: restaurant.id,
          date,
        },
      },
      create: {
        restaurantId: restaurant.id,
        date,
        isOpen: validatedData.isOpen,
        openTime: validatedData.openTime || null,
        closeTime: validatedData.closeTime || null,
        note: validatedData.note || null,
      },
      update: {
        isOpen: validatedData.isOpen,
        openTime: validatedData.openTime || null,
        closeTime: validatedData.closeTime || null,
        note: validatedData.note || null,
      },
    })

    return successResponse(exceptionalDate, 'Exceptional date saved successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Save exceptional date error:', error)
    return errorResponse(error.message || 'Failed to save exceptional date', 500)
  }
}

// DELETE: Remove exceptional date
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')

    if (!dateStr) {
      return errorResponse('Date is required', 400)
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    const date = new Date(dateStr)

    await prisma.exceptionalDate.delete({
      where: {
        restaurantId_date: {
          restaurantId: restaurant.id,
          date,
        },
      },
    })

    return successResponse(null, 'Exceptional date removed successfully')
  } catch (error: any) {
    console.error('Delete exceptional date error:', error)
    return errorResponse(error.message || 'Failed to delete exceptional date', 500)
  }
}
