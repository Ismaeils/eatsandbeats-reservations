'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Layout from '@/components/Layout'

export default function RestaurantConfigPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [formData, setFormData] = useState({
    logoUrl: '',
    reservationDeposit: '',
    averageSeatingTime: '',
    tableLayout: '',
    cuisines: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchRestaurant()
  }, [])

  const fetchRestaurant = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/restaurants/me') as any
      if (response.success) {
        const res = response.data
        setRestaurant(res)
        setFormData({
          logoUrl: res.logoUrl || '',
          reservationDeposit: res.reservationDeposit.toString(),
          averageSeatingTime: res.averageSeatingTime.toString(),
          tableLayout: res.tableLayout.join(', '),
          cuisines: res.cuisines.join(', '),
        })
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load restaurant configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsSaving(true)

    try {
      const payload: any = {
        logoUrl: formData.logoUrl || null,
        reservationDeposit: parseFloat(formData.reservationDeposit),
        averageSeatingTime: parseInt(formData.averageSeatingTime),
        tableLayout: formData.tableLayout
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        cuisines: formData.cuisines
          .split(',')
          .map((c) => c.trim())
          .filter((c) => c.length > 0),
      }

      const response = await apiClient.patch('/restaurants/config', payload) as any
      if (response.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        fetchRestaurant()
      }
    } catch (err: any) {
      setError(err.error || 'Failed to update configuration')
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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <h1 className="text-3xl font-bold text-white mb-6">Restaurant Configuration</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6">
              Configuration updated successfully!
            </div>
          )}

          {restaurant && (
            <div className="mb-6 space-y-2 text-white/80">
              <p>
                <span className="font-semibold">Restaurant Name:</span> {restaurant.name}
              </p>
              <p>
                <span className="font-semibold">Address:</span> {restaurant.address}
              </p>
              <p className="text-sm text-white/60">
                Name and address cannot be changed
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Logo URL"
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-sm text-white/60">
              Enter a URL to your restaurant logo image
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Reservation Deposit ($)"
                type="number"
                step="0.01"
                min="0"
                value={formData.reservationDeposit}
                onChange={(e) =>
                  setFormData({ ...formData, reservationDeposit: e.target.value })
                }
                required
              />

              <Input
                label="Average Seating Time (minutes)"
                type="number"
                min="15"
                max="300"
                value={formData.averageSeatingTime}
                onChange={(e) =>
                  setFormData({ ...formData, averageSeatingTime: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Input
                label="Table Layout (comma-separated)"
                type="text"
                value={formData.tableLayout}
                onChange={(e) =>
                  setFormData({ ...formData, tableLayout: e.target.value })
                }
                required
                placeholder="T1, T2, TB01, TB02"
              />
              <p className="text-sm text-white/60 mt-1">
                Enter table identifiers separated by commas
              </p>
            </div>

            <div>
              <Input
                label="Cuisines (comma-separated)"
                type="text"
                value={formData.cuisines}
                onChange={(e) =>
                  setFormData({ ...formData, cuisines: e.target.value })
                }
                placeholder="Italian, Mediterranean, Seafood"
              />
              <p className="text-sm text-white/60 mt-1">
                Enter cuisine types separated by commas
              </p>
            </div>

            <Button type="submit" isLoading={isSaving} className="w-full">
              Save Configuration
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  )
}

