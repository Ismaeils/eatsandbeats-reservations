'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Logo from '@/components/Logo'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    restaurantName: '',
    address: '',
    reservationDeposit: '',
    averageSeatingTime: '60',
    tableLayout: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }
    setError('')
    setStep(2)
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Parse table layout
      const tableLayout = formData.tableLayout
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        restaurantName: formData.restaurantName,
        address: formData.address,
        reservationDeposit: parseFloat(formData.reservationDeposit),
        averageSeatingTime: parseInt(formData.averageSeatingTime),
        tableLayout,
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card>
          {/* Step indicators */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= 1 ? 'bg-[var(--color-primary)] text-[var(--bg-app)]' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--bg-hover)]'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= 2 ? 'bg-[var(--color-primary)] text-[var(--bg-app)]' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
              }`}>
                2
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              {step === 1 ? 'Create Account' : 'Restaurant Onboarding'}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {step === 1
                ? 'Start by creating your account'
                : 'Tell us about your restaurant'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              {error && (
                <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="your@email.com"
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="At least 8 characters"
              />

              <Button type="submit" className="w-full">
                Continue
              </Button>

              <p className="text-center text-[var(--text-secondary)] text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--color-primary)] font-medium hover:text-[var(--color-primary-hover)] transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              {error && (
                <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />

                <Input
                  label="Restaurant Name"
                  type="text"
                  value={formData.restaurantName}
                  onChange={(e) =>
                    setFormData({ ...formData, restaurantName: e.target.value })
                  }
                  required
                  placeholder="Restaurant Name"
                />
              </div>

              <Input
                label="Address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="123 Main St, City, State"
              />

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
                  placeholder="0.00"
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
                  placeholder="60"
                />
              </div>

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
              <p className="text-sm text-[var(--text-muted)]">
                Enter table identifiers separated by commas (e.g., T1, T2, TB01)
              </p>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" isLoading={isLoading} className="flex-1">
                  Complete Registration
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
