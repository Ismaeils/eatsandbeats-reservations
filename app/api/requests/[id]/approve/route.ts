import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { sendApprovalEmail } from '@/lib/email'
import crypto from 'crypto'

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

    // Generate unique approval code
    const approvalCode = crypto.randomBytes(32).toString('hex')

    // Update the request
    const updatedRequest = await prisma.restaurantRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvalCode,
      },
    })

    // Send approval email with registration link
    const emailResult = await sendApprovalEmail(
      restaurantRequest.email,
      restaurantRequest.contactName,
      approvalCode
    )

    if (!emailResult.success) {
      console.error('Failed to send approval email:', emailResult.error)
      // Log but don't fail - the request is approved
    }

    return successResponse(
      { id: updatedRequest.id, approvalCode },
      'Request approved successfully'
    )
  } catch (error) {
    console.error('Error approving request:', error)
    return errorResponse('Failed to approve request', 500)
  }
}
