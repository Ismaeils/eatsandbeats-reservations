import { NextRequest } from 'next/server'
import { errorResponse } from '@/lib/api-response'

// Public registration is no longer available - redirect to partner-request flow
export async function POST(request: NextRequest) {
  return errorResponse(
    'Public registration is no longer available. Please submit a partnership request at /partner-request.',
    400
  )
}
