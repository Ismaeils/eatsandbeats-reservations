'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
      router.push('/login')
    } else if (token) {
      // Decode token to get user info (simple implementation)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      } catch (e) {
        localStorage.removeItem('token')
        router.push('/login')
      }
    }
  }, [router, pathname])

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
      <nav className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold text-white">
              Eats & Beats
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className={`text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/dashboard' ? 'bg-white/20' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/restaurant/config"
                className={`text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/restaurant/config' ? 'bg-white/20' : ''
                }`}
              >
                Settings
              </Link>
              {user && (
                <span className="text-white/80 text-sm">
                  {user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-white/90 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

