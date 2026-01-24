'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'

interface SidebarProps {
  onClose?: () => void  // Only used for mobile to close the sidebar
  isMobile?: boolean
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export default function Sidebar({ onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname()
  const [settingsExpanded, setSettingsExpanded] = useState(
    pathname.startsWith('/restaurant/settings')
  )

  // Auto-expand settings when navigating to a settings page
  useEffect(() => {
    if (pathname.startsWith('/restaurant/settings')) {
      setSettingsExpanded(true)
    }
  }, [pathname])

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/reservations',
      label: 'Reservations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  const settingsItems = [
    { href: '/restaurant/settings/general', label: 'General' },
    { href: '/restaurant/settings/hours', label: 'Hours' },
    { href: '/restaurant/settings/exceptions', label: 'Exceptions' },
    { href: '/restaurant/settings/floor-plan', label: 'Floor Plan' },
  ]

  const isActive = (href: string) => pathname === href
  const isSettingsActive = pathname.startsWith('/restaurant/settings')

  return (
    <aside className={`${isMobile ? 'fixed left-0 top-0 z-40' : ''} h-full w-64 bg-[var(--bg-card)] flex flex-col`}>
      {/* Logo - aligned left, matching header height */}
      <div className="relative flex items-center h-[72px] px-6">
        <Link href="/dashboard" className="flex items-center">
          <Logo size="sm" />
        </Link>
        
        {/* Close button - only shown on mobile, positioned absolute right */}
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

      {/* Navigation - positioned 1/3 from top (2/3 up from bottom) */}
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

          {/* Settings Section */}
          <div className="pt-4">
            <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Settings
            </div>
            
            {/* Settings Toggle */}
            <button
              onClick={() => setSettingsExpanded(!settingsExpanded)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-[20px] transition-colors ${
                isSettingsActive
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium text-sm">Settings</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${settingsExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Settings Sub-items */}
            {settingsExpanded && (
              <div className="mt-1 ml-4 space-y-1 border-l-2 border-[var(--border-color)] pl-3">
                {settingsItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => isMobile && onClose?.()}
                    className={`block px-3 py-2 rounded-[12px] text-sm transition-colors ${
                      isActive(item.href)
                        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  )
}
