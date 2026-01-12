import { errorResponse, successResponse, unauthorizedResponse } from '@/lib/api-response'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const updateFloorPlanSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  order: z.number().int().min(0).optional(),
  width: z.number().int().min(400).max(2000).optional(),
  height: z.number().int().min(300).max(1500).optional(),
  elements: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
})

// Helper to get all table IDs from all active floor plans
async function getAllTableIds(restaurantId: string, excludeFloorPlanId?: string): Promise<string[]> {
  const floorPlans = await prisma.floorPlan.findMany({
    where: { 
      restaurantId, 
      isActive: true,
      ...(excludeFloorPlanId && { id: { not: excludeFloorPlanId } }),
    },
  })
  
  return floorPlans.flatMap(fp => 
    (fp.elements as any[])
      .filter((el: any) => el.type === 'table' && el.tableId)
      .map((el: any) => el.tableId as string)
  )
}

// Helper to migrate reservations from deleted tables to available ones
async function migrateReservationsFromDeletedTables(
  restaurantId: string,
  deletedTableIds: string[],
  availableTableIds: string[]
): Promise<{ migrated: number; blockedByOngoing: string[] }> {
  const now = new Date()
  
  // Find reservations on deleted tables
  const reservationsOnDeletedTables = await prisma.reservation.findMany({
    where: {
      restaurantId,
      tableId: { in: deletedTableIds },
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
    orderBy: { timeFrom: 'asc' },
  })

  // Check for ongoing reservations (currently seated or happening now)
  const ongoingReservations = reservationsOnDeletedTables.filter(r => {
    const isOngoing = r.timeFrom <= now && r.timeTo >= now
    const isSeated = r.status === 'SEATED'
    return isOngoing || isSeated
  })

  if (ongoingReservations.length > 0) {
    // Return the table IDs that have ongoing reservations - can't delete these
    const tableIds = ongoingReservations.map(r => r.tableId).filter((id): id is string => id !== null)
    const blockedTableIds = Array.from(new Set(tableIds))
    return { migrated: 0, blockedByOngoing: blockedTableIds }
  }

  // Migrate future reservations to available tables
  const futureReservations = reservationsOnDeletedTables.filter(r => r.timeFrom > now)
  let migratedCount = 0

  for (const reservation of futureReservations) {
    // Find an available table for this time slot
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        restaurantId,
        tableId: { in: availableTableIds },
        status: { in: ['CONFIRMED', 'PENDING', 'SEATED'] },
        OR: [
          {
            timeFrom: { lt: reservation.timeTo },
            timeTo: { gt: reservation.timeFrom },
          },
        ],
      },
      select: { tableId: true },
    })

    const occupiedTableIds = new Set(conflictingReservations.map(r => r.tableId))
    const freeTable = availableTableIds.find(id => !occupiedTableIds.has(id))

    if (freeTable) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { tableId: freeTable },
      })
      migratedCount++
    } else {
      // No table available - set to null for auto-assignment later
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { tableId: null },
      })
      migratedCount++
    }
  }

  return { migrated: migratedCount, blockedByOngoing: [] }
}

// GET - Fetch a single floor plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    const floorPlan = await prisma.floorPlan.findFirst({
      where: { 
        id,
        restaurantId: restaurant.id,
      },
    })

    if (!floorPlan) {
      return errorResponse('Floor plan not found', 404)
    }

    return successResponse(floorPlan, 'Floor plan fetched successfully')
  } catch (error: any) {
    console.error('Get floor plan error:', error)
    return errorResponse('Failed to fetch floor plan', 500)
  }
}

// PATCH - Update a floor plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    const existingFloorPlan = await prisma.floorPlan.findFirst({
      where: { 
        id,
        restaurantId: restaurant.id,
      },
    })

    if (!existingFloorPlan) {
      return errorResponse('Floor plan not found', 404)
    }

    const body = await request.json()
    const validatedData = updateFloorPlanSchema.parse(body)

    // If elements are being updated, check for deleted tables
    if (validatedData.elements) {
      const oldTableIds = (existingFloorPlan.elements as any[])
        .filter((el: any) => el.type === 'table' && el.tableId)
        .map((el: any) => el.tableId as string)

      const newTableIds = validatedData.elements
        .filter((el: any) => el.type === 'table' && el.tableId)
        .map((el: any) => el.tableId as string)

      const deletedTableIds = oldTableIds.filter(id => !newTableIds.includes(id))

      if (deletedTableIds.length > 0) {
        // Get all table IDs from other floor plans
        const otherFloorPlanTableIds = await getAllTableIds(restaurant.id, id)
        const allAvailableTableIds = Array.from(new Set([...newTableIds, ...otherFloorPlanTableIds]))

        // Check for ongoing reservations and migrate future ones
        const { blockedByOngoing } = await migrateReservationsFromDeletedTables(
          restaurant.id,
          deletedTableIds,
          allAvailableTableIds
        )

        if (blockedByOngoing.length > 0) {
          return errorResponse(
            `Cannot remove tables ${blockedByOngoing.join(', ')} - they have ongoing reservations. Please wait until those reservations are completed.`,
            400
          )
        }
      }
    }

    const updatedFloorPlan = await prisma.floorPlan.update({
      where: { id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.order !== undefined && { order: validatedData.order }),
        ...(validatedData.width !== undefined && { width: validatedData.width }),
        ...(validatedData.height !== undefined && { height: validatedData.height }),
        ...(validatedData.elements !== undefined && { elements: validatedData.elements }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
    })

    // Sync table IDs to restaurant's tableLayout array
    if (validatedData.elements) {
      const allFloorPlans = await prisma.floorPlan.findMany({
        where: { restaurantId: restaurant.id, isActive: true },
      })
      
      const allTableIds = allFloorPlans.flatMap(fp => 
        (fp.elements as any[])
          .filter((el: any) => el.type === 'table' && el.tableId)
          .map((el: any) => el.tableId)
      )
      
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { 
          tableLayout: Array.from(new Set(allTableIds)),
          hasVisualLayout: allTableIds.length > 0,
        },
      })
    }

    return successResponse(updatedFloorPlan, 'Floor plan updated successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Update floor plan error:', error)
    return errorResponse('Failed to update floor plan', 500)
  }
}

// DELETE - Delete a floor plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return unauthorizedResponse()
    }

    const { id } = await params

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    })

    if (!restaurant) {
      return errorResponse('Restaurant not found', 404)
    }

    const existingFloorPlan = await prisma.floorPlan.findFirst({
      where: { 
        id,
        restaurantId: restaurant.id,
      },
    })

    if (!existingFloorPlan) {
      return errorResponse('Floor plan not found', 404)
    }

    // Get table IDs from this floor plan
    const floorPlanTableIds = (existingFloorPlan.elements as any[])
      .filter((el: any) => el.type === 'table' && el.tableId)
      .map((el: any) => el.tableId as string)

    if (floorPlanTableIds.length > 0) {
      // Get all table IDs from other floor plans
      const otherFloorPlanTableIds = await getAllTableIds(restaurant.id, id)

      // Check for ongoing reservations and migrate future ones
      const { blockedByOngoing } = await migrateReservationsFromDeletedTables(
        restaurant.id,
        floorPlanTableIds,
        otherFloorPlanTableIds
      )

      if (blockedByOngoing.length > 0) {
        return errorResponse(
          `Cannot delete floor plan - tables ${blockedByOngoing.join(', ')} have ongoing reservations. Please wait until those reservations are completed.`,
          400
        )
      }
    }

    await prisma.floorPlan.delete({
      where: { id },
    })

    // Update tableLayout to only include tables from remaining floor plans
    const allFloorPlans = await prisma.floorPlan.findMany({
      where: { restaurantId: restaurant.id, isActive: true },
    })
    
    const allTableIds = allFloorPlans.flatMap(fp => 
      (fp.elements as any[])
        .filter((el: any) => el.type === 'table' && el.tableId)
        .map((el: any) => el.tableId)
    )
    
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { 
        tableLayout: Array.from(new Set(allTableIds)),
        hasVisualLayout: allTableIds.length > 0,
      },
    })

    return successResponse(null, 'Floor plan deleted successfully')
  } catch (error: any) {
    console.error('Delete floor plan error:', error)
    return errorResponse('Failed to delete floor plan', 500)
  }
}
