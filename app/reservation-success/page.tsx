'use client'

import Card from '@/components/Card'
import Logo from '@/components/Logo'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function ReservationSuccessPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <Card>
            <div className="text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-20 w-20 text-[var(--success)]"
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
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4 font-heading">
                Reservation Confirmed!
              </h1>
              <p className="text-[var(--text-secondary)] mb-6">
                Thank you for your reservation. We look forward to seeing you!
              </p>
              <p className="text-[var(--text-muted)] text-sm">
                You will receive a confirmation message shortly.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  )
}
