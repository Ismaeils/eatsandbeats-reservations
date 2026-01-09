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

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user and restaurant in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.restaurantUser.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
        },
      })

      const restaurant = await tx.restaurant.create({
        data: {
          userId: user.id,
          name: validatedData.restaurantName,
          address: validatedData.address,
          reservationDeposit: validatedData.reservationDeposit,
          averageSeatingTime: validatedData.averageSeatingTime,
          tableLayout: validatedData.tableLayout,
          cuisines: [],
        },
      })

      return { user, restaurant }
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

