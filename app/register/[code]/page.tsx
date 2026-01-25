'use client'

import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Logo from '@/components/Logo'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
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

interface OpeningHour {
  dayOfWeek: number
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
}

const STEP_TITLES = [
  'Create Your Account',
  'Restaurant Info',
  'Opening Hours',
]

const STEP_DESCRIPTIONS = [
  'Set up your password and profile',
  'Tell us about your restaurant',
  'Set your weekly schedule',
]

export default function CodeRegisterPage() {
  const router = useRouter()
  const params = useParams()
  const code = params.code as string

  const [step, setStep] = useState(1)
  const [isValidating, setIsValidating] = useState(true)
  const [validationError, setValidationError] = useState('')
  const [approvedEmail, setApprovedEmail] = useState('')
  const [approvedName, setApprovedName] = useState('')

  // Validate the code on mount
  useEffect(() => {
    const validateCode = async () => {
      try {
        const response = await fetch(`/api/auth/register/${code}`)
        const data = await response.json()

        if (data.success) {
          setApprovedEmail(data.data.email)
          setApprovedName(data.data.contactName)
          setAccountData(prev => ({ ...prev, name: data.data.contactName }))
        } else {
          setValidationError(data.error || 'Invalid registration link')
        }
      } catch (err) {
        setValidationError('Failed to validate registration link')
      } finally {
        setIsValidating(false)
      }
    }

    validateCode()
  }, [code])

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.replace('/dashboard')
    }
  }, [router])
  
  // Step 1: Account (password only, email is pre-filled)
  const [accountData, setAccountData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  })
  
  // Step 2: Restaurant Info
  const [restaurantData, setRestaurantData] = useState({
    restaurantName: '',
    address: '',
    reservationDeposit: '',
    averageSeatingTime: '60',
    maxSimultaneousReservations: '10',
    autoConfirmReservations: false,
    country: 'UAE',
    language: 'en',
    currency: 'AED',
  })
  
  // Step 3: Opening Hours
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(
    DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.value,
      isOpen: day.value >= 1 && day.value <= 5,
      openTime: '09:00',
      closeTime: '22:00',
    }))
  )
  
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateStep1 = () => {
    if (!accountData.name || !accountData.password) {
      setError('Please fill in all fields')
      return false
    }
    if (accountData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (accountData.password !== accountData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!restaurantData.restaurantName || !restaurantData.address) {
      setError('Please fill in all required fields')
      return false
    }
    const maxReservations = parseInt(restaurantData.maxSimultaneousReservations)
    if (isNaN(maxReservations) || maxReservations < 1) {
      setError('Max simultaneous reservations must be at least 1')
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
    for (const day of openDays) {
      if (!day.openTime || !day.closeTime) {
        setError(`Please set opening and closing times for ${DAYS_OF_WEEK[day.dayOfWeek].label}`)
        return false
      }
    }
    return true
  }

  const handleNextStep = () => {
    setError('')
    
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    
    setStep(step + 1)
  }

  const handlePrevStep = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    setError('')
    
    if (!validateStep3()) return
    
    setIsLoading(true)

    try {
      const payload = {
        password: accountData.password,
        name: accountData.name,
        restaurantName: restaurantData.restaurantName,
        address: restaurantData.address,
        reservationDeposit: parseFloat(restaurantData.reservationDeposit) || 0,
        averageSeatingTime: parseInt(restaurantData.averageSeatingTime) || 60,
        maxSimultaneousReservations: parseInt(restaurantData.maxSimultaneousReservations) || 10,
        autoConfirmReservations: restaurantData.autoConfirmReservations,
        country: restaurantData.country,
        language: restaurantData.language,
        currency: restaurantData.currency,
        openingHours,
      }

      const response = await fetch(`/api/auth/register/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success && data.data?.token) {
        localStorage.setItem('token', data.data.token)
        router.push('/onboarding')
      } else {
        setError(data.error || 'Registration failed. Please try again.')
      }
    } catch (err: any) {
      setError('Registration failed. Please try again.')
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

  // Show loading while validating
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-[var(--color-primary)] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-[var(--text-secondary)]">Validating your registration link...</p>
        </div>
      </div>
    )
  }

  // Show error if code is invalid
  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--error)]/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Invalid Registration Link
          </h1>
          <p className="text-[var(--text-secondary)] mb-8">
            {validationError}
          </p>
          <Link href="/partner-request">
            <Button variant="primary">
              Request Partnership
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card>
          {/* Step indicators */}
          <div className="flex items-center justify-center mb-8 overflow-x-auto px-4">
            <div className="flex items-center">
              {[1, 2, 3].map((s, index) => (
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
                  {index < 2 && (
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
              <div className="p-4 bg-[var(--bg-hover)] rounded-lg">
                <p className="text-sm text-[var(--text-muted)] mb-1">Email (from your approved request)</p>
                <p className="text-[var(--text-primary)] font-medium">{approvedEmail}</p>
              </div>

              <Input
                label="Your Name"
                type="text"
                value={accountData.name}
                onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                required
                placeholder="John Doe"
              />

              <Input
                label="Password"
                type="password"
                value={accountData.password}
                onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                required
                placeholder="At least 8 characters"
              />

              <Input
                label="Confirm Password"
                type="password"
                value={accountData.confirmPassword}
                onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                required
                placeholder="Confirm your password"
              />

              <Button onClick={handleNextStep} className="w-full">
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Restaurant Info */}
          {step === 2 && (
            <div className="space-y-6">
              <Input
                label="Restaurant Name"
                type="text"
                value={restaurantData.restaurantName}
                onChange={(e) => setRestaurantData({ ...restaurantData, restaurantName: e.target.value })}
                required
                placeholder="Restaurant Name"
              />

              <Input
                label="Address"
                type="text"
                value={restaurantData.address}
                onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })}
                required
                placeholder="123 Main St, City, State"
              />

              {/* Country, Language, Currency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Country
                  </label>
                  <select
                    value={restaurantData.country}
                    onChange={(e) => setRestaurantData({ ...restaurantData, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
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
                    value={restaurantData.language}
                    onChange={(e) => setRestaurantData({ ...restaurantData, language: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
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
                    value={restaurantData.currency}
                    onChange={(e) => setRestaurantData({ ...restaurantData, currency: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={`Reservation Deposit (${CURRENCY_SYMBOLS[restaurantData.currency] || restaurantData.currency})`}
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

              <div>
                <Input
                  label="Max Simultaneous Reservations"
                  type="number"
                  min="1"
                  max="1000"
                  value={restaurantData.maxSimultaneousReservations}
                  onChange={(e) => setRestaurantData({ ...restaurantData, maxSimultaneousReservations: e.target.value })}
                  required
                  placeholder="10"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Maximum number of overlapping reservations allowed at any time slot.
                </p>
              </div>

              {/* Auto-Confirm Reservations */}
              <div className={`p-4 rounded-2xl border ${restaurantData.autoConfirmReservations ? 'bg-[var(--info)]/10 border-[var(--info)]/30' : 'bg-[var(--bg-hover)] border-[var(--border-color)]'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">
                      {restaurantData.autoConfirmReservations ? 'Auto-Confirm Enabled' : 'Manual Approval Required'}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {restaurantData.autoConfirmReservations 
                        ? 'Reservations are confirmed automatically when guests book.'
                        : 'New reservations will be pending until you approve them.'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restaurantData.autoConfirmReservations}
                      onChange={(e) => setRestaurantData({ ...restaurantData, autoConfirmReservations: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-[var(--bg-card)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--info)]"></div>
                  </label>
                </div>
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

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} isLoading={isLoading} className="flex-1">
                  Complete Registration
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
