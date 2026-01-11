import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.restaurantUser.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return errorResponse('User with this email already exists', 409)
    }

    // Validate that floor plan has at least one table
    const tables = validatedData.floorPlan.elements.filter(
      (el) => el.type === 'table' && el.tableId
    )
    if (tables.length === 0) {
      return errorResponse('You must add at least one table to your floor plan', 400)
    }

    // Validate that at least one day has opening hours
    const openDays = validatedData.openingHours.filter((h) => h.isOpen)
    if (openDays.length === 0) {
      return errorResponse('You must have at least one open day in your opening hours', 400)
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Extract table IDs from floor plan
    const tableLayout = tables.map((el) => el.tableId as string)

    // Create user, restaurant, opening hours, and floor plan in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user
      const user = await tx.restaurantUser.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
        },
      })

      // Create restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          userId: user.id,
          name: validatedData.restaurantName,
          address: validatedData.address,
          reservationDeposit: validatedData.reservationDeposit,
          averageSeatingTime: validatedData.averageSeatingTime,
          tableLayout,
          cuisines: [],
          hasVisualLayout: true,
        },
      })

      // Create opening hours for all 7 days
      for (const hours of validatedData.openingHours) {
        await tx.openingHours.create({
          data: {
            restaurantId: restaurant.id,
            dayOfWeek: hours.dayOfWeek,
            isOpen: hours.isOpen,
            openTime: hours.openTime,
            closeTime: hours.closeTime,
          },
        })
      }

      // Create floor plan
      const floorPlan = await tx.floorPlan.create({
        data: {
          restaurantId: restaurant.id,
          name: validatedData.floorPlan.name || 'Main Floor',
          order: 0,
          width: validatedData.floorPlan.width || 800,
          height: validatedData.floorPlan.height || 600,
          elements: validatedData.floorPlan.elements,
          isActive: true,
        },
      })

      return { user, restaurant, floorPlan }
    })

    // Generate JWT token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
    })

    return successResponse(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        restaurant: {
          id: result.restaurant.id,
          name: result.restaurant.name,
        },
        token,
      },
      'Registration successful'
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Registration error:', error)
    return errorResponse('Registration failed', 500)
  }
}
