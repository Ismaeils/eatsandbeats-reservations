'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { addMinutes, format } from 'date-fns'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Logo from '@/components/Logo'
import RestaurantLogo from '@/components/RestaurantLogo'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import FloorPlanViewer from '@/components/FloorPlanViewer'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { FloorPlanElement } from '@/types/floor-plan'

interface FloorPlan {
  id: string
  name: string
  order: number
  width: number
  height: number
  elements: FloorPlanElement[]
}

export default function ReservationFormPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [restaurant, setRestaurant] = useState<any>(null)
  const [availability, setAvailability] = useState<any>(null)
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([])
  const [hasVisualLayout, setHasVisualLayout] = useState(false)
  const [showFloorPlan, setShowFloorPlan] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    guestContact: '',
    numberOfPeople: '2',
    selectedDate: null as Date | null,
    selectedTime: null as string | null,
    tableId: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fetchFloorPlans = useCallback(async () => {
    try {
      const response = await fetch(`/api/public/floor-plans?token=${token}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setHasVisualLayout(data.data.hasVisualLayout)
        setFloorPlans(data.data.floorPlans || [])
      }
    } catch (err) {
      console.error('Failed to fetch floor plans:', err)
    }
  }, [token])

  useEffect(() => {
    fetchAvailability()
    fetchFloorPlans()
  }, [token, fetchFloorPlans])

  const fetchAvailability = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/public/availability?token=${token}`)
      const data = await response.json()
      
      if (data.success) {
        setAvailability(data.data)
        setRestaurant({
          name: data.data.restaurantName,
          logoUrl: data.data.logoUrl,
          tableLayout: data.data.tableLayout,
        })
      } else {
        setError(data.error || 'Failed to load reservation form')
      }
    } catch (err) {
      setError('Failed to load reservation form')
    } finally {
      setIsLoading(false)
    }
  }

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
      
      const duration = availability?.reservationDuration || 120
      const timeTo = addMinutes(timeFrom, duration)

      const payload = {
        invitationToken: token,
        guestName: formData.guestName.trim(),
        guestContact: formData.guestContact.trim(),
        numberOfPeople: parseInt(formData.numberOfPeople),
        timeFrom: timeFrom.toISOString(),
        timeTo: timeTo.toISOString(),
        tableId: formData.tableId || undefined,
      }

      console.log('Submitting reservation with payload:', payload)

      const response = await apiClient.post('/reservations/create', payload) as any
      console.log('Reservation response:', response)
      if (response?.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/reservation-success')
        }, 3000)
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

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-[var(--text-secondary)] text-xl">Loading...</div>
        </div>
      </ThemeProvider>
    )
  }

  if (error && !availability) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-[var(--error)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                Unable to Load Form
              </h1>
              <p className="text-[var(--text-secondary)]">{error}</p>
            </div>
          </Card>
        </div>
      </ThemeProvider>
    )
  }

  if (success) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Logos */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <Logo size="md" />
              {restaurant && (
                <>
                  <div className="h-12 w-px bg-[var(--glass-border)]" />
                  <RestaurantLogo 
                    logoUrl={restaurant.logoUrl} 
                    restaurantName={restaurant.name}
                    size="md"
                  />
                </>
              )}
            </div>
            <Card>
              <div className="text-center">
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
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                  Reservation Created!
                </h1>
                <p className="text-[var(--text-secondary)]">
                  Your reservation has been submitted successfully.
                  {formData.tableId && (
                    <span className="block mt-2 text-[var(--color-primary)]">
                      Table: {formData.tableId}
                    </span>
                  )}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Logos */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <Logo size="lg" />
            {restaurant && (
              <>
                <div className="h-16 w-px bg-[var(--glass-border)]" />
                <RestaurantLogo 
                  logoUrl={restaurant.logoUrl} 
                  restaurantName={restaurant.name}
                  size="lg"
                />
              </>
            )}
          </div>

          <Card>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                Make a Reservation
              </h1>
              <p className="text-[var(--text-secondary)]">
                {restaurant ? `at ${restaurant.name}` : 'Please fill in the details below'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Guest Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
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
                max="20"
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
                openingHours={availability?.openingHours || []}
                exceptionalDates={availability?.exceptionalDates || []}
                reservationDuration={availability?.reservationDuration || 120}
                slotGranularity={availability?.slotGranularity || 15}
              />

              {/* Table Selection */}
              {hasVisualLayout && floorPlans.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-[var(--text-secondary)]">
                      Choose Your Table (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowFloorPlan(!showFloorPlan)}
                      className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      {showFloorPlan ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Hide Floor Plan
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          View Floor Plan
                        </>
                      )}
                    </button>
                  </div>

                  {showFloorPlan && (
                    <div className="border border-[var(--glass-border)] rounded-xl p-4 bg-[var(--bg-hover)]">
                      <FloorPlanViewer
                        floorPlans={floorPlans}
                        selectedTableId={formData.tableId || null}
                        onSelectTable={handleTableSelect}
                        occupiedTableIds={[]} // TODO: Could pass occupied tables for the selected time slot
                      />
                    </div>
                  )}

                  {formData.tableId && (
                    <div className="flex items-center justify-between p-3 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-lg">
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

                  {!formData.tableId && (
                    <p className="text-xs text-[var(--text-muted)]">
                      💡 You can skip table selection and one will be assigned automatically.
                    </p>
                  )}
                </div>
              ) : restaurant?.tableLayout && restaurant.tableLayout.length > 0 ? (
                /* Fallback to dropdown if no visual layout */
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Preferred Table (Optional)
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] shadow-sm"
                    value={formData.tableId}
                    onChange={(e) =>
                      setFormData({ ...formData, tableId: e.target.value })
                    }
                  >
                    <option value="">No preference (auto-assign)</option>
                    {restaurant.tableLayout.map((tableId: string) => (
                      <option key={tableId} value={tableId}>
                        {tableId}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {/* Summary */}
              {formData.selectedDate && formData.selectedTime && (
                <div className="bg-[var(--bg-hover)] rounded-lg p-4 border border-[var(--glass-border)]">
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Reservation Summary</h3>
                  <div className="space-y-1">
                    <p className="text-[var(--text-primary)]">
                      📅 {format(formData.selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-[var(--color-primary)] font-medium">
                      🕐 {(() => {
                        const [h, m] = formData.selectedTime.split(':').map(Number)
                        const start = new Date()
                        start.setHours(h, m)
                        const end = addMinutes(start, availability?.reservationDuration || 120)
                        return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
                      })()}
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      👥 {formData.numberOfPeople} {parseInt(formData.numberOfPeople) === 1 ? 'person' : 'people'}
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
                Submit Reservation
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  )
}
