import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { updateRestaurantConfigSchema } from '@/lib/validations'

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
        ...(validatedData.tableLayout !== undefined && {
          tableLayout: validatedData.tableLayout,
        }),
        ...(validatedData.cuisines !== undefined && {
          cuisines: validatedData.cuisines,
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

