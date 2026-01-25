'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import { format } from 'date-fns'

interface Reservation {
  id: string
  guestName: string
  numberOfPeople: number
  timeFrom: string
  timeTo: string
  status: string
}

export default function NotificationBell() {
  const router = useRouter()
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)

  const fetchPendingReservations = async () => {
    try {
      const response = await apiClient.get('/reservations?status=PENDING') as any
      if (response?.success) {
        // Filter to only upcoming pending reservations
        const upcoming = (response.data || []).filter(
          (r: Reservation) => new Date(r.timeTo) >= new Date()
        )
        setPendingReservations(upcoming)
        
        // Dispatch event if count changed to notify other components
        if (upcoming.length !== prevCountRef.current) {
          prevCountRef.current = upcoming.length
          window.dispatchEvent(new CustomEvent('reservations-updated'))
        }
      }
    } catch (err) {
      // Silent fail - notifications are not critical
    }
  }

  // Poll every 10 seconds
  useEffect(() => {
    fetchPendingReservations()
    const interval = setInterval(fetchPendingReservations, 10000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = (id: string) => {
    setIsOpen(false)
    router.push(`/reservations/${id}/edit`)
  }

  const handleViewAll = () => {
    setIsOpen(false)
    router.push('/reservations?status=PENDING')
  }

  const count = pendingReservations.length

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
        aria-label="Notifications"
        title={count > 0 ? `${count} pending reservation${count !== 1 ? 's' : ''}` : 'No pending reservations'}
      >
        <svg
          className="w-5 h-5 text-[var(--text-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Badge */}
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute h-full w-full rounded-full bg-[var(--warning)] opacity-75"></span>
            <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-[var(--warning)] text-[10px] font-bold text-white">
              {count > 9 ? '9+' : count}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[var(--border-color)]">
            <h3 className="font-semibold text-[var(--text-primary)]">
              Pending Approvals
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {count} reservation{count !== 1 ? 's' : ''} awaiting your approval
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {count === 0 ? (
              <div className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
                No pending reservations
              </div>
            ) : (
              <>
                {pendingReservations.slice(0, 5).map((reservation) => (
                  <button
                    key={reservation.id}
                    onClick={() => handleItemClick(reservation.id)}
                    className="w-full px-4 py-3 text-left hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-color)] last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute h-2 w-2 rounded-full bg-[var(--warning)] opacity-75"></span>
                          <span className="relative rounded-full h-2 w-2 bg-[var(--warning)]"></span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate">
                          {reservation.guestName}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {reservation.numberOfPeople} {reservation.numberOfPeople === 1 ? 'guest' : 'guests'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {format(new Date(reservation.timeFrom), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>

          {count > 0 && (
            <div className="px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-hover)]/50">
              <button
                onClick={handleViewAll}
                className="w-full text-center text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                View all pending reservations
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
