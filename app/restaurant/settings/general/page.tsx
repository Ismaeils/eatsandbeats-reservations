'use client'

import Button from '@/components/Button'
import Card from '@/components/Card'
import ImageUpload from '@/components/ImageUpload'
import Input from '@/components/Input'
import Layout from '@/components/Layout'
import apiClient from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Available options - can be extended later
const COUNTRIES = [{ code: 'UAE', name: 'United Arab Emirates' }]
const LANGUAGES = [{ code: 'en', name: 'English' }]
const CURRENCIES = [{ code: 'AED', name: 'UAE Dirham (AED)' }]

// Currency symbol mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  AED: 'AED',
  USD: '$',
  EUR: '€',
}

export default function GeneralSettingsPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [formData, setFormData] = useState({
    logoUrl: '',
    reservationDeposit: '',
    averageSeatingTime: '',
    reservationDuration: '120',
    slotGranularity: '15',
    maxSimultaneousReservations: '10',
    autoConfirmReservations: false,
    cuisines: '',
    isPublished: false,
    country: 'UAE',
    language: 'en',
    currency: 'AED',
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
          maxSimultaneousReservations: res.maxSimultaneousReservations?.toString() || '10',
          autoConfirmReservations: res.autoConfirmReservations || false,
          cuisines: res.cuisines?.join(', ') || '',
          isPublished: res.isPublished || false,
          country: res.country || 'UAE',
          language: res.language || 'en',
          currency: res.currency || 'AED',
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
        maxSimultaneousReservations: parseInt(formData.maxSimultaneousReservations),
        autoConfirmReservations: formData.autoConfirmReservations,
        cuisines: formData.cuisines.split(',').map(c => c.trim()).filter(c => c),
        isPublished: formData.isPublished,
        country: formData.country,
        language: formData.language,
        currency: formData.currency,
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
            {/* Publish Status */}
            <div className={`p-4 rounded-2xl border ${formData.isPublished ? 'bg-[var(--success)]/10 border-[var(--success)]/30' : 'bg-[var(--warning)]/10 border-[var(--warning)]/30'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    {formData.isPublished ? 'Restaurant is Published' : 'Restaurant is in Preview Mode'}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {formData.isPublished 
                      ? 'Your restaurant is visible to the public and can accept reservations.'
                      : 'Your restaurant is hidden from public listings. Only you can see it.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-[var(--bg-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--success)]"></div>
                </label>
              </div>
            </div>

            <ImageUpload
              label="Restaurant Logo"
              currentImageUrl={formData.logoUrl}
              onUpload={(url) => setFormData({ ...formData, logoUrl: url })}
              type="logo"
            />

            {/* Country, Language, Currency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={`Reservation Deposit (${CURRENCY_SYMBOLS[formData.currency] || formData.currency})`}
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

            <div>
              <Input
                label="Max Simultaneous Reservations"
                type="number"
                min="1"
                max="1000"
                value={formData.maxSimultaneousReservations}
                onChange={(e) => setFormData({ ...formData, maxSimultaneousReservations: e.target.value })}
                required
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Maximum number of overlapping reservations allowed at any time slot. When this limit is reached, time slots will be disabled for new reservations.
              </p>
            </div>

            {/* Auto-Confirm Reservations */}
            <div className={`p-4 rounded-2xl border ${formData.autoConfirmReservations ? 'bg-[var(--info)]/10 border-[var(--info)]/30' : 'bg-[var(--bg-hover)] border-[var(--border-color)]'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    {formData.autoConfirmReservations ? 'Auto-Confirm Enabled' : 'Manual Approval Required'}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {formData.autoConfirmReservations 
                      ? 'Reservations are confirmed automatically when guests book.'
                      : 'New reservations will be pending until you approve them.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoConfirmReservations}
                    onChange={(e) => setFormData({ ...formData, autoConfirmReservations: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-[var(--bg-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--info)]"></div>
                </label>
              </div>
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
