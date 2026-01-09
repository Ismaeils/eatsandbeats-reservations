import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, hashPassword } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { resetPasswordSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    // Verify token
    const payload = verifyToken(validatedData.token)
    if (!payload) {
      return errorResponse('Invalid or expired reset token', 401)
    }

    // Find user
    const user = await prisma.restaurantUser.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password)

    // Update password
    await prisma.restaurantUser.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return successResponse(
      { message: 'Password reset successful' },
      'Password has been reset'
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400)
    }
    console.error('Reset password error:', error)
    return errorResponse('Failed to reset password', 500)
  }
}

