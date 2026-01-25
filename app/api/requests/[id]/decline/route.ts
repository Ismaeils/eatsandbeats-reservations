import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { sendDeclineEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const reason = body.reason || undefined

    // Find the request
    const restaurantRequest = await prisma.restaurantRequest.findUnique({
      where: { id },
    })

    if (!restaurantRequest) {
      return errorResponse('Request not found', 404)
    }

    if (restaurantRequest.status !== 'PENDING') {
      return errorResponse('This request has already been processed', 400)
    }

    // Update the request
    const updatedRequest = await prisma.restaurantRequest.update({
      where: { id },
      data: {
        status: 'DECLINED',
        declineReason: reason,
      },
    })

    // Send decline email
    const emailResult = await sendDeclineEmail(
      restaurantRequest.email,
      restaurantRequest.contactName,
      reason
    )

    if (!emailResult.success) {
      console.error('Failed to send decline email:', emailResult.error)
      // Log but don't fail
    }

    return successResponse(
      { id: updatedRequest.id },
      'Request declined successfully'
    )
  } catch (error) {
    console.error('Error declining request:', error)
    return errorResponse('Failed to decline request', 500)
  }
}
