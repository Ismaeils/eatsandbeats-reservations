'use client'

import Button from '@/components/Button'
import Card from '@/components/Card'
import Layout from '@/components/Layout'
import apiClient from '@/lib/api-client'
import { useEffect, useState } from 'react'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

interface OpeningHour {
  dayOfWeek: number
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
}

export default function HoursSettingsPage() {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(
    DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.value,
      isOpen: true,
      openTime: '09:00',
      closeTime: '22:00',
    }))
  )
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
      const response = await apiClient.get('/restaurants/opening-hours') as any
      if (response?.success && response.data.length > 0) {
        setOpeningHours(
          DAYS_OF_WEEK.map(day => {
            const existing = response.data.find((h: any) => h.dayOfWeek === day.value)
            return existing || {
              dayOfWeek: day.value,
              isOpen: true,
              openTime: '09:00',
              closeTime: '22:00',
            }
          })
        )
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load opening hours')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const response = await apiClient.post('/restaurants/opening-hours', {
        hours: openingHours,
      }) as any
      
      if (response?.success) {
        setSuccess('Opening hours saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to save opening hours')
    } finally {
      setIsSaving(false)
    }
  }

  const updateHour = (dayOfWeek: number, field: keyof OpeningHour, value: any) => {
    setOpeningHours(hours =>
      hours.map(h =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      )
    )
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
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">Opening Hours</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Set your standard weekly operating hours. For special dates like holidays, use the Exceptions page.
          </p>
        </div>

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
          
          <div className="space-y-3">
            {DAYS_OF_WEEK.map(day => {
              const hour = openingHours.find(h => h.dayOfWeek === day.value)!
              return (
                <div key={day.value} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-[var(--bg-hover)] rounded-2xl">
                  <div className="w-28 font-medium text-[var(--text-primary)]">{day.label}</div>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hour.isOpen}
                      onChange={(e) => updateHour(day.value, 'isOpen', e.target.checked)}
                      className="w-5 h-5 rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--text-secondary)]">Open</span>
                  </label>

                  {hour.isOpen && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={hour.openTime || '09:00'}
                        onChange={(e) => updateHour(day.value, 'openTime', e.target.value)}
                        className="px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
                      />
                      <span className="text-[var(--text-muted)]">to</span>
                      <input
                        type="time"
                        value={hour.closeTime || '22:00'}
                        onChange={(e) => updateHour(day.value, 'closeTime', e.target.value)}
                        className="px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
                      />
                    </div>
                  )}

                  {!hour.isOpen && (
                    <span className="text-[var(--text-muted)] text-sm">Closed</span>
                  )}
                </div>
              )
            })}
          </div>

          <Button onClick={handleSave} isLoading={isSaving} className="w-full mt-6">
            Save Opening Hours
          </Button>
        </Card>
      </div>
    </Layout>
  )
}
