'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Layout from '@/components/Layout'
import ManualReservationDialog from '@/components/ManualReservationDialog'
import { format, isPast } from 'date-fns'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showManualReservation, setShowManualReservation] = useState(false)

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true)
      const [statsRes, reservationsRes, restaurantRes] = await Promise.all([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/reservations'),
        apiClient.get('/restaurants/me'),
      ]) as any[]

      if (statsRes?.success) {
        setStats(statsRes.data)
      }
      if (reservationsRes?.success) {
        // Filter to only upcoming CONFIRMED or PENDING reservations and sort by date
        const upcomingReservations = (reservationsRes.data || [])
          .filter((r: any) => 
            !isPast(new Date(r.timeTo)) && 
            (r.status === 'CONFIRMED' || r.status === 'PENDING')
          )
          .sort((a: any, b: any) => new Date(a.timeFrom).getTime() - new Date(b.timeFrom).getTime())
        setReservations(upcomingReservations)
      }
      if (restaurantRes?.success) {
        setRestaurant(restaurantRes.data)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load dashboard data')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Listen for reservation updates from NotificationBell
  useEffect(() => {
    const handleReservationsUpdated = () => {
      fetchDashboardData(false) // Silent refresh without loading state
    }
    window.addEventListener('reservations-updated', handleReservationsUpdated)
    return () => window.removeEventListener('reservations-updated', handleReservationsUpdated)
  }, [fetchDashboardData])

  const isPastReservation = (timeTo: string) => {
    return isPast(new Date(timeTo))
  }

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id)
      const response = await apiClient.post(`/reservations/${id}/approve`) as any
      if (response?.success) {
        fetchDashboardData()
      }
    } catch (err: any) {
      setError(err.error || 'Failed to approve reservation')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      CONFIRMED: { color: 'bg-[var(--success)]/20 text-[var(--success)]', label: 'Confirmed' },
      PENDING: { color: 'bg-[var(--warning)]/20 text-[var(--warning)]', label: 'Pending' },
    }
    const config = statusConfig[status] || { color: '', label: status }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header with Action Buttons */}
        <div className="flex justify-between items-center gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <div className="flex gap-2 sm:gap-3 shrink-0">
            <Button 
              variant="outline" 
              className="text-sm sm:text-base px-3 sm:px-5 !py-1.5"
              onClick={() => setShowManualReservation(true)}
            >
              <span className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create
              </span>
            </Button>
            <Link href="/invitations/send">
              <Button variant="primary" className="text-sm sm:text-base px-3 sm:px-5 !py-1.5">
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Invite
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Setup Warning - Only check for opening hours */}
        {stats && stats.setup && !stats.setup.hasOpeningHours && (
          <div className="bg-[var(--warning)]/20 border border-[var(--warning)]/50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
            <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
              <div className="p-2 sm:p-3 bg-[var(--warning)]/20 rounded-full shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[var(--warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base mb-1 sm:mb-2">Setup Required</h3>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-2 sm:mb-3">
                  Configure your opening hours to accept reservations.
                </p>
                <Link href="/restaurant/settings/hours">
                  <Button variant="primary" className="text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2">
                    Configure Hours
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Metrics */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            <Card className="p-3 sm:p-4 lg:p-6">
              <div className="text-[var(--text-muted)] text-xs sm:text-sm mb-0.5 sm:mb-1">Today&apos;s Reservations</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-primary)]">{stats.reservations.today}</div>
            </Card>
            <Card className="p-3 sm:p-4 lg:p-6">
              <div className="text-[var(--text-muted)] text-xs sm:text-sm mb-0.5 sm:mb-1">This Week</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-primary)]">{stats.reservations.week}</div>
            </Card>
            <Card className="p-3 sm:p-4 lg:p-6">
              <div className="text-[var(--text-muted)] text-xs sm:text-sm mb-0.5 sm:mb-1">This Month</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-primary)]">{stats.reservations.month}</div>
            </Card>
            <Card className="p-3 sm:p-4 lg:p-6">
              <div className="text-[var(--text-muted)] text-xs sm:text-sm mb-0.5 sm:mb-1">Total Reservations</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-primary)]">{stats.reservations.total}</div>
            </Card>
          </div>
        )}

        {/* Reservations List */}
        <Card className="p-3 sm:p-4 lg:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--text-primary)]">Upcoming Reservations</h2>
            <Link href="/reservations">
              <Button variant="outline" className="text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2">
                View All
              </Button>
            </Link>
          </div>
          {reservations.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm">No upcoming reservations</p>
          ) : (
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {reservations.slice(0, 10).map((reservation) => {
                const isPastRes = isPastReservation(reservation.timeTo)
                const isActionLoading = actionLoading === reservation.id
                const needsAction = reservation.status === 'PENDING' && !isPastRes
                
                return (
                  <div
                    key={reservation.id}
                    className={`relative bg-[var(--bg-card)] border rounded-lg p-2.5 sm:p-3 lg:p-4 transition-all border-[var(--border-color)] ${
                      isPastRes ? 'opacity-60' : 'hover:border-[var(--color-primary)]/50 hover:shadow-md'
                    } ${needsAction ? 'border-l-4 border-l-[var(--warning)]' : ''}`}
                  >
                    {/* Pulsing indicator for pending reservations */}
                    {needsAction && (
                      <span className="absolute top-3 right-3 flex h-3 w-3">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-[var(--warning)] opacity-75"></span>
                        <span className="relative rounded-full h-3 w-3 bg-[var(--warning)]"></span>
                      </span>
                    )}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--text-primary)] truncate">
                            {reservation.guestName}
                          </h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <p className="text-[var(--text-secondary)] text-xs sm:text-sm">
                          {reservation.numberOfPeople} {reservation.numberOfPeople === 1 ? 'guest' : 'guests'}
                        </p>
                        <p className="text-[var(--text-muted)] text-[11px] sm:text-xs lg:text-sm">
                          {format(new Date(reservation.timeFrom), 'MMM d, h:mm a')} - {format(new Date(reservation.timeTo), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 shrink-0">
                        {reservation.status === 'PENDING' && !isPastRes && (
                          <Button
                            variant="primary"
                            className="text-xs px-2 py-1 sm:px-3 sm:py-1.5 !bg-[var(--success)] hover:!bg-[var(--success)]/80"
                            onClick={() => handleApprove(reservation.id)}
                            disabled={isActionLoading}
                          >
                            {isActionLoading ? '...' : 'Approve'}
                          </Button>
                        )}
                        {!isPastRes && (
                          <Link href={`/reservations/${reservation.id}/edit`}>
                            <Button variant="outline" className="text-xs px-2 py-1 sm:px-3 sm:py-1.5">
                              Edit
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Manual Reservation Dialog */}
      <ManualReservationDialog
        isOpen={showManualReservation}
        onClose={() => setShowManualReservation(false)}
        onSuccess={() => {
          fetchDashboardData()
        }}
        restaurant={restaurant}
      />
    </Layout>
  )
}
