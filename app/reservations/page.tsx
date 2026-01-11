'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Layout from '@/components/Layout'
import { format } from 'date-fns'

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [filteredReservations, setFilteredReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchReservations()
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
          <div className="text-[var(--text-secondary)] text-xl">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">All Reservations</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by guest name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <select
                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Reservations</option>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {filteredReservations.length} Reservation{filteredReservations.length !== 1 ? 's' : ''}
            </h2>
          </div>

          {filteredReservations.length === 0 ? (
            <p className="text-[var(--text-muted)] text-center py-8">
              {searchQuery || statusFilter !== 'all' 
                ? 'No reservations match your search criteria' 
                : 'No reservations yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredReservations.map((reservation) => {
                const isPast = isPastReservation(reservation.timeTo)
                
                return (
                  <div
                    key={reservation.id}
                    className={`bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-lg p-4 transition-all ${
                      isPast ? 'opacity-70' : 'hover:border-[var(--color-primary)]/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {reservation.guestName}
                          </h3>
                          {getStatusBadge(reservation)}
                        </div>
                        <p className="text-[var(--text-secondary)] text-sm">
                          {reservation.guestContact}
                        </p>
                        <p className="text-[var(--text-secondary)] text-sm">
                          {reservation.numberOfPeople} people • Table: {reservation.tableId || 'TBD'}
                        </p>
                        <p className="text-[var(--text-muted)] text-sm mt-1">
                          {format(new Date(reservation.timeFrom), 'EEEE, MMM dd, yyyy')}
                          {' • '}
                          {format(new Date(reservation.timeFrom), 'h:mm a')} - {format(new Date(reservation.timeTo), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!isPast && (
                          <Link href={`/reservations/${reservation.id}/edit`}>
                            <Button variant="outline" className="text-sm">
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
    </Layout>
  )
}
