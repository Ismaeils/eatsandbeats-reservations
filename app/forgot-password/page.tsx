'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Logo from '@/components/Logo'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.replace('/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const response = await apiClient.post('/auth/forgot-password', { email }) as any
      setMessage(response.message || 'If an account exists, a password reset link has been sent')
    } catch (err: any) {
      setError(err.error || 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Forgot Password</h1>
            <p className="text-[var(--text-secondary)]">
              Enter your email to receive a password reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-[var(--success)]/20 border border-[var(--success)]/50 text-[var(--success)] px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />

            <Button type="submit" isLoading={isLoading} className="w-full">
              Send Reset Link
            </Button>

            <p className="text-center text-[var(--text-secondary)] text-sm">
              Remember your password?{' '}
              <Link href="/login" className="text-[var(--color-primary)] font-medium hover:text-[var(--color-primary-hover)] transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
