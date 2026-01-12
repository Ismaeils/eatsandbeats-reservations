'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Layout from '@/components/Layout'
import ManualReservationDialog from '@/components/ManualReservationDialog'
import { format } from 'date-fns'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [filteredReservations, setFilteredReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [restaurant, setRestaurant] = useState<any>(null)
  const [showManualReservationDialog, setShowManualReservationDialog] = useState(false)

  useEffect(() => {
    fetchReservations()
    fetchRestaurant()
  }, [])

  const fetchReservations = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/reservations') as any
      if (response?.success) {
        // Sort by date, newest first
        const sorted = (response.data || []).sort(
          (a: any, b: any) => new Date(b.timeFrom).getTime() - new Date(a.timeFrom).getTime()
        )
        setReservations(sorted)
        setFilteredReservations(sorted)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load reservations')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRestaurant = async () => {
    try {
      const response = await apiClient.get('/restaurants/me') as any
      if (response?.success) {
        setRestaurant(response.data)
      }
    } catch (err) {
      // Silent fail
    }
  }

  // Filter reservations based on search query and status
  const filterReservations = useCallback(() => {
    let filtered = [...reservations]

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'upcoming') {
        filtered = filtered.filter(r => new Date(r.timeTo) >= new Date())
      } else if (statusFilter === 'past') {
        filtered = filtered.filter(r => new Date(r.timeTo) < new Date())
      } else {
        filtered = filtered.filter(r => r.status === statusFilter)
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.guestName.toLowerCase().includes(query) ||
        r.guestContact.toLowerCase().includes(query)
      )
    }

    setFilteredReservations(filtered)
  }, [reservations, searchQuery, statusFilter])

  useEffect(() => {
    filterReservations()
  }, [filterReservations])

  const isPastReservation = (timeTo: string) => {
    return new Date(timeTo) < new Date()
  }

  const getStatusBadge = (reservation: any) => {
    const isPast = isPastReservation(reservation.timeTo)
    
    if (isPast && reservation.status === 'CONFIRMED') {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-[var(--text-muted)]/20 text-[var(--text-muted)]">
          Completed
        </span>
      )
    }

    const statusColors: Record<string, string> = {
      CONFIRMED: 'bg-[var(--success)]/20 text-[var(--success)]',
      PENDING: 'bg-[var(--warning)]/20 text-[var(--warning)]',
      CANCELLED: 'bg-[var(--error)]/20 text-[var(--error)]',
      SEATED: 'bg-[var(--info)]/20 text-[var(--info)]',
      COMPLETED: 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[reservation.status] || ''}`}>
        {reservation.status}
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Action Buttons */}
        <div className="flex justify-between items-center gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">Reservations</h1>
          <div className="flex gap-2 sm:gap-3 shrink-0">
            <Button 
              variant="outline" 
              className="text-sm sm:text-base px-3 sm:px-5 py-2 sm:py-2.5"
              onClick={() => setShowManualReservationDialog(true)}
            >
              <span className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create
              </span>
            </Button>
            <Link href="/invitations/send">
              <Button variant="primary" className="text-sm sm:text-base px-3 sm:px-5 py-2 sm:py-2.5">
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

        {/* Search and Filter */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <select
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Reservations List */}
        <Card>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-[var(--text-primary)]">
              {filteredReservations.length} Reservation{filteredReservations.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {filteredReservations.length === 0 ? (
            <p className="text-[var(--text-muted)] text-center py-6 sm:py-8 text-sm">
              {searchQuery || statusFilter !== 'all' 
                ? 'No reservations match your criteria' 
                : 'No reservations yet'}
            </p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredReservations.map((reservation) => {
                const isPast = isPastReservation(reservation.timeTo)
                const hasNoTable = !reservation.tableId
                
                return (
                  <div
                    key={reservation.id}
                    className={`bg-[var(--bg-card)] border rounded-lg p-2.5 sm:p-3 lg:p-4 transition-all ${
                      hasNoTable && !isPast 
                        ? 'border-[var(--warning)]/50 bg-[var(--warning)]/5' 
                        : 'border-[var(--glass-border)]'
                    } ${
                      isPast ? 'opacity-70' : 'hover:border-[var(--color-primary)]/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-[var(--text-primary)] truncate">
                            {reservation.guestName}
                          </h3>
                          {getStatusBadge(reservation)}
                          {hasNoTable && !isPast && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/30">
                              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              No table
                            </span>
                          )}
                        </div>
                        <p className="text-[var(--text-secondary)] text-xs sm:text-sm">
                          {reservation.guestContact}
                        </p>
                        <p className="text-[var(--text-secondary)] text-xs sm:text-sm">
                          {reservation.numberOfPeople} ppl • {reservation.tableId || (
                            <span className="text-[var(--warning)]">TBD</span>
                          )}
                        </p>
                        <p className="text-[var(--text-muted)] text-[11px] sm:text-xs lg:text-sm mt-0.5 sm:mt-1">
                          {format(new Date(reservation.timeFrom), 'MMM d, h:mm a')} - {format(new Date(reservation.timeTo), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!isPast && (
                          <Link href={`/reservations/${reservation.id}/edit`}>
                            <Button variant={hasNoTable ? 'primary' : 'outline'} className="text-xs px-2 py-1 sm:px-3 sm:py-1.5">
                              {hasNoTable ? 'Assign' : 'Edit'}
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
        isOpen={showManualReservationDialog}
        onClose={() => setShowManualReservationDialog(false)}
        onSuccess={() => {
          fetchReservations()
        }}
        restaurant={restaurant}
      />
    </Layout>
  )
}
