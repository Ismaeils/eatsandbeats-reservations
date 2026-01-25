'use client'

import Button from '@/components/Button'
import Card from '@/components/Card'
import FloorPlanEditor from '@/components/FloorPlanEditor'
import FloorPlanViewer from '@/components/FloorPlanViewer'
import Input from '@/components/Input'
import Layout from '@/components/Layout'
import apiClient from '@/lib/api-client'
import { FloorPlanElement } from '@/types/floor-plan'
import { useCallback, useEffect, useState } from 'react'

interface FloorPlan {
  id: string
  name: string
  order: number
  width: number
  height: number
  elements: FloorPlanElement[]
  isActive: boolean
}

export default function FloorPlanSettingsPage() {
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
    const fetchData = async () => {
      setIsLoading(true)
      await fetchFloorPlans()
      setIsLoading(false)
    }
    fetchData()
  }, [fetchFloorPlans])

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
        fetchFloorPlans()
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">Floor Plan</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Create visual layouts for your restaurant floors. Guests can view these when making reservations.
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
          <>
            {!isCreatingFloor && floorPlans.length > 0 && (
              <div className="flex justify-end">
                <Button onClick={() => setIsCreatingFloor(true)}>
                  + Add Floor
                </Button>
              </div>
            )}

            {/* Create New Floor Form */}
            {isCreatingFloor && (
              <Card className="space-y-4">
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
              </Card>
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
                    className="border border-[var(--border-color)] rounded-[25px] overflow-hidden"
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
                          className="text-[var(--error)] hover:bg-[var(--error)]/20 p-2 rounded-xl transition-colors"
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
              <div className="p-4 bg-[var(--info)]/10 border border-[var(--info)]/30 rounded-[25px]">
                <h4 className="font-medium text-[var(--text-primary)] mb-1">💡 Tip</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  When you add tables in the floor plan editor, they are automatically synced to your table layout.
                  Guests will be able to view your floor plan and select their preferred table when making a reservation.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
