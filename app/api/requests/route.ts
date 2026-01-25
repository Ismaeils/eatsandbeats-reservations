import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { sendRequestReceivedEmail } from '@/lib/email'
import { z } from 'zod'

const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
  contactName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(5, 'Please enter a valid phone number'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

// GET - Admin only: List all restaurant requests
export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return unauthorizedResponse()
    }

    const requests = await prisma.restaurantRequest.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(requests)
  } catch (error) {
    console.error('Error fetching requests:', error)
    return errorResponse('Failed to fetch requests', 500)
  }
}

// POST - Public: Submit a new restaurant request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = requestSchema.parse(body)

    // Check if a request with this email already exists and is pending
    const existingRequest = await prisma.restaurantRequest.findFirst({
      where: {
        email: validatedData.email,
        status: 'PENDING',
      },
    })

    if (existingRequest) {
      return errorResponse('A request with this email is already pending review', 400)
    }

    // Create the request
    const newRequest = await prisma.restaurantRequest.create({
      data: {
        email: validatedData.email,
        contactName: validatedData.contactName,
        phone: validatedData.phone,
        description: validatedData.description,
        status: 'PENDING',
      },
    })

    // Send greeting email
    const emailResult = await sendRequestReceivedEmail(
      validatedData.email,
      validatedData.contactName
    )

    if (!emailResult.success) {
      console.error('Failed to send greeting email:', emailResult.error)
      // Don't fail the request if email fails - log it and continue
    }

    return successResponse(
      { id: newRequest.id },
      'Your request has been submitted successfully'
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Error creating request:', error)
    return errorResponse('Failed to submit request', 500)
  }
}
