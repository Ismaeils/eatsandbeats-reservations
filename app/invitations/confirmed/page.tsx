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
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-[var(--success)]"
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
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Invitation Sent Successfully!
            </h1>
            <p className="text-[var(--text-secondary)] mb-8">
              The reservation invitation has been sent. The guest will receive a message
              with instructions to complete their reservation.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="primary">Back to Dashboard</Button>
              </Link>
              <Button
                variant="outline"
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
