'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RestaurantConfigPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Redirect to the appropriate settings page based on tab parameter
    const tab = searchParams.get('tab')
    
    switch (tab) {
      case 'hours':
        router.replace('/restaurant/settings/hours')
        break
      case 'exceptions':
        router.replace('/restaurant/settings/exceptions')
        break
      case 'floorplan':
        router.replace('/restaurant/settings/floor-plan')
        break
      default:
        router.replace('/restaurant/settings/general')
    }
  }, [router, searchParams])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  )
}
