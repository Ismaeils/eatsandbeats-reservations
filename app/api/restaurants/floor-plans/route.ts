import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { z } from 'zod'

const floorPlanSchema = z.object({
  name: z.string().min(1).max(50),
  order: z.number().int().min(0).default(0),
  width: z.number().int().min(400).max(2000).default(800),
  height: z.number().int().min(300).max(1500).default(600),
  elements: z.array(z.any()).default([]),
  isActive: z.boolean().default(true),
})

// GET - Fetch all floor plans for the restaurant
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    const floorPlans = await prisma.floorPlan.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { order: 'asc' },
    })

    return successResponse(floorPlans, 'Floor plans fetched successfully')
  } catch (error: any) {
    console.error('Get floor plans error:', error)
    return errorResponse('Failed to fetch floor plans', 500)
  }
}

// POST - Create a new floor plan
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    const body = await request.json()
    const validatedData = floorPlanSchema.parse(body)

    // Get the next order number
    const maxOrder = await prisma.floorPlan.aggregate({
      where: { restaurantId: restaurant.id },
      _max: { order: true },
    })
    const nextOrder = (maxOrder._max.order ?? -1) + 1

    const floorPlan = await prisma.floorPlan.create({
      data: {
        restaurantId: restaurant.id,
        name: validatedData.name,
        order: validatedData.order || nextOrder,
        width: validatedData.width,
        height: validatedData.height,
        elements: validatedData.elements,
        isActive: validatedData.isActive,
      },
    })

    // Enable visual layout on restaurant if this is the first floor plan
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { hasVisualLayout: true },
    })

    return successResponse(floorPlan, 'Floor plan created successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Create floor plan error:', error)
    return errorResponse('Failed to create floor plan', 500)
  }
}
