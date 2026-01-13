'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Layout from '@/components/Layout'

export default function SendInvitationPage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [invitationData, setInvitationData] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await apiClient.post('/invitations/send', { phoneNumber }) as any
      if (response.success) {
        setSuccess(true)
        setInvitationData(response.data)
        // Redirect to confirmation after 3 seconds
        setTimeout(() => {
          router.push('/invitations/confirmed')
        }, 3000)
      }
    } catch (err: any) {
      setError(err.error || 'Failed to send invitation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">Send Invitation</h1>
          <Card>
            <div className="text-center py-4 sm:py-6">
              <div className="mb-4 sm:mb-6">
                <svg
                  className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-[var(--success)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2 sm:mb-4">
                Invitation Sent!
              </h2>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-4 sm:mb-6">
                The invitation has been sent to {phoneNumber}
              </p>
              {invitationData?.webFormUrl && (
                <div className="bg-[var(--bg-hover)] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-[var(--glass-border)]">
                  <p className="text-[var(--text-muted)] text-xs sm:text-sm mb-1 sm:mb-2">Web Form URL:</p>
                  <p className="text-[var(--color-primary)] text-xs sm:text-sm break-all font-medium">{invitationData.webFormUrl}</p>
                </div>
              )}
              <p className="text-[var(--text-muted)] text-xs sm:text-sm">
                Redirecting to dashboard...
              </p>
            </div>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">Send Invitation</h1>
        
        <Card>
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Enter the guest&apos;s phone number to send them a reservation invitation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="+1234567890"
            />

            <div className="flex gap-2 sm:gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 text-sm sm:text-base py-2.5 sm:py-3"
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1 text-sm sm:text-base py-2.5 sm:py-3">
                Send Invitation
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
