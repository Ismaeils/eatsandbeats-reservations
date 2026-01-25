import { errorResponse, successResponse } from '@/lib/api-response'
import { generateToken, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find admin user in AdminUser table
    const admin = await prisma.adminUser.findUnique({
      where: { email: validatedData.email },
    })

    if (!admin) {
      return errorResponse('Invalid email or password', 401)
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, admin.password)
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401)
    }

    // Generate JWT token with userType
    const token = generateToken({
      userId: admin.id,
      email: admin.email,
      userType: 'admin',
    })

    return successResponse(
      {
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
        token,
      },
      'Admin login successful'
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Admin login error:', error)
    return errorResponse('Login failed', 500)
  }
}
