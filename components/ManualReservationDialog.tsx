'use client'

import { useState, useEffect } from 'react'
import { addMinutes, format } from 'date-fns'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Input from '@/components/Input'
import TimeSlotPicker from '@/components/TimeSlotPicker'

interface ManualReservationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  restaurant: any
}

export default function ManualReservationDialog({
  isOpen,
  onClose,
  onSuccess,
  restaurant,
}: ManualReservationDialogProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    guestContact: '',
    numberOfPeople: '2',
    selectedDate: null as Date | null,
    selectedTime: null as string | null,
  })
  const [openingHours, setOpeningHours] = useState<any[]>([])
  const [exceptionalDates, setExceptionalDates] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        guestName: '',
        guestContact: '',
        numberOfPeople: '2',
        selectedDate: null,
        selectedTime: null,
      })
      setError('')
      setSuccess(false)
      fetchRestaurantData()
    }
  }, [isOpen])

  const fetchRestaurantData = async () => {
    try {
      // Fetch opening hours
      const hoursRes = await apiClient.get('/restaurants/opening-hours') as any
      if (hoursRes?.success) {
        setOpeningHours(hoursRes.data || [])
      }

      // Fetch exceptional dates
      const datesRes = await apiClient.get('/restaurants/exceptional-dates') as any
      if (datesRes?.success) {
        setExceptionalDates(datesRes.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch restaurant data:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.guestName || !formData.guestContact || !formData.selectedDate || !formData.selectedTime) {
        setError('Please fill in all required fields')
        setIsSubmitting(false)
        return
      }

      // Calculate timeFrom and timeTo
      const [hours, minutes] = formData.selectedTime.split(':').map(Number)
      const timeFrom = new Date(formData.selectedDate)
      timeFrom.setHours(hours, minutes, 0, 0)
      
      const duration = restaurant?.reservationDuration || 120
      const timeTo = addMinutes(timeFrom, duration)

      const payload = {
        guestName: formData.guestName.trim(),
        guestContact: formData.guestContact.trim(),
        numberOfPeople: parseInt(formData.numberOfPeople),
        timeFrom: timeFrom.toISOString(),
        timeTo: timeTo.toISOString(),
      }

      const response = await apiClient.post('/reservations/manual', payload) as any
      
      if (response?.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(response?.error || 'Failed to create reservation. Please try again.')
      }
    } catch (err: any) {
      const errorMessage = err?.error || err?.message || 'Failed to create reservation. Please try again.'
      setError(errorMessage)
      console.error('Reservation creation error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Create Manual Reservation</h2>
              <p className="text-sm text-[var(--text-muted)]">Fill in guest details to create a reservation</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-16 w-16 text-[var(--success)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  Reservation Created!
                </h3>
                <p className="text-[var(--text-secondary)]">
                  The reservation has been added successfully.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Guest Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Guest Name"
                    type="text"
                    value={formData.guestName}
                    onChange={(e) =>
                      setFormData({ ...formData, guestName: e.target.value })
                    }
                    required
                    placeholder="John Doe"
                  />

                  <Input
                    label="Contact (Phone or Email)"
                    type="text"
                    value={formData.guestContact}
                    onChange={(e) =>
                      setFormData({ ...formData, guestContact: e.target.value })
                    }
                    required
                    placeholder="+1234567890 or email@example.com"
                  />
                </div>

                {/* Party Size */}
                <Input
                  label="Number of People"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.numberOfPeople}
                  onChange={(e) =>
                    setFormData({ ...formData, numberOfPeople: e.target.value })
                  }
                  required
                />

                {/* Date & Time Selection */}
                <TimeSlotPicker
                  selectedDate={formData.selectedDate}
                  selectedTime={formData.selectedTime}
                  onDateChange={(date) => setFormData({ ...formData, selectedDate: date, selectedTime: null })}
                  onTimeChange={(time) => setFormData({ ...formData, selectedTime: time })}
                  openingHours={openingHours}
                  exceptionalDates={exceptionalDates}
                  reservationDuration={restaurant?.reservationDuration || 120}
                  slotGranularity={restaurant?.slotGranularity || 15}
                />

                {/* Summary */}
                {formData.selectedDate && formData.selectedTime && (
                  <div className="bg-[var(--bg-hover)] rounded-2xl p-4 border border-[var(--border-color)]">
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Reservation Summary</h3>
                    <div className="space-y-1">
                      <p className="text-[var(--text-primary)]">
                        {formData.guestName || 'Guest name not entered'}
                      </p>
                      <p className="text-[var(--text-primary)]">
                        {format(formData.selectedDate, 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-[var(--color-primary)] font-medium">
                        {(() => {
                          const [h, m] = formData.selectedTime.split(':').map(Number)
                          const start = new Date()
                          start.setHours(h, m)
                          const end = addMinutes(start, restaurant?.reservationDuration || 120)
                          return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
                        })()}
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        {formData.numberOfPeople} {parseInt(formData.numberOfPeople) === 1 ? 'guest' : 'guests'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-[var(--border-color)]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    isLoading={isSubmitting} 
                    className="flex-1"
                    disabled={!formData.selectedDate || !formData.selectedTime || !formData.guestName || !formData.guestContact}
                  >
                    Create Reservation
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
