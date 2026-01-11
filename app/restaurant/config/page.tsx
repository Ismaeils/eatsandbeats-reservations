'use client'

import Button from '@/components/Button'
import Card from '@/components/Card'
import FloorPlanEditor from '@/components/FloorPlanEditor'
import FloorPlanViewer from '@/components/FloorPlanViewer'
import Input from '@/components/Input'
import Layout from '@/components/Layout'
import RestaurantLogo from '@/components/RestaurantLogo'
import apiClient from '@/lib/api-client'
import { FloorPlanElement } from '@/types/floor-plan'
import { format } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

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

interface ExceptionalDate {
  id?: string
  date: string
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
  note: string | null
}

interface FloorPlan {
  id: string
  name: string
  order: number
  width: number
  height: number
  elements: FloorPlanElement[]
  isActive: boolean
}

export default function RestaurantConfigPage() {
  const searchParams = useSearchParams()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'exceptions' | 'floorplan'>('general')

  // Set initial tab from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['general', 'hours', 'exceptions', 'floorplan'].includes(tabParam)) {
      setActiveTab(tabParam as any)
    }
  }, [searchParams])
  
  // General settings
  const [formData, setFormData] = useState({
    logoUrl: '',
    reservationDeposit: '',
    averageSeatingTime: '',
    reservationDuration: '120',
    slotGranularity: '15',
    cuisines: '',
  })
  
  // Opening hours
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(
    DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.value,
      isOpen: true,
      openTime: '09:00',
      closeTime: '22:00',
    }))
  )
  
  // Exceptional dates
  const [exceptionalDates, setExceptionalDates] = useState<ExceptionalDate[]>([])
  const [newException, setNewException] = useState<ExceptionalDate>({
    date: '',
    isOpen: false,
    openTime: null,
    closeTime: null,
    note: '',
  })

  // Floor plans
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([])
  const [editingFloorPlan, setEditingFloorPlan] = useState<FloorPlan | null>(null)
  const [isCreatingFloor, setIsCreatingFloor] = useState(false)
  const [newFloorName, setNewFloorName] = useState('')
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchFloorPlans = useCallback(async () => {
    try {
      const response = await apiClient.get('/restaurants/floor-plans') as any
      if (response?.success) {
        setFloorPlans(response.data || [])
      }
    } catch (err: any) {
      console.error('Failed to fetch floor plans:', err)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setIsLoading(true)
      const [restaurantRes, hoursRes, exceptionsRes, floorPlansRes] = await Promise.all([
        apiClient.get('/restaurants/me'),
        apiClient.get('/restaurants/opening-hours'),
        apiClient.get('/restaurants/exceptional-dates'),
        apiClient.get('/restaurants/floor-plans'),
      ]) as any[]

      if (restaurantRes?.success) {
        const res = restaurantRes.data
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

      if (hoursRes?.success && hoursRes.data.length > 0) {
        setOpeningHours(
          DAYS_OF_WEEK.map(day => {
            const existing = hoursRes.data.find((h: any) => h.dayOfWeek === day.value)
            return existing || {
              dayOfWeek: day.value,
              isOpen: true,
              openTime: '09:00',
              closeTime: '22:00',
            }
          })
        )
      }

      if (exceptionsRes?.success) {
        setExceptionalDates(
          exceptionsRes.data.map((e: any) => ({
            ...e,
            date: e.date.split('T')[0],
          }))
        )
      }

      if (floorPlansRes?.success) {
        setFloorPlans(floorPlansRes.data || [])
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveGeneral = async (e: React.FormEvent) => {
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
        setSuccess('General settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveHours = async () => {
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

  const updateHour = (dayOfWeek: number, field: keyof OpeningHour, value: any) => {
    setOpeningHours(hours =>
      hours.map(h =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      )
    )
  }

  // Floor Plan handlers
  const handleCreateFloorPlan = async () => {
    if (!newFloorName.trim()) {
      setError('Please enter a floor name')
      return
    }

    setError('')
    setIsSaving(true)

    try {
      const response = await apiClient.post('/restaurants/floor-plans', {
        name: newFloorName.trim(),
        elements: [],
      }) as any
      
      if (response?.success) {
        setFloorPlans([...floorPlans, response.data])
        setNewFloorName('')
        setIsCreatingFloor(false)
        setEditingFloorPlan(response.data)
        setSuccess('Floor plan created! Now add your tables and elements.')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to create floor plan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveFloorPlan = async (elements: FloorPlanElement[], width: number, height: number) => {
    if (!editingFloorPlan) return

    setError('')
    setIsSaving(true)

    try {
      const response = await apiClient.patch(`/restaurants/floor-plans/${editingFloorPlan.id}`, {
        elements,
        width,
        height,
      }) as any
      
      if (response?.success) {
        setFloorPlans(floorPlans.map(fp => 
          fp.id === editingFloorPlan.id ? response.data : fp
        ))
        setEditingFloorPlan(null)
        setSuccess('Floor plan saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
        fetchFloorPlans() // Refresh to get updated data
      }
    } catch (err: any) {
      setError(err.error || 'Failed to save floor plan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFloorPlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this floor plan?')) return

    setError('')
    setIsSaving(true)

    try {
      const response = await apiClient.delete(`/restaurants/floor-plans/${id}`) as any
      if (response?.success) {
        setFloorPlans(floorPlans.filter(fp => fp.id !== id))
        setSuccess('Floor plan deleted successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to delete floor plan')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-[var(--text-secondary)] text-xl">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center gap-6">
            <RestaurantLogo 
              logoUrl={restaurant?.logoUrl} 
              restaurantName={restaurant?.name}
              size="lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Restaurant Settings</h1>
              {restaurant && (
                <p className="text-[var(--text-secondary)] mt-1">{restaurant.name}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--glass-border)] pb-2">
          {[
            { id: 'general', label: 'General', icon: '⚙️' },
            { id: 'hours', label: 'Opening Hours', icon: '🕐' },
            { id: 'exceptions', label: 'Exceptions', icon: '📅' },
            { id: 'floorplan', label: 'Floor Plan', icon: '🗺️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-[var(--bg-app)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-[var(--success)]/20 border border-[var(--success)]/50 text-[var(--success)] px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <Card>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">General Settings</h2>
            
            {restaurant && (
              <div className="mb-6 space-y-2 text-[var(--text-secondary)] pb-6 border-b border-[var(--glass-border)]">
                <p><span className="font-semibold text-[var(--text-primary)]">Name:</span> {restaurant.name}</p>
                <p><span className="font-semibold text-[var(--text-primary)]">Address:</span> {restaurant.address}</p>
                <p className="text-sm text-[var(--text-muted)]">Name and address cannot be changed</p>
              </div>
            )}

            <form onSubmit={handleSaveGeneral} className="space-y-6">
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

              {/* Table Layout - Read Only (managed via Floor Plan) */}
              <div className="p-4 bg-[var(--bg-hover)] rounded-lg border border-[var(--glass-border)]">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">
                    Table Layout
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('floorplan')}
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
                    <span>No tables configured. Add tables in the Floor Plan to accept reservations.</span>
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
                Save General Settings
              </Button>
            </form>
          </Card>
        )}

        {/* Opening Hours Tab */}
        {activeTab === 'hours' && (
          <Card>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Regular Opening Hours</h2>
            
            <div className="space-y-4">
              {DAYS_OF_WEEK.map(day => {
                const hour = openingHours.find(h => h.dayOfWeek === day.value)!
                return (
                  <div key={day.value} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[var(--bg-hover)] rounded-lg">
                    <div className="w-28 font-medium text-[var(--text-primary)]">{day.label}</div>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hour.isOpen}
                        onChange={(e) => updateHour(day.value, 'isOpen', e.target.checked)}
                        className="w-5 h-5 rounded border-[var(--glass-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--text-secondary)]">Open</span>
                    </label>

                    {hour.isOpen && (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={hour.openTime || '09:00'}
                          onChange={(e) => updateHour(day.value, 'openTime', e.target.value)}
                          className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] text-sm"
                        />
                        <span className="text-[var(--text-muted)]">to</span>
                        <input
                          type="time"
                          value={hour.closeTime || '22:00'}
                          onChange={(e) => updateHour(day.value, 'closeTime', e.target.value)}
                          className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] text-sm"
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

            <Button onClick={handleSaveHours} isLoading={isSaving} className="w-full mt-6">
              Save Opening Hours
            </Button>
          </Card>
        )}

        {/* Exceptional Dates Tab */}
        {activeTab === 'exceptions' && (
          <Card>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Exceptional Dates</h2>
            <p className="text-[var(--text-muted)] text-sm mb-6">
              Add special dates like holidays or events where your hours differ from the regular schedule.
            </p>

            {/* Add New Exception */}
            <div className="p-4 bg-[var(--bg-hover)] rounded-lg mb-6 space-y-4">
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
                  className="w-5 h-5 rounded border-[var(--glass-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Open on this date</span>
              </label>

              {newException.isOpen && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={newException.openTime || '09:00'}
                    onChange={(e) => setNewException({ ...newException, openTime: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] text-sm"
                  />
                  <span className="text-[var(--text-muted)]">to</span>
                  <input
                    type="time"
                    value={newException.closeTime || '22:00'}
                    onChange={(e) => setNewException({ ...newException, closeTime: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] text-sm"
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
                    className="flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-lg"
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
                      className="text-[var(--error)] hover:text-[var(--error)]/80 p-2"
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
        )}

        {/* Floor Plan Tab */}
        {activeTab === 'floorplan' && (
          <>
            {editingFloorPlan ? (
              /* Floor Plan Editor */
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    Editing: {editingFloorPlan.name}
                  </h2>
                </div>
                <FloorPlanEditor
                  elements={editingFloorPlan.elements || []}
                  width={editingFloorPlan.width}
                  height={editingFloorPlan.height}
                  onSave={handleSaveFloorPlan}
                  onCancel={() => setEditingFloorPlan(null)}
                />
              </Card>
            ) : (
              /* Floor Plan List */
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Floor Plans</h2>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Create visual layouts for your restaurant floors. Guests can view these when making reservations.
                    </p>
                  </div>
                  {!isCreatingFloor && (
                    <Button onClick={() => setIsCreatingFloor(true)}>
                      + Add Floor
                    </Button>
                  )}
                </div>

                {/* Create New Floor Form */}
                {isCreatingFloor && (
                  <div className="p-4 bg-[var(--bg-hover)] rounded-lg mb-6 space-y-4">
                    <h3 className="font-medium text-[var(--text-primary)]">New Floor Plan</h3>
                    <Input
                      label="Floor Name"
                      type="text"
                      value={newFloorName}
                      onChange={(e) => setNewFloorName(e.target.value)}
                      placeholder="e.g., Ground Floor, Rooftop, Patio"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCreateFloorPlan} isLoading={isSaving}>
                        Create Floor
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setIsCreatingFloor(false)
                        setNewFloorName('')
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Floor Plan List */}
                {floorPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      No Floor Plans Yet
                    </h3>
                    <p className="text-[var(--text-muted)] max-w-md mx-auto mb-6">
                      Create a visual floor plan to let guests see and choose their preferred tables when making reservations.
                    </p>
                    {!isCreatingFloor && (
                      <Button onClick={() => setIsCreatingFloor(true)}>
                        Create Your First Floor Plan
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {floorPlans.map((floorPlan) => (
                      <div
                        key={floorPlan.id}
                        className="border border-[var(--glass-border)] rounded-xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-4 bg-[var(--bg-hover)]">
                          <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">{floorPlan.name}</h3>
                            <p className="text-sm text-[var(--text-muted)]">
                              {floorPlan.elements?.filter((e: any) => e.type === 'table').length || 0} tables • 
                              {floorPlan.width}x{floorPlan.height}px
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingFloorPlan(floorPlan)}
                              className="text-sm"
                            >
                              Edit
                            </Button>
                            <button
                              onClick={() => handleDeleteFloorPlan(floorPlan.id)}
                              className="text-[var(--error)] hover:bg-[var(--error)]/20 p-2 rounded-lg"
                              title="Delete floor plan"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Floor Plan Preview */}
                        <div className="p-4">
                          <FloorPlanViewer
                            floorPlans={[floorPlan]}
                            readOnly
                            compact
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Info Box */}
                {floorPlans.length > 0 && (
                  <div className="mt-6 p-4 bg-[var(--info)]/10 border border-[var(--info)]/30 rounded-lg">
                    <h4 className="font-medium text-[var(--text-primary)] mb-1">💡 Tip</h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      When you add tables in the floor plan editor, they are automatically synced to your table layout.
                      Guests will be able to view your floor plan and select their preferred table when making a reservation.
                    </p>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
