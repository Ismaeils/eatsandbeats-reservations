import { errorResponse, successResponse } from '@/lib/api-response'
import { generateToken, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find user in RestaurantUser table
    const user = await prisma.restaurantUser.findUnique({
      where: { email: validatedData.email },
      include: { restaurant: true },
    })

    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401)
    }

    // Generate JWT token with userType
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userType: 'restaurant',
      role: user.role,
    })

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        restaurant: user.restaurant
          ? {
              id: user.restaurant.id,
              name: user.restaurant.name,
            }
          : null,
        token,
      },
      'Login successful'
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Login error:', error)
    return errorResponse('Login failed', 500)
  }
}

