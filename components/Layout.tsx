'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Logo from './Logo'
import RestaurantLogo from './RestaurantLogo'
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

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen">
      {/* Floating Navbar Container */}
      <div className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="max-w-7xl mx-auto glass-card rounded-2xl px-6">
          <div className="flex justify-between items-center h-16">
            {/* Left side: Logos */}
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center">
                <Logo size="sm" />
              </Link>
              
              {/* Restaurant Logo - if available */}
              {restaurant && (
                <>
                  <div className="h-8 w-px bg-[var(--glass-border)]" />
                  <RestaurantLogo 
                    logoUrl={restaurant.logoUrl} 
                    restaurantName={restaurant.name}
                    size="sm"
                  />
                </>
              )}
            </div>

            {/* Right side: Navigation */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/dashboard"
                className={`text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/dashboard' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/reservations"
                className={`text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/reservations' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : ''
                }`}
              >
                Reservations
              </Link>
              <Link
                href="/restaurant/config"
                className={`text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/restaurant/config' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : ''
                }`}
              >
                Settings
              </Link>
              
              {/* Divider */}
              <div className="h-6 w-px bg-[var(--glass-border)] mx-1 hidden sm:block" />
              
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User info & Logout */}
              {user && (
                <span className="text-[var(--text-muted)] text-sm hidden lg:block px-2">
                  {user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-[var(--text-secondary)] hover:text-[var(--error)] px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
