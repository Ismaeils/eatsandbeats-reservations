'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'

interface AdminSidebarProps {
  onClose?: () => void
  isMobile?: boolean
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export default function AdminSidebar({ onClose, isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/admin/requests',
      label: 'Restaurant Requests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      href: '/admin/restaurants',
      label: 'Restaurants',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className={`${isMobile ? 'fixed left-0 top-0 z-40' : ''} h-full w-64 bg-[var(--bg-card)] flex flex-col`}>
      {/* Logo - aligned left, matching header height */}
      <div className="relative flex items-center h-[72px] px-6">
        <Link href="/admin/dashboard" className="flex items-center">
          <Logo size="sm" />
        </Link>
        
        {/* Admin Badge */}
        <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
          Admin
        </span>
        
        {/* Close button - only shown on mobile */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="absolute right-6 p-2 rounded-[20px] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col justify-start pt-6 px-6">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && onClose?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[20px] transition-colors ${
                isActive(item.href)
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-[var(--border-color)]">
        <div className="text-xs text-[var(--text-muted)]">
          Admin Panel
        </div>
      </div>
    </aside>
  )
}
