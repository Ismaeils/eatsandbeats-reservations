import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { z } from 'zod'

const updateRestaurantConfigSchema = z.object({
  logoUrl: z.string().optional(),
  reservationDeposit: z.number().min(0).optional(),
  averageSeatingTime: z.number().min(15).max(300).optional(),
  reservationDuration: z.number().min(15).max(480).optional(),
  slotGranularity: z.number().min(5).max(60).optional(),
  maxSimultaneousReservations: z.number().min(1).max(1000).optional(),
  autoConfirmReservations: z.boolean().optional(),
  cuisines: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    const userId = user.userId

    const body = await request.json()
    const validatedData = updateRestaurantConfigSchema.parse(body)

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        ...(validatedData.logoUrl !== undefined && { logoUrl: validatedData.logoUrl }),
        ...(validatedData.reservationDeposit !== undefined && {
          reservationDeposit: validatedData.reservationDeposit,
        }),
        ...(validatedData.averageSeatingTime !== undefined && {
          averageSeatingTime: validatedData.averageSeatingTime,
        }),
        ...(validatedData.reservationDuration !== undefined && {
          reservationDuration: validatedData.reservationDuration,
        }),
        ...(validatedData.slotGranularity !== undefined && {
          slotGranularity: validatedData.slotGranularity,
        }),
        ...(validatedData.maxSimultaneousReservations !== undefined && {
          maxSimultaneousReservations: validatedData.maxSimultaneousReservations,
        }),
        ...(validatedData.autoConfirmReservations !== undefined && {
          autoConfirmReservations: validatedData.autoConfirmReservations,
        }),
        ...(validatedData.cuisines !== undefined && {
          cuisines: validatedData.cuisines,
        }),
        ...(validatedData.isPublished !== undefined && {
          isPublished: validatedData.isPublished,
        }),
        ...(validatedData.country !== undefined && {
          country: validatedData.country,
        }),
        ...(validatedData.language !== undefined && {
          language: validatedData.language,
        }),
        ...(validatedData.currency !== undefined && {
          currency: validatedData.currency,
        }),
      },
    })

    return successResponse(updatedRestaurant, 'Restaurant configuration updated')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Update restaurant config error:', error)
    return errorResponse('Failed to update configuration', 500)
  }
}
