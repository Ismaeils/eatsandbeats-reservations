import { errorResponse, successResponse } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// GET: Fetch a specific restaurant's details and availability for public booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        openingHours: true,
        exceptionalDates: {
          where: {
            date: {
              gte: new Date(),
            },
          },
        },
        floorPlans: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    return successResponse({
      id: restaurant.id,
      name: restaurant.name,
      logoUrl: restaurant.logoUrl,
      address: restaurant.address,
      cuisines: restaurant.cuisines,
      reservationDeposit: restaurant.reservationDeposit,
      reservationDuration: restaurant.reservationDuration || 120,
      slotGranularity: restaurant.slotGranularity || 15,
      tableLayout: restaurant.tableLayout,
      hasVisualLayout: restaurant.hasVisualLayout,
      openingHours: restaurant.openingHours.map(h => ({
        dayOfWeek: h.dayOfWeek,
        isOpen: h.isOpen,
        openTime: h.openTime,
        closeTime: h.closeTime,
      })),
      exceptionalDates: restaurant.exceptionalDates.map(d => ({
        date: d.date.toISOString().split('T')[0],
        isOpen: d.isOpen,
        openTime: d.openTime,
        closeTime: d.closeTime,
        note: d.note,
      })),
      floorPlans: restaurant.floorPlans.map(fp => ({
        id: fp.id,
        name: fp.name,
        order: fp.order,
        width: fp.width,
        height: fp.height,
        elements: fp.elements,
      })),
    })
  } catch (error: any) {
    console.error('Get restaurant details error:', error)
    return errorResponse(error.message || 'Failed to fetch restaurant details', 500)
  }
}
