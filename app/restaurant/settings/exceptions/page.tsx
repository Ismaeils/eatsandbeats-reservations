'use client'

import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Layout from '@/components/Layout'
import apiClient from '@/lib/api-client'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

interface ExceptionalDate {
  id?: string
  date: string
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
  note: string | null
}

export default function ExceptionsSettingsPage() {
  const [exceptionalDates, setExceptionalDates] = useState<ExceptionalDate[]>([])
  const [newException, setNewException] = useState<ExceptionalDate>({
    date: '',
    isOpen: false,
    openTime: null,
    closeTime: null,
    note: '',
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
      const response = await apiClient.get('/restaurants/exceptional-dates') as any
      if (response?.success) {
        setExceptionalDates(
          response.data.map((e: any) => ({
            ...e,
            date: e.date.split('T')[0],
          }))
        )
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load exceptional dates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddException = async () => {
    if (!newException.date) {
      setError('Please select a date')
      return
    }

    setError('')
    setIsSaving(true)

    try {
      const response = await apiClient.post('/restaurants/exceptional-dates', {
        date: newException.date,
        isOpen: newException.isOpen,
        openTime: newException.isOpen ? newException.openTime : null,
        closeTime: newException.isOpen ? newException.closeTime : null,
        note: newException.note || null,
      }) as any
      
      if (response?.success) {
        setExceptionalDates([...exceptionalDates, {
          ...response.data,
          date: response.data.date.split('T')[0],
        }])
        setNewException({
          date: '',
          isOpen: false,
          openTime: null,
          closeTime: null,
          note: '',
        })
        setSuccess('Exceptional date added successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to add exceptional date')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteException = async (date: string) => {
    setError('')
    setIsSaving(true)

    try {
      const response = await apiClient.delete(`/restaurants/exceptional-dates?date=${date}`) as any
      if (response?.success) {
        setExceptionalDates(exceptionalDates.filter(e => e.date !== date))
        setSuccess('Exceptional date removed successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to remove exceptional date')
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
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">Exceptional Dates</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Add special dates like holidays or events where your hours differ from the regular schedule.
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

          {/* Add New Exception */}
          <div className="p-4 bg-[var(--bg-hover)] rounded-2xl mb-6 space-y-4">
            <h3 className="font-medium text-[var(--text-primary)]">Add Exception</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={newException.date}
                onChange={(e) => setNewException({ ...newException, date: e.target.value })}
              />
              <Input
                label="Note (optional)"
                type="text"
                value={newException.note || ''}
                onChange={(e) => setNewException({ ...newException, note: e.target.value })}
                placeholder="e.g., Christmas Day"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newException.isOpen}
                onChange={(e) => setNewException({ ...newException, isOpen: e.target.checked })}
                className="w-5 h-5 rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">Open on this date</span>
            </label>

            {newException.isOpen && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={newException.openTime || '09:00'}
                  onChange={(e) => setNewException({ ...newException, openTime: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
                />
                <span className="text-[var(--text-muted)]">to</span>
                <input
                  type="time"
                  value={newException.closeTime || '22:00'}
                  onChange={(e) => setNewException({ ...newException, closeTime: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
                />
              </div>
            )}

            <Button onClick={handleAddException} isLoading={isSaving} variant="secondary">
              Add Exception
            </Button>
          </div>

          {/* Existing Exceptions */}
          {exceptionalDates.length === 0 ? (
            <p className="text-[var(--text-muted)] text-center py-8">No exceptional dates configured</p>
          ) : (
            <div className="space-y-3">
              {exceptionalDates.map((exception) => (
                <div
                  key={exception.date}
                  className="flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl"
                >
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">
                      {format(new Date(exception.date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {exception.isOpen ? (
                        <span className="text-[var(--success)]">
                          Open: {exception.openTime} - {exception.closeTime}
                        </span>
                      ) : (
                        <span className="text-[var(--error)]">Closed</span>
                      )}
                      {exception.note && <span className="ml-2">• {exception.note}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteException(exception.date)}
                    className="text-[var(--error)] hover:text-[var(--error)]/80 p-2 hover:bg-[var(--error)]/10 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}
