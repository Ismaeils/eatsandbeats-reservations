import { errorResponse, successResponse } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// GET: Fetch public list of restaurants with search, filter, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const cuisine = searchParams.get('cuisine') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Build the where clause
    const where: any = {}

    // Search by restaurant name
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    // Filter by cuisine
    if (cuisine) {
      where.cuisines = {
        has: cuisine,
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.restaurant.count({ where })

    // Fetch restaurants
    const restaurants = await prisma.restaurant.findMany({
      where,
      select: {
        id: true,
        name: true,
        logoUrl: true,
        address: true,
        cuisines: true,
        reservationDeposit: true,
        openingHours: {
          select: {
            dayOfWeek: true,
            isOpen: true,
            openTime: true,
            closeTime: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    })

    // Get all unique cuisines for filters
    const allCuisines = await prisma.restaurant.findMany({
      select: {
        cuisines: true,
      },
    })
    
    const uniqueCuisines = Array.from(new Set(allCuisines.flatMap(r => r.cuisines))).sort()

    return successResponse({
      restaurants: restaurants.map(r => ({
        id: r.id,
        name: r.name,
        logoUrl: r.logoUrl,
        address: r.address,
        cuisines: r.cuisines,
        // Extract district from address (simplified - takes the part after the first comma)
        district: r.address.split(',')[1]?.trim() || 'City Center',
        // Price range based on deposit (simplified logic)
        priceRange: r.reservationDeposit > 50 ? '$$$$' : r.reservationDeposit > 30 ? '$$$' : r.reservationDeposit > 10 ? '$$' : '$',
        // Rating placeholder - will be implemented later
        rating: null,
        // Check if restaurant is currently open
        isOpen: checkIfOpen(r.openingHours),
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + restaurants.length < totalCount,
      },
      cuisines: uniqueCuisines,
    })
  } catch (error: any) {
    console.error('Get public restaurants error:', error)
    return errorResponse(error.message || 'Failed to fetch restaurants', 500)
  }
}

// Helper function to check if restaurant is currently open
function checkIfOpen(openingHours: { dayOfWeek: number; isOpen: boolean; openTime: string | null; closeTime: string | null }[]): boolean {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const todayHours = openingHours.find(h => h.dayOfWeek === dayOfWeek)
  
  if (!todayHours || !todayHours.isOpen || !todayHours.openTime || !todayHours.closeTime) {
    return false
  }

  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime
}
