'use client'

import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Layout from '@/components/Layout'
import apiClient from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function GeneralSettingsPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [formData, setFormData] = useState({
    logoUrl: '',
    reservationDeposit: '',
    averageSeatingTime: '',
    reservationDuration: '120',
    slotGranularity: '15',
    cuisines: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/restaurants/me') as any
      if (response?.success) {
        const res = response.data
        setRestaurant(res)
        setFormData({
          logoUrl: res.logoUrl || '',
          reservationDeposit: res.reservationDeposit?.toString() || '0',
          averageSeatingTime: res.averageSeatingTime?.toString() || '60',
          reservationDuration: res.reservationDuration?.toString() || '120',
          slotGranularity: res.slotGranularity?.toString() || '15',
          cuisines: res.cuisines?.join(', ') || '',
        })
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const payload = {
        logoUrl: formData.logoUrl || null,
        reservationDeposit: parseFloat(formData.reservationDeposit),
        averageSeatingTime: parseInt(formData.averageSeatingTime),
        reservationDuration: parseInt(formData.reservationDuration),
        slotGranularity: parseInt(formData.slotGranularity),
        cuisines: formData.cuisines.split(',').map(c => c.trim()).filter(c => c),
      }

      const response = await apiClient.patch('/restaurants/config', payload) as any
      if (response?.success) {
        setSuccess('Settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">General Settings</h1>

        {/* Messages */}
        {error && (
          <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-[20px] text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-[var(--success)]/20 border border-[var(--success)]/50 text-[var(--success)] px-4 py-3 rounded-[20px] text-sm">
            {success}
          </div>
        )}

        <Card>
          
          {restaurant && (
            <div className="mb-6 space-y-2 text-[var(--text-secondary)] pb-6 border-b border-[var(--border-color)]">
              <p><span className="font-semibold text-[var(--text-primary)]">Name:</span> {restaurant.name}</p>
              <p><span className="font-semibold text-[var(--text-primary)]">Address:</span> {restaurant.address}</p>
              <p className="text-sm text-[var(--text-muted)]">Name and address cannot be changed</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Reservation Deposit ($)"
                type="number"
                step="0.01"
                min="0"
                value={formData.reservationDeposit}
                onChange={(e) => setFormData({ ...formData, reservationDeposit: e.target.value })}
                required
              />
              <Input
                label="Average Seating Time (minutes)"
                type="number"
                min="15"
                value={formData.averageSeatingTime}
                onChange={(e) => setFormData({ ...formData, averageSeatingTime: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Default Reservation Duration (minutes)"
                type="number"
                min="30"
                step="15"
                value={formData.reservationDuration}
                onChange={(e) => setFormData({ ...formData, reservationDuration: e.target.value })}
                required
              />
              <Input
                label="Time Slot Granularity (minutes)"
                type="number"
                min="5"
                max="60"
                step="5"
                value={formData.slotGranularity}
                onChange={(e) => setFormData({ ...formData, slotGranularity: e.target.value })}
                required
              />
            </div>

            {/* Table Layout - Read Only */}
            <div className="p-4 bg-[var(--bg-hover)] rounded-2xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  Table Layout
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/restaurant/settings/floor-plan')}
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  Manage in Floor Plan →
                </button>
              </div>
              {restaurant?.tableLayout && restaurant.tableLayout.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {restaurant.tableLayout.map((tableId: string) => (
                    <span
                      key={tableId}
                      className="px-3 py-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium border border-[var(--color-primary)]/20"
                    >
                      {tableId}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[var(--warning)] text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>No tables configured. Add tables in the Floor Plan.</span>
                </div>
              )}
            </div>

            <Input
              label="Cuisines (comma-separated)"
              type="text"
              value={formData.cuisines}
              onChange={(e) => setFormData({ ...formData, cuisines: e.target.value })}
              placeholder="Italian, Mediterranean, Seafood"
            />

            <Button type="submit" isLoading={isSaving} className="w-full">
              Save Settings
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
