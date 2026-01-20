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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'

  if (isAuthPage) {
    return <>{children}</>
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/reservations', label: 'Reservations' },
    { href: '/restaurant/config', label: 'Settings' },
  ]

  return (
    <div className="min-h-screen">
      {/* Floating Navbar Container */}
      <div className="sticky top-0 z-50 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        <nav className="max-w-7xl mx-auto glass-card rounded-2xl px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Left side: Logos */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/dashboard" className="flex items-center">
                <Logo size="sm" />
              </Link>
              
              {/* Restaurant Logo - if available (hidden on mobile) */}
              {restaurant && (
                <div className="hidden sm:flex items-center gap-3">
                  <div className="h-8 w-px bg-[var(--border-color)]" />
                  <RestaurantLogo 
                    logoUrl={restaurant.logoUrl} 
                    restaurantName={restaurant.name}
                    size="sm"
                  />
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Divider */}
              <div className="h-6 w-px bg-[var(--border-color)] mx-2" />
              
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

            {/* Mobile: Theme Toggle + Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[var(--border-color)]">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href 
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Divider */}
                <div className="h-px bg-[var(--border-color)] my-2" />
                
                {/* User info */}
                {user && (
                  <div className="px-4 py-2 text-sm text-[var(--text-muted)]">
                    {user.email}
                  </div>
                )}
                
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="text-left px-4 py-3 rounded-lg text-sm font-medium text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-8 sm:pb-10">
        {children}
      </main>
    </div>
  )
}
