import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { z } from 'zod'

const onboardingSchema = z.object({
  description: z.string().nullable().optional(),
  cuisines: z.array(z.string()).optional(),
  logoUrl: z.string().nullable().optional(),
  photos: z.array(z.string()).max(5, 'Maximum 5 photos allowed').optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
})

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    const userId = user.userId

    const body = await request.json()
    const validatedData = onboardingSchema.parse(body)

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.cuisines !== undefined && { cuisines: validatedData.cuisines }),
        ...(validatedData.logoUrl !== undefined && { logoUrl: validatedData.logoUrl }),
        ...(validatedData.photos !== undefined && { photos: validatedData.photos }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
        ...(validatedData.email !== undefined && { 
          email: validatedData.email === '' ? null : validatedData.email 
        }),
      },
    })

    return successResponse(updatedRestaurant, 'Profile updated successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Onboarding update error:', error)
    return errorResponse('Failed to update profile', 500)
  }
}
