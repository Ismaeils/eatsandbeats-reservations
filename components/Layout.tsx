'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import UserMenu from './UserMenu'
import ThemeToggle from './ThemeToggle'
import apiClient from '@/lib/api-client'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token && !pathname.startsWith('/login') && !pathname.startsWith('/register') && !pathname.startsWith('/forgot-password') && !pathname.startsWith('/reservation-form')) {
      router.push('/login')
    } else if (token) {
      // Decode token to get user info (simple implementation)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
        // Fetch restaurant info
        fetchRestaurant()
      } catch (e) {
        localStorage.removeItem('token')
        router.push('/login')
      }
    }
  }, [router, pathname])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const fetchRestaurant = async () => {
    try {
      const response = await apiClient.get('/restaurants/me') as any
      if (response?.success) {
        setRestaurant(response.data)
      }
    } catch (err) {
      // Silently fail - restaurant info is optional for nav
    }
  }

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'
  const isPublicPage = pathname.startsWith('/reservation-form') || pathname.startsWith('/reservation-success') || pathname.startsWith('/invitations/confirmed')

  if (isAuthPage || isPublicPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-2 sm:p-3 md:p-4">
      {/* Elevated App Container */}
      <div className="min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-32px)] bg-[var(--bg-card)] rounded-[25px] shadow-elevated overflow-hidden flex">
        
        {/* Sidebar - Desktop (always visible, not collapsible) */}
        <div className="hidden md:block w-64 flex-shrink-0 border-r border-[var(--border-color)]">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div 
              className="absolute inset-0 bg-black/50" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full">
              <Sidebar isMobile onClose={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-full overflow-hidden">
          {/* Top Bar */}
          <header className="flex-shrink-0 pt-6 px-6">
            <div className="flex items-center justify-between">
              {/* Left side - Mobile menu button */}
              <div className="flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-[20px] hover:bg-[var(--bg-hover)] transition-colors"
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Right side - Theme toggle & User menu */}
              <div className="flex items-center gap-2 sm:gap-4">
                <ThemeToggle />
                <UserMenu user={user} restaurant={restaurant} />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-[var(--bg-app)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
