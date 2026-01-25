import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response'
import { z } from 'zod'

const updateReservationSchema = z.object({
  timeFrom: z.string().optional(),
  timeTo: z.string().optional(),
  numberOfPeople: z.number().int().min(1).max(100).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    const userId = user.userId

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: params.id,
        restaurantId: restaurant.id,
      },
      include: {
        invitation: {
          select: {
            phoneNumber: true,
            status: true,
          },
        },
      },
    })

    if (!reservation) {
      return notFoundResponse()
    }

    return successResponse(reservation)
  } catch (error) {
    console.error('Get reservation error:', error)
    return errorResponse('Failed to fetch reservation', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }
    const userId = user.userId

    const body = await request.json()
    const validatedData = updateReservationSchema.parse(body)

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    // Verify reservation belongs to restaurant
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        id: params.id,
        restaurantId: restaurant.id,
      },
    })

    if (!existingReservation) {
      return notFoundResponse()
    }

    const updateData: any = {}
    if (validatedData.timeFrom) {
      updateData.timeFrom = new Date(validatedData.timeFrom)
    }
    if (validatedData.timeTo) {
      updateData.timeTo = new Date(validatedData.timeTo)
    }
    if (validatedData.numberOfPeople !== undefined) {
      updateData.numberOfPeople = validatedData.numberOfPeople
    }
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: updateData,
    })

    return successResponse(updatedReservation, 'Reservation updated')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Update reservation error:', error)
    return errorResponse('Failed to update reservation', 500)
  }
}
