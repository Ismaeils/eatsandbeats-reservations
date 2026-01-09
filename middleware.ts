import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  // Note: Token verification is done in API routes (Node.js runtime)
  // because middleware runs on Edge runtime which doesn't support Node.js crypto module
  const publicRoutes = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/reservations/create', // Guest endpoint
  ]
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  
  // For protected routes, we just pass through - verification happens in API routes
  // This allows API routes to run on Node.js runtime where jsonwebtoken works
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}

