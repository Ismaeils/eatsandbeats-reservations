'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface UserMenuProps {
  user: {
    email: string
    name?: string
  } | null
  restaurant: {
    name: string
    logoUrl?: string
  } | null
}

export default function UserMenu({ user, restaurant }: UserMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initials = (restaurant?.name || displayName).charAt(0).toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
      >
        {/* Avatar/Logo */}
        <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--color-accent)] flex items-center justify-center border-2 border-[var(--border-color)]">
          {restaurant?.logoUrl ? (
            <Image 
              src={restaurant.logoUrl} 
              alt={restaurant.name}
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {initials}
            </span>
          )}
        </div>
        
        {/* Name - hidden on mobile */}
        <span className="hidden sm:block text-sm font-medium text-[var(--text-primary)]">
          {restaurant?.name || displayName}
        </span>
        
        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform hidden sm:block ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[25px] shadow-lg overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--color-accent)] flex items-center justify-center border-2 border-[var(--border-color)]">
                {restaurant?.logoUrl ? (
                  <Image 
                    src={restaurant.logoUrl} 
                    alt={restaurant.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-base font-semibold text-[var(--text-primary)]">
                    {initials}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {restaurant?.name || displayName}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[20px] text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors text-left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
