import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { forgotPasswordSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    // Find user
    const user = await prisma.restaurantUser.findUnique({
      where: { email: validatedData.email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(
        { message: 'If an account exists, a password reset link has been sent' },
        'Password reset email sent'
      )
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = generateToken({
      userId: user.id,
      email: user.email,
      userType: 'restaurant',
    })

    // TODO: Send email with reset link
    // For now, we'll just return success
    // In production, send email with link: /reset-password?token=${resetToken}

    console.log('Password reset token for', user.email, ':', resetToken)

    return successResponse(
      { 
        message: 'If an account exists, a password reset link has been sent',
        // In development, include token. Remove in production
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
      },
      'Password reset email sent'
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Forgot password error:', error)
    return errorResponse('Failed to process request', 500)
  }
}

