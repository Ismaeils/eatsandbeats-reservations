'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Logo from '@/components/Logo'
import FloorPlanEditor from '@/components/FloorPlanEditor'
import { FloorPlanElement } from '@/types/floor-plan'

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

const STEP_TITLES = [
  'Create Account',
  'Restaurant Info',
  'Opening Hours',
  'Floor Plan',
]

const STEP_DESCRIPTIONS = [
  'Start by creating your account',
  'Tell us about your restaurant',
  'Set your weekly schedule',
  'Design your restaurant layout',
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  
  // Step 1: Account
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
  })
  
  // Step 2: Restaurant Info
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    restaurantName: '',
    address: '',
    reservationDeposit: '',
    averageSeatingTime: '60',
  })
  
  // Step 3: Opening Hours
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(
    DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.value,
      isOpen: day.value >= 1 && day.value <= 5, // Mon-Fri open by default
      openTime: '09:00',
      closeTime: '22:00',
    }))
  )
  
  // Step 4: Floor Plan
  const [floorPlan, setFloorPlan] = useState({
    name: 'Main Floor',
    width: 800,
    height: 600,
    elements: [] as FloorPlanElement[],
  })
  
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateStep1 = () => {
    if (!accountData.email || !accountData.password) {
      setError('Please fill in all fields')
      return false
    }
    if (accountData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!restaurantData.name || !restaurantData.restaurantName || !restaurantData.address) {
      setError('Please fill in all required fields')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    const openDays = openingHours.filter(h => h.isOpen)
    if (openDays.length === 0) {
      setError('You must have at least one open day')
      return false
    }
    // Validate that open days have times
    for (const day of openDays) {
      if (!day.openTime || !day.closeTime) {
        setError(`Please set opening and closing times for ${DAYS_OF_WEEK[day.dayOfWeek].label}`)
        return false
      }
    }
    return true
  }

  const validateStep4 = () => {
    const tables = floorPlan.elements.filter(el => el.type === 'table' && el.tableId)
    if (tables.length === 0) {
      setError('You must add at least one table to your floor plan')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setError('')
    
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3 && !validateStep3()) return
    
    setStep(step + 1)
  }

  const handlePrevStep = () => {
    setError('')
    setStep(step - 1)
  }

  const handleFloorPlanSave = (elements: FloorPlanElement[], width: number, height: number) => {
    setFloorPlan({ ...floorPlan, elements, width, height })
  }

  const handleSubmit = async () => {
    setError('')
    
    if (!validateStep4()) return
    
    setIsLoading(true)

    try {
      const payload = {
        email: accountData.email,
        password: accountData.password,
        name: restaurantData.name,
        restaurantName: restaurantData.restaurantName,
        address: restaurantData.address,
        reservationDeposit: parseFloat(restaurantData.reservationDeposit) || 0,
        averageSeatingTime: parseInt(restaurantData.averageSeatingTime) || 60,
        openingHours,
        floorPlan,
      }

      const response = await apiClient.post('/auth/register', payload) as any
      if (response?.success && response?.data?.token) {
        localStorage.setItem('token', response.data.token)
        router.push('/dashboard')
      } else {
        setError(response?.error || 'Registration failed. Please try again.')
      }
    } catch (err: any) {
      const errorMessage = err?.error || err?.message || 'Registration failed. Please try again.'
      setError(errorMessage)
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateHour = (dayOfWeek: number, field: keyof OpeningHour, value: any) => {
    setOpeningHours(hours =>
      hours.map(h =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      )
    )
  }

  const tableCount = floorPlan.elements.filter(el => el.type === 'table' && el.tableId).length

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className={`w-full ${step === 4 ? 'max-w-6xl' : 'max-w-2xl'}`}>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card>
          {/* Step indicators */}
          <div className="flex items-center justify-center mb-8 overflow-x-auto px-4">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((s, index) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    step >= s 
                      ? 'bg-[var(--color-primary)] text-[var(--bg-app)]' 
                      : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
                  }`}>
                    {step > s ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s}
                  </div>
                  {index < 3 && (
                    <div className={`w-8 md:w-16 h-1 transition-colors ${
                      step > s ? 'bg-[var(--color-primary)]' : 'bg-[var(--bg-hover)]'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              {STEP_TITLES[step - 1]}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {STEP_DESCRIPTIONS[step - 1]}
            </p>
          </div>

          {error && (
            <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-6">
              <Input
                label="Email"
                type="email"
                value={accountData.email}
                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                required
                placeholder="your@email.com"
              />

              <Input
                label="Password"
                type="password"
                value={accountData.password}
                onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                required
                placeholder="At least 8 characters"
              />

              <Button onClick={handleNextStep} className="w-full">
                Continue
              </Button>

              <p className="text-center text-[var(--text-secondary)] text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--color-primary)] font-medium hover:text-[var(--color-primary-hover)] transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Restaurant Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  type="text"
                  value={restaurantData.name}
                  onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />

                <Input
                  label="Restaurant Name"
                  type="text"
                  value={restaurantData.restaurantName}
                  onChange={(e) => setRestaurantData({ ...restaurantData, restaurantName: e.target.value })}
                  required
                  placeholder="Restaurant Name"
                />
              </div>

              <Input
                label="Address"
                type="text"
                value={restaurantData.address}
                onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })}
                required
                placeholder="123 Main St, City, State"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Reservation Deposit ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={restaurantData.reservationDeposit}
                  onChange={(e) => setRestaurantData({ ...restaurantData, reservationDeposit: e.target.value })}
                  placeholder="0.00"
                />

                <Input
                  label="Average Seating Time (minutes)"
                  type="number"
                  min="15"
                  max="300"
                  value={restaurantData.averageSeatingTime}
                  onChange={(e) => setRestaurantData({ ...restaurantData, averageSeatingTime: e.target.value })}
                  required
                  placeholder="60"
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNextStep} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Opening Hours */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-[var(--text-muted)] text-center mb-4">
                Set your regular weekly schedule. You can add exceptions for holidays later.
              </p>

              <div className="space-y-3">
                {DAYS_OF_WEEK.map(day => {
                  const hour = openingHours.find(h => h.dayOfWeek === day.value)!
                  return (
                    <div key={day.value} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-[var(--bg-hover)] rounded-lg">
                      <div className="w-24 font-medium text-[var(--text-primary)]">{day.label}</div>
                      
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

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNextStep} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Floor Plan */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-[var(--info)]/10 border border-[var(--info)]/30 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-[var(--text-primary)] mb-1">💡 How to use the Floor Plan Editor</h4>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>• Click on elements in the left panel to add them to your layout</li>
                  <li>• Drag elements to position them</li>
                  <li>• Click on an element to select it and edit its properties</li>
                  <li>• <strong>You must add at least one table</strong> to complete registration</li>
                </ul>
              </div>

              <FloorPlanEditor
                elements={floorPlan.elements}
                width={floorPlan.width}
                height={floorPlan.height}
                onSave={handleFloorPlanSave}
                onCancel={handlePrevStep}
              />

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                <div className="text-sm text-[var(--text-secondary)]">
                  {tableCount > 0 ? (
                    <span className="text-[var(--success)]">✓ {tableCount} table{tableCount > 1 ? 's' : ''} added</span>
                  ) : (
                    <span className="text-[var(--warning)]">⚠ Add at least one table</span>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={handlePrevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    isLoading={isLoading}
                    disabled={tableCount === 0}
                  >
                    Complete Registration
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
