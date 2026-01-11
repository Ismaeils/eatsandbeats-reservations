'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Layout from '@/components/Layout'
import { format, isPast } from 'date-fns'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
    
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [statsRes, reservationsRes] = await Promise.all([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/reservations?status=CONFIRMED'),
      ]) as any[]

      if (statsRes?.success) {
        setStats(statsRes.data)
      }
      if (reservationsRes?.success) {
        // Filter to only upcoming reservations and sort by date
        const upcomingReservations = (reservationsRes.data || [])
          .filter((r: any) => !isPast(new Date(r.timeTo)))
          .sort((a: any, b: any) => new Date(a.timeFrom).getTime() - new Date(b.timeFrom).getTime())
        setReservations(upcomingReservations)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const isPastReservation = (timeTo: string) => {
    return isPast(new Date(timeTo))
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-[var(--text-secondary)] text-xl">Loading...</div>
        </div>
      </Layout>
    )
  }

  const occupancyPercentage = stats ? Math.round((stats.tables.occupied / stats.tables.total) * 100) : 0

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header with Send Invitation Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <Link href="/invitations/send">
            <Button variant="primary" className="text-lg px-8 py-4">
              Send Reservation Invitation
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="text-[var(--text-muted)] text-sm mb-1">Today&apos;s Reservations</div>
              <div className="text-3xl font-bold text-[var(--color-primary)]">{stats.reservations.today}</div>
            </Card>
            <Card>
              <div className="text-[var(--text-muted)] text-sm mb-1">This Week</div>
              <div className="text-3xl font-bold text-[var(--color-primary)]">{stats.reservations.week}</div>
            </Card>
            <Card>
              <div className="text-[var(--text-muted)] text-sm mb-1">This Month</div>
              <div className="text-3xl font-bold text-[var(--color-primary)]">{stats.reservations.month}</div>
            </Card>
            <Card>
              <div className="text-[var(--text-muted)] text-sm mb-1">Total Reservations</div>
              <div className="text-3xl font-bold text-[var(--color-primary)]">{stats.reservations.total}</div>
            </Card>
          </div>
        )}

        {/* Live Table Status */}
        {stats && (
          <Card className="overflow-hidden">
            {/* Header with Live Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {/* Pulsing Live Dot */}
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--success)]"></span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--success)]">Live</span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Floor Status</h2>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  {format(currentTime, 'EEEE, MMM d')} • {format(currentTime, 'h:mm a')}
                </span>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Occupancy Gauge */}
              <div className="flex flex-col items-center justify-center p-6 bg-[var(--bg-hover)] rounded-xl">
                <div className="relative w-32 h-32">
                  {/* Background Circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="var(--glass-border)"
                      strokeWidth="12"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke={occupancyPercentage > 80 ? 'var(--error)' : occupancyPercentage > 50 ? 'var(--warning)' : 'var(--success)'}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${occupancyPercentage * 3.52} 352`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[var(--text-primary)]">{occupancyPercentage}%</span>
                    <span className="text-xs text-[var(--text-muted)]">Occupied</span>
                  </div>
                </div>
              </div>

              {/* Available Tables */}
              <div className="flex flex-col justify-center p-6 bg-[var(--success)]/10 rounded-xl border border-[var(--success)]/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[var(--success)]/20 rounded-lg">
                    <svg className="w-6 h-6 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[var(--text-secondary)] font-medium">Available Now</span>
                </div>
                <div className="text-4xl font-bold text-[var(--success)]">{stats.tables.available}</div>
                <div className="text-sm text-[var(--text-muted)] mt-1">of {stats.tables.total} tables</div>
              </div>

              {/* Occupied Tables */}
              <div className="flex flex-col justify-center p-6 bg-[var(--error)]/10 rounded-xl border border-[var(--error)]/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[var(--error)]/20 rounded-lg">
                    <svg className="w-6 h-6 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span className="text-[var(--text-secondary)] font-medium">Currently Seated</span>
                </div>
                <div className="text-4xl font-bold text-[var(--error)]">{stats.tables.occupied}</div>
                <div className="text-sm text-[var(--text-muted)] mt-1">tables in use</div>
              </div>
            </div>

            {/* Table Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Table Overview</h3>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-[var(--success)]/30 border border-[var(--success)]"></span>
                    Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-[var(--error)]/30 border border-[var(--error)]"></span>
                    Occupied
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {/* Available Tables */}
                {stats.tables.availableTableIds.map((tableId: string) => (
                  <div
                    key={tableId}
                    className="aspect-square flex flex-col items-center justify-center rounded-xl bg-[var(--success)]/10 border-2 border-[var(--success)]/40 hover:border-[var(--success)] transition-colors cursor-default"
                    title={`${tableId} - Available`}
                  >
                    <svg className="w-5 h-5 text-[var(--success)] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    <span className="text-xs font-semibold text-[var(--success)]">{tableId}</span>
                  </div>
                ))}
                {/* Occupied Tables */}
                {stats.tables.occupiedTableIds.map((tableId: string) => (
                  <div
                    key={tableId}
                    className="aspect-square flex flex-col items-center justify-center rounded-xl bg-[var(--error)]/10 border-2 border-[var(--error)]/40 transition-colors cursor-default"
                    title={`${tableId} - Occupied`}
                  >
                    <svg className="w-5 h-5 text-[var(--error)] mb-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span className="text-xs font-semibold text-[var(--error)]">{tableId}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Refresh Button */}
            <div className="mt-6 pt-4 border-t border-[var(--glass-border)] flex justify-end">
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
              </button>
            </div>
          </Card>
        )}

        {/* Reservations List */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Upcoming Reservations</h2>
            <Link href="/reservations">
              <Button variant="outline" className="text-sm">
                View All Reservations
              </Button>
            </Link>
          </div>
          {reservations.length === 0 ? (
            <p className="text-[var(--text-muted)]">No upcoming reservations</p>
          ) : (
            <div className="space-y-4">
              {reservations.slice(0, 10).map((reservation) => {
                const isPast = isPastReservation(reservation.timeTo)
                
                return (
                  <div
                    key={reservation.id}
                    className={`bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-lg p-4 transition-all ${
                      isPast ? 'opacity-60' : 'hover:border-[var(--color-primary)]/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {reservation.guestName}
                        </h3>
                        <p className="text-[var(--text-secondary)] text-sm">
                          {reservation.numberOfPeople} people • Table: {reservation.tableId || 'TBD'}
                        </p>
                        <p className="text-[var(--text-muted)] text-sm">
                          {format(new Date(reservation.timeFrom), 'MMM dd, yyyy h:mm a')} -{' '}
                          {format(new Date(reservation.timeTo), 'h:mm a')}
                        </p>
                      </div>
                      {!isPast && (
                        <Link href={`/reservations/${reservation.id}/edit`}>
                          <Button variant="outline" className="text-sm">
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}
