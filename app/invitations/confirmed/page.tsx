'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Layout from '@/components/Layout'

export default function InvitationConfirmedPage() {
  const router = useRouter()

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">Invitation</h1>
        
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
              Sent Successfully!
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-6 sm:mb-8">
              The guest will receive a message with instructions to complete their reservation.
            </p>
            <div className="flex gap-2 sm:gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="primary" className="text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3">Dashboard</Button>
              </Link>
              <Button
                variant="outline"
                className="text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3"
                onClick={() => router.push('/invitations/send')}
              >
                Send Another
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
