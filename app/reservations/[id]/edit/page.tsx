'use client'

import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Layout from '@/components/Layout'
import apiClient from '@/lib/api-client'
import { format } from 'date-fns'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function EditReservationPage() {
  const router = useRouter()
  const params = useParams()
  const reservationId = params.id as string

  const [reservation, setReservation] = useState<any>(null)
  const [formData, setFormData] = useState({
    timeFrom: '',
    timeTo: '',
    numberOfPeople: 1,
    status: 'CONFIRMED',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const reservationRes = await apiClient.get(`/reservations/${reservationId}`) as any

      if (reservationRes?.success) {
        const res = reservationRes.data
        setReservation(res)
        const timeFromFormatted = format(new Date(res.timeFrom), "yyyy-MM-dd'T'HH:mm")
        const timeToFormatted = format(new Date(res.timeTo), "yyyy-MM-dd'T'HH:mm")
        setFormData({
          timeFrom: timeFromFormatted,
          timeTo: timeToFormatted,
          numberOfPeople: res.numberOfPeople,
          status: res.status,
        })
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load reservation')
    } finally {
      setIsLoading(false)
    }
  }, [reservationId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const payload: any = {
        timeFrom: new Date(formData.timeFrom).toISOString(),
        timeTo: new Date(formData.timeTo).toISOString(),
        numberOfPeople: formData.numberOfPeople,
        status: formData.status,
      }

      const response = await apiClient.patch(`/reservations/${reservationId}`, payload) as any
      if (response.success) {
        router.push('/reservations')
      }
    } catch (err: any) {
      setError(err.error || 'Failed to update reservation')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelReservation = async () => {
    if (!confirm('Are you sure you want to cancel this reservation? This action cannot be undone.')) return
    
    setError('')
    setIsCancelling(true)

    try {
      const response = await apiClient.patch(`/reservations/${reservationId}`, { status: 'CANCELLED' }) as any
      if (response.success) {
        router.push('/reservations')
      }
    } catch (err: any) {
      setError(err.error || 'Failed to cancel reservation')
    } finally {
      setIsCancelling(false)
    }
  }

  const isPastReservation = reservation ? new Date(reservation.timeTo) < new Date() : false

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

  if (!reservation) {
    return (
      <Layout>
        <Card>
          <p className="text-[var(--text-primary)]">Reservation not found</p>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">Edit Reservation</h1>

        <Card>
          {error && (
            <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4 sm:mb-6 space-y-1.5 sm:space-y-2">
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              <span className="font-semibold text-[var(--text-primary)]">Guest:</span> {reservation.guestName}
            </p>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              <span className="font-semibold text-[var(--text-primary)]">Contact:</span> {reservation.guestContact}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="From"
                type="datetime-local"
                value={formData.timeFrom}
                onChange={(e) => setFormData({ ...formData, timeFrom: e.target.value })}
                required
              />

              <Input
                label="To"
                type="datetime-local"
                value={formData.timeTo}
                onChange={(e) => setFormData({ ...formData, timeTo: e.target.value })}
                required
              />
            </div>

            <Input
              label="Number of Guests"
              type="number"
              min={1}
              max={100}
              value={formData.numberOfPeople}
              onChange={(e) => setFormData({ ...formData, numberOfPeople: parseInt(e.target.value) || 1 })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 sm:mb-2">
                Status
              </label>
              <select
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-sm sm:text-base text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] shadow-sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="SEATED">Seated</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Cancel Reservation - dangerous action */}
            {reservation.status !== 'CANCELLED' && !isPastReservation && (
              <div className="border-t border-[var(--border-color)] pt-4 mt-2">
                <p className="text-sm text-[var(--text-muted)] mb-3">
                  Cancelling a reservation will notify the guest and cannot be undone.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="!border-[var(--error)] !text-[var(--error)] hover:!bg-[var(--error)]/10"
                  onClick={handleCancelReservation}
                  isLoading={isCancelling}
                >
                  Cancel Reservation
                </Button>
              </div>
            )}

            <div className="flex gap-2 sm:gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 text-sm sm:text-base py-2.5 sm:py-3"
              >
                Close
              </Button>
              <Button 
                type="submit" 
                isLoading={isSaving} 
                className="flex-1 text-sm sm:text-base py-2.5 sm:py-3"
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
