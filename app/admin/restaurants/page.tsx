'use client'

import AdminLayout from '@/components/AdminLayout'
import Card from '@/components/Card'

export default function AdminRestaurantsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          Restaurants
        </h1>

        <Card className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-hover)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Coming Soon
            </h2>
            <p className="text-[var(--text-muted)]">
              Restaurant management features will be available here.
            </p>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
