'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'

export default function PartnerRequestPage() {
  const { theme } = useTheme()
  const logoSrc = theme === 'dark' 
    ? '/uploads/eatsnbeats-light.png'
    : '/uploads/eatsnbeats-dark.png'

  const [formData, setFormData] = useState({
    email: '',
    contactName: '',
    phone: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Failed to submit request')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)]">
        {/* Navigation */}
        <nav className="px-6 sm:px-8 lg:px-12 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src={logoSrc}
                alt="Eats & Beats"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </Link>
            <ThemeToggle />
          </div>
        </nav>

        <div className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Request Submitted!
            </h1>
            <p className="text-[var(--text-secondary)] mb-8">
              Thank you for your interest in partnering with Eats & Beats. We&apos;ve sent you a confirmation email and our team will review your request shortly.
            </p>
            <Link href="/">
              <Button variant="primary">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      {/* Navigation */}
      <nav className="px-6 sm:px-8 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src={logoSrc}
              alt="Eats & Beats"
              width={60}
              height={60}
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="px-6 sm:px-8 lg:px-12 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Partner With Us
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Join the Eats & Beats platform and connect with diners looking for exceptional dining experiences.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-[var(--bg-card)] rounded-[20px] border border-[var(--border-color)] text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Reach More Diners</h3>
              <p className="text-sm text-[var(--text-muted)]">Connect with food lovers actively searching</p>
            </div>
            <div className="p-4 bg-[var(--bg-card)] rounded-[20px] border border-[var(--border-color)] text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Easy Management</h3>
              <p className="text-sm text-[var(--text-muted)]">Intuitive tools for reservations</p>
            </div>
            <div className="p-4 bg-[var(--bg-card)] rounded-[20px] border border-[var(--border-color)] text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Grow Your Business</h3>
              <p className="text-sm text-[var(--text-muted)]">Increase visibility and bookings</p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
              Request Partnership
            </h2>

            {error && (
              <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Name"
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  required
                  placeholder="John Doe"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+1 (555) 123-4567"
              />

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Tell us about your restaurant
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Describe your restaurant, cuisine type, location, capacity, and what makes it special..."
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all resize-none h-32"
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Submit Request
              </Button>
            </form>

            <p className="text-center text-sm text-[var(--text-muted)] mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--color-primary)] hover:underline">
                Sign in
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
