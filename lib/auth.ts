import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { UserRole } from '@prisma/client'

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

export type UserType = 'admin' | 'restaurant'

export interface JWTPayload {
  userId: string
  email: string
  userType: UserType
  role?: UserRole // Optional - only for restaurant users
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  // Type assertion to handle jsonwebtoken overload resolution
  return (jwt.sign as any)(
    payload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    // Use the same JWT_SECRET constant that was used to generate the token
    const secret = JWT_SECRET
    if (!secret || secret === 'your-secret-key') {
      console.error('[Auth] JWT_SECRET is not properly configured')
      return null
    }
    const decoded = jwt.verify(token, secret) as JWTPayload
    return decoded
  } catch (error: any) {
    console.error('[Auth] Token verification error:', error.message)
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

export async function getCurrentAdmin(request: NextRequest): Promise<JWTPayload | null> {
  const user = await getCurrentUser(request)
  if (!user) return null
  if (user.userType !== 'admin') return null
  return user
}

export async function getCurrentRestaurantUser(request: NextRequest): Promise<JWTPayload | null> {
  const user = await getCurrentUser(request)
  if (!user) return null
  if (user.userType !== 'restaurant') return null
  return user
}

export function isAdmin(payload: JWTPayload): boolean {
  return payload.userType === 'admin'
}

export function isRestaurant(payload: JWTPayload): boolean {
  return payload.userType === 'restaurant'
}
