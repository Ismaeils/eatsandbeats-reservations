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
  const [formData, setFormData] = useState({
    timeFrom: '',
    timeTo: '',
    tableId: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

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
        setFormData({
          timeFrom: format(new Date(res.timeFrom), "yyyy-MM-dd'T'HH:mm"),
          timeTo: format(new Date(res.timeTo), "yyyy-MM-dd'T'HH:mm"),
          tableId: res.tableId || '',
        })
      }

      if (restaurantRes?.success) {
        setRestaurant(restaurantRes.data)
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
          <div className="text-white text-xl">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (!reservation) {
    return (
      <Layout>
        <Card>
          <p className="text-white">Reservation not found</p>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <h1 className="text-3xl font-bold text-white mb-6">Edit Reservation</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="mb-6 space-y-2">
            <p className="text-white/80">
              <span className="font-semibold">Guest:</span> {reservation.guestName}
            </p>
            <p className="text-white/80">
              <span className="font-semibold">Contact:</span> {reservation.guestContact}
            </p>
            <p className="text-white/80">
              <span className="font-semibold">Party Size:</span> {reservation.numberOfPeople}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {restaurant && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Table
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg glass border border-white/20 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  value={formData.tableId}
                  onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                >
                  <option value="">Select a table</option>
                  {restaurant.tableLayout.map((tableId: string) => (
                    <option key={tableId} value={tableId} className="bg-gray-800">
                      {tableId}
                    </option>
                  ))}
                </select>
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
              <Button type="submit" isLoading={isSaving} className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}

