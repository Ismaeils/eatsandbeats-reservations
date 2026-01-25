import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

const registerWithCodeSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  restaurantName: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  reservationDeposit: z.number().min(0).optional().default(0),
  averageSeatingTime: z.number().min(15).max(300).optional().default(60),
  maxSimultaneousReservations: z.number().min(1).max(1000).optional().default(10),
  autoConfirmReservations: z.boolean().optional().default(false),
  logoUrl: z.string().url().optional(),
  country: z.string().optional().default('UAE'),
  language: z.string().optional().default('en'),
  currency: z.string().optional().default('AED'),
  openingHours: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    isOpen: z.boolean(),
    openTime: z.string().nullable(),
    closeTime: z.string().nullable(),
  })),
})

// GET - Validate approval code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const restaurantRequest = await prisma.restaurantRequest.findUnique({
      where: { approvalCode: code },
    })

    if (!restaurantRequest) {
      return errorResponse('Invalid or expired registration link', 404)
    }

    if (restaurantRequest.status !== 'APPROVED') {
      return errorResponse('This registration link is no longer valid', 400)
    }

    if (restaurantRequest.approvalCodeUsed) {
      return errorResponse('This registration link has already been used', 400)
    }

    return successResponse({
      email: restaurantRequest.email,
      contactName: restaurantRequest.contactName,
      valid: true,
    })
  } catch (error) {
    console.error('Error validating code:', error)
    return errorResponse('Failed to validate registration link', 500)
  }
}

// POST - Complete registration with approval code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const validatedData = registerWithCodeSchema.parse(body)

    // Validate the approval code
    const restaurantRequest = await prisma.restaurantRequest.findUnique({
      where: { approvalCode: code },
    })

    if (!restaurantRequest) {
      return errorResponse('Invalid or expired registration link', 404)
    }

    if (restaurantRequest.status !== 'APPROVED') {
      return errorResponse('This registration link is no longer valid', 400)
    }

    if (restaurantRequest.approvalCodeUsed) {
      return errorResponse('This registration link has already been used', 400)
    }

    // Check if user already exists
    const existingUser = await prisma.restaurantUser.findUnique({
      where: { email: restaurantRequest.email },
    })

    if (existingUser) {
      return errorResponse('An account with this email already exists', 409)
    }

    // Validate opening hours
    const openDays = validatedData.openingHours.filter((h) => h.isOpen)
    if (openDays.length === 0) {
      return errorResponse('You must have at least one open day', 400)
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user, restaurant, and mark code as used in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create user
      const user = await tx.restaurantUser.create({
        data: {
          email: restaurantRequest.email,
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
          maxSimultaneousReservations: validatedData.maxSimultaneousReservations,
          autoConfirmReservations: validatedData.autoConfirmReservations,
          logoUrl: validatedData.logoUrl || null,
          country: validatedData.country,
          language: validatedData.language,
          currency: validatedData.currency,
          cuisines: [],
          isPublished: false, // Start unpublished
        },
      })

      // Create opening hours
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

      // Mark approval code as used
      await tx.restaurantRequest.update({
        where: { id: restaurantRequest.id },
        data: { approvalCodeUsed: true },
      })

      return { user, restaurant }
    })

    // Generate JWT token with userType
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      userType: 'restaurant',
      role: result.user.role,
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
