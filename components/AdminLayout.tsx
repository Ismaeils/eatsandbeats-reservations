'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from './AdminSidebar'
import ThemeToggle from './ThemeToggle'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token && !pathname.startsWith('/admin/login')) {
      router.push('/admin/login')
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        // Verify this is an admin user
        if (payload.userType !== 'admin') {
          localStorage.removeItem('adminToken')
          router.push('/admin/login')
          return
        }
        setUser(payload)
      } catch (e) {
        localStorage.removeItem('adminToken')
        router.push('/admin/login')
      }
    }
  }, [router, pathname])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-2 sm:p-3 md:p-4">
      {/* Elevated App Container */}
      <div className="min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-32px)] bg-[var(--bg-card)] rounded-[25px] shadow-elevated overflow-hidden flex">
        
        {/* Sidebar - Desktop */}
        <div className="hidden md:block w-64 flex-shrink-0 border-r border-[var(--border-color)]">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div 
              className="absolute inset-0 bg-black/50" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full">
              <AdminSidebar isMobile onClose={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-full overflow-hidden bg-[var(--bg-app)]">
          {/* Top Bar */}
          <header className="flex-shrink-0 h-[72px] px-6 bg-transparent flex items-center">
            <div className="flex items-center justify-between w-full">
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

              {/* Right side - Theme toggle & Logout */}
              <div className="flex items-center gap-2 sm:gap-4">
                <ThemeToggle />
                {user && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--text-secondary)] hidden sm:block">
                      {user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[20px] transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
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
