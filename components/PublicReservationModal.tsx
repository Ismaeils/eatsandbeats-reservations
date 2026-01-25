'use client'

import Button from '@/components/Button'
import FloorPlanViewer from '@/components/FloorPlanViewer'
import Input from '@/components/Input'
import RestaurantLogo from '@/components/RestaurantLogo'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import { FloorPlanElement } from '@/types/floor-plan'
import { addMinutes, format } from 'date-fns'
import { useEffect, useState } from 'react'

interface FloorPlan {
  id: string
  name: string
  order: number
  width: number
  height: number
  elements: FloorPlanElement[]
}

interface Restaurant {
  id: string
  name: string
  logoUrl?: string
  cuisines: string[]
  address: string
  reservationDuration: number
  slotGranularity: number
  tableLayout: string[]
  hasVisualLayout: boolean
  openingHours: {
    dayOfWeek: number
    isOpen: boolean
    openTime: string | null
    closeTime: string | null
  }[]
  exceptionalDates: {
    date: string
    isOpen: boolean
    openTime: string | null
    closeTime: string | null
    note?: string
  }[]
  floorPlans: FloorPlan[]
}

interface PublicReservationModalProps {
  restaurant: Restaurant
  isOpen: boolean
  onClose: () => void
}

export default function PublicReservationModal({ restaurant, isOpen, onClose }: PublicReservationModalProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    guestContact: '',
    numberOfPeople: '2',
    selectedDate: null as Date | null,
    selectedTime: null as string | null,
    tableId: '',
  })
  const [showFloorPlan, setShowFloorPlan] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        guestName: '',
        guestContact: '',
        numberOfPeople: '2',
        selectedDate: null,
        selectedTime: null,
        tableId: '',
      })
      setError('')
      setSuccess(false)
      setShowFloorPlan(false)
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleTableSelect = (tableId: string | null) => {
    setFormData({ ...formData, tableId: tableId || '' })
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
      
      const duration = restaurant.reservationDuration || 120
      const timeTo = addMinutes(timeFrom, duration)

      const payload = {
        restaurantId: restaurant.id,
        guestName: formData.guestName.trim(),
        guestContact: formData.guestContact.trim(),
        numberOfPeople: parseInt(formData.numberOfPeople),
        timeFrom: timeFrom.toISOString(),
        timeTo: timeTo.toISOString(),
        tableId: formData.tableId || undefined,
      }

      const response = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to create reservation. Please try again.')
      }
    } catch (err: any) {
      setError('Failed to create reservation. Please try again.')
      console.error('Reservation creation error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--bg-card)] rounded-[25px] shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          /* Success State */
          <div className="p-8 text-center">
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
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Reservation Confirmed!
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Your reservation at {restaurant.name} has been submitted successfully.
            </p>
            {formData.selectedDate && formData.selectedTime && (
              <div className="inline-block bg-[var(--bg-hover)] rounded-[20px] p-4 mb-6">
                <p className="text-[var(--text-primary)] font-medium">
                  {format(formData.selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-[var(--color-primary)]">
                  {formData.selectedTime}
                </p>
                <p className="text-[var(--text-muted)] text-sm">
                  {formData.numberOfPeople} {parseInt(formData.numberOfPeople) === 1 ? 'guest' : 'guests'}
                </p>
              </div>
            )}
            <Button onClick={onClose} className="w-full max-w-xs">
              Done
            </Button>
          </div>
        ) : (
          /* Reservation Form */
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pr-8">
              <RestaurantLogo 
                logoUrl={restaurant.logoUrl} 
                restaurantName={restaurant.name}
                size="md"
              />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Make a Reservation
                </h2>
                <p className="text-[var(--text-secondary)]">
                  at {restaurant.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-[20px] text-sm">
                  {error}
                </div>
              )}

              {/* Guest Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  required
                  placeholder="John Doe"
                />
                <Input
                  label="Contact (Phone or Email)"
                  type="text"
                  value={formData.guestContact}
                  onChange={(e) => setFormData({ ...formData, guestContact: e.target.value })}
                  required
                  placeholder="+1234567890"
                />
              </div>

              {/* Party Size */}
              <Input
                label="Number of Guests"
                type="number"
                min="1"
                max="20"
                value={formData.numberOfPeople}
                onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })}
                required
              />

              {/* Date & Time Selection */}
              <TimeSlotPicker
                selectedDate={formData.selectedDate}
                selectedTime={formData.selectedTime}
                onDateChange={(date) => setFormData({ ...formData, selectedDate: date, selectedTime: null })}
                onTimeChange={(time) => setFormData({ ...formData, selectedTime: time })}
                openingHours={restaurant.openingHours}
                exceptionalDates={restaurant.exceptionalDates}
                reservationDuration={restaurant.reservationDuration}
                slotGranularity={restaurant.slotGranularity}
              />

              {/* Table Selection */}
              {restaurant.hasVisualLayout && restaurant.floorPlans.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-[var(--text-secondary)]">
                      Choose Your Table (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowFloorPlan(!showFloorPlan)}
                      className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      {showFloorPlan ? 'Hide Floor Plan' : 'View Floor Plan'}
                    </button>
                  </div>

                  {showFloorPlan && (
                    <div className="border border-[var(--border-color)] rounded-[20px] p-4 bg-[var(--bg-hover)]">
                      <FloorPlanViewer
                        floorPlans={restaurant.floorPlans}
                        selectedTableId={formData.tableId || null}
                        onSelectTable={handleTableSelect}
                        occupiedTableIds={[]}
                      />
                    </div>
                  )}

                  {formData.tableId && (
                    <div className="flex items-center justify-between p-3 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-[20px]">
                      <span className="text-sm text-[var(--text-primary)]">
                        Selected Table: <strong>{formData.tableId}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTableSelect(null)}
                        className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Summary */}
              {formData.selectedDate && formData.selectedTime && (
                <div className="bg-[var(--bg-hover)] rounded-[20px] p-4 border border-[var(--border-color)]">
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Reservation Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-[var(--text-primary)]">
                      📅 {format(formData.selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-[var(--color-primary)] font-medium">
                      🕐 {(() => {
                        const [h, m] = formData.selectedTime.split(':').map(Number)
                        const start = new Date()
                        start.setHours(h, m)
                        const end = addMinutes(start, restaurant.reservationDuration)
                        return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
                      })()}
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      👥 {formData.numberOfPeople} {parseInt(formData.numberOfPeople) === 1 ? 'guest' : 'guests'}
                    </p>
                    {formData.tableId && (
                      <p className="text-[var(--text-secondary)]">
                        🪑 Table {formData.tableId}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                isLoading={isSubmitting} 
                className="w-full"
                disabled={!formData.selectedDate || !formData.selectedTime}
              >
                Confirm Reservation
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
