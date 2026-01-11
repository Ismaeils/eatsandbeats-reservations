'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Layout from '@/components/Layout'
import { format } from 'date-fns'

export default function EditReservationPage() {
  const router = useRouter()
  const params = useParams()
  const reservationId = params.id as string

  const [reservation, setReservation] = useState<any>(null)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [availableTables, setAvailableTables] = useState<string[]>([])
  const [occupiedTables, setOccupiedTables] = useState<string[]>([])
  const [formData, setFormData] = useState({
    timeFrom: '',
    timeTo: '',
    tableId: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchAvailableTables = useCallback(async (timeFrom: string, timeTo: string) => {
    if (!timeFrom || !timeTo) return

    try {
      setIsLoadingTables(true)
      const response = await apiClient.get(
        `/restaurants/available-tables?timeFrom=${encodeURIComponent(timeFrom)}&timeTo=${encodeURIComponent(timeTo)}&excludeReservationId=${reservationId}`
      ) as any

      if (response?.success) {
        setAvailableTables(response.data.availableTables || [])
        setOccupiedTables(response.data.occupiedTables || [])
      }
    } catch (err: any) {
      console.error('Failed to fetch available tables:', err)
    } finally {
      setIsLoadingTables(false)
    }
  }, [reservationId])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [reservationRes, restaurantRes] = await Promise.all([
        apiClient.get(`/reservations/${reservationId}`),
        apiClient.get('/restaurants/me'),
      ]) as any[]

      if (reservationRes?.success) {
        const res = reservationRes.data
        setReservation(res)
        const timeFromFormatted = format(new Date(res.timeFrom), "yyyy-MM-dd'T'HH:mm")
        const timeToFormatted = format(new Date(res.timeTo), "yyyy-MM-dd'T'HH:mm")
        setFormData({
          timeFrom: timeFromFormatted,
          timeTo: timeToFormatted,
          tableId: res.tableId || '',
        })
        // Fetch available tables for initial time slot
        await fetchAvailableTables(
          new Date(res.timeFrom).toISOString(),
          new Date(res.timeTo).toISOString()
        )
      }

      if (restaurantRes?.success) {
        setRestaurant(restaurantRes.data)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load reservation')
    } finally {
      setIsLoading(false)
    }
  }, [reservationId, fetchAvailableTables])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refetch available tables when time changes
  const handleTimeChange = (field: 'timeFrom' | 'timeTo', value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)

    // If both times are set, fetch available tables
    if (newFormData.timeFrom && newFormData.timeTo) {
      fetchAvailableTables(
        new Date(newFormData.timeFrom).toISOString(),
        new Date(newFormData.timeTo).toISOString()
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate that selected table is available
    if (formData.tableId && !availableTables.includes(formData.tableId)) {
      setError('The selected table is not available for this time slot. Please choose a different table.')
      return
    }

    setIsSaving(true)

    try {
      const payload: any = {}
      if (formData.timeFrom) payload.timeFrom = new Date(formData.timeFrom).toISOString()
      if (formData.timeTo) payload.timeTo = new Date(formData.timeTo).toISOString()
      if (formData.tableId !== undefined) payload.tableId = formData.tableId || null

      const response = await apiClient.patch(`/reservations/${reservationId}`, payload) as any
      if (response.success) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.error || 'Failed to update reservation')
    } finally {
      setIsSaving(false)
    }
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

  if (!reservation) {
    return (
      <Layout>
        <Card>
          <p className="text-[var(--text-primary)]">Reservation not found</p>
        </Card>
      </Layout>
    )
  }

  const currentTableIsOccupied = formData.tableId && occupiedTables.includes(formData.tableId)

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">Edit Reservation</h1>

          {error && (
            <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Warning for unassigned table */}
          {!reservation.tableId && (
            <div className="bg-[var(--warning)]/20 border border-[var(--warning)]/50 text-[var(--warning)] px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>This reservation has no table assigned. Please assign a table below.</span>
            </div>
          )}

          <div className="mb-6 space-y-2">
            <p className="text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">Guest:</span> {reservation.guestName}
            </p>
            <p className="text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">Contact:</span> {reservation.guestContact}
            </p>
            <p className="text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">Party Size:</span> {reservation.numberOfPeople}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="From"
                type="datetime-local"
                value={formData.timeFrom}
                onChange={(e) => handleTimeChange('timeFrom', e.target.value)}
                required
              />

              <Input
                label="To"
                type="datetime-local"
                value={formData.timeTo}
                onChange={(e) => handleTimeChange('timeTo', e.target.value)}
                required
              />
            </div>

            {restaurant && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Table
                  </label>
                  {isLoadingTables && (
                    <span className="text-xs text-[var(--text-muted)]">Loading available tables...</span>
                  )}
                </div>
                <select
                  className={`w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] shadow-sm ${
                    currentTableIsOccupied ? 'border-[var(--warning)]' : 'border-[var(--glass-border)]'
                  }`}
                  value={formData.tableId}
                  onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                >
                  <option value="">No table assigned (TBD)</option>
                  
                  {/* Available tables */}
                  {availableTables.length > 0 && (
                    <optgroup label="✓ Available">
                      {availableTables.map((tableId: string) => (
                        <option key={tableId} value={tableId}>
                          {tableId}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {/* Show occupied tables as disabled for reference */}
                  {occupiedTables.length > 0 && (
                    <optgroup label="✗ Occupied at this time">
                      {occupiedTables.map((tableId: string) => (
                        <option key={tableId} value={tableId} disabled className="text-[var(--text-muted)]">
                          {tableId} (occupied)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                {/* Status info */}
                <div className="mt-2 text-xs text-[var(--text-muted)]">
                  {availableTables.length === 0 && !isLoadingTables ? (
                    <span className="text-[var(--warning)]">
                      ⚠ No tables available for this time slot
                    </span>
                  ) : (
                    <span>
                      {availableTables.length} table{availableTables.length !== 1 ? 's' : ''} available for this time slot
                    </span>
                  )}
                </div>

                {currentTableIsOccupied && (
                  <div className="mt-2 text-sm text-[var(--warning)] flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Currently selected table is occupied at this time. Please select a different table.</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                isLoading={isSaving} 
                className="flex-1"
                disabled={currentTableIsOccupied}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
