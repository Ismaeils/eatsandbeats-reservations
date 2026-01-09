'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'

export default function ReservationFormPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [restaurant, setRestaurant] = useState<any>(null)
  const [formData, setFormData] = useState({
    guestName: '',
    guestContact: '',
    numberOfPeople: '1',
    timeFrom: '',
    timeTo: '',
    tableId: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Note: In a real implementation, you'd fetch invitation details
    // For now, we'll just show the form
    setIsLoading(false)
  }, [token])

  const calculateEndTime = (startTime: string, minutes: number) => {
    if (!startTime) return ''
    const start = new Date(startTime)
    const end = new Date(start.getTime() + minutes * 60000)
    return end.toISOString().slice(0, 16)
  }

  const handleTimeFromChange = (value: string) => {
    setFormData({ ...formData, timeFrom: value })
    if (restaurant && restaurant.averageSeatingTime) {
      const endTime = calculateEndTime(value, restaurant.averageSeatingTime)
      setFormData((prev) => ({ ...prev, timeTo: endTime }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.guestName || !formData.guestContact || !formData.timeFrom || !formData.timeTo) {
        setError('Please fill in all required fields')
        setIsSubmitting(false)
        return
      }

      // Convert datetime-local to ISO string
      const timeFromDate = new Date(formData.timeFrom)
      const timeToDate = new Date(formData.timeTo)

      if (isNaN(timeFromDate.getTime()) || isNaN(timeToDate.getTime())) {
        setError('Invalid date format. Please select valid dates.')
        setIsSubmitting(false)
        return
      }

      const payload = {
        invitationToken: token,
        guestName: formData.guestName.trim(),
        guestContact: formData.guestContact.trim(),
        numberOfPeople: parseInt(formData.numberOfPeople),
        timeFrom: timeFromDate.toISOString(),
        timeTo: timeToDate.toISOString(),
        tableId: formData.tableId || undefined,
      }

      console.log('Submitting reservation with payload:', payload)

      const response = await apiClient.post('/reservations/create', payload) as any
      console.log('Reservation response:', response)
      if (response?.success) {
        setSuccess(true)
        // In a real implementation, redirect to payment page if deposit required
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-green-400"
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
            <h1 className="text-3xl font-bold text-white mb-4">
              Reservation Created!
            </h1>
            <p className="text-white/80">
              Your reservation has been submitted successfully.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Make a Reservation
          </h1>
          <p className="text-white/80">
            Please fill in the details below to complete your reservation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Number of People"
              type="number"
              min="1"
              value={formData.numberOfPeople}
              onChange={(e) =>
                setFormData({ ...formData, numberOfPeople: e.target.value })
              }
              required
            />

            {restaurant && restaurant.tableLayout.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Preferred Table
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg glass border border-white/20 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  value={formData.tableId}
                  onChange={(e) =>
                    setFormData({ ...formData, tableId: e.target.value })
                  }
                >
                  <option value="">No preference</option>
                  {restaurant.tableLayout.map((tableId: string) => (
                    <option key={tableId} value={tableId} className="bg-gray-800">
                      {tableId}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Reservation Date & Time"
              type="datetime-local"
              value={formData.timeFrom}
              onChange={(e) => handleTimeFromChange(e.target.value)}
              required
            />

            <Input
              label="End Time"
              type="datetime-local"
              value={formData.timeTo}
              onChange={(e) =>
                setFormData({ ...formData, timeTo: e.target.value })
              }
              required
            />
          </div>

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Submit Reservation
          </Button>
        </form>
      </Card>
    </div>
  )
}

