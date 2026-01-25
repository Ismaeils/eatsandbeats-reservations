'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'

interface Stats {
  pendingRequests: number
  approvedRequests: number
  declinedRequests: number
  totalRestaurants: number
}

interface RecentRequest {
  id: string
  email: string
  contactName: string
  status: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch('/api/requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      
      if (data.success) {
        const requests = data.data || []
        
        // Calculate stats from requests
        const pending = requests.filter((r: any) => r.status === 'PENDING').length
        const approved = requests.filter((r: any) => r.status === 'APPROVED').length
        const declined = requests.filter((r: any) => r.status === 'DECLINED').length
        
        setStats({
          pendingRequests: pending,
          approvedRequests: approved,
          declinedRequests: declined,
          totalRestaurants: approved, // Approximation
        })
        
        // Get recent pending requests
        setRecentRequests(
          requests
            .filter((r: any) => r.status === 'PENDING')
            .slice(0, 5)
        )
      } else {
        setError(data.error || 'Failed to load data')
      }
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
            Admin Dashboard
          </h1>
        </div>

        {error && (
          <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-[15px] bg-[var(--warning)]/10">
                  <svg className="w-6 h-6 text-[var(--warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--warning)]">{stats.pendingRequests}</div>
                  <div className="text-sm text-[var(--text-muted)]">Pending Requests</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-[15px] bg-[var(--success)]/10">
                  <svg className="w-6 h-6 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--success)]">{stats.approvedRequests}</div>
                  <div className="text-sm text-[var(--text-muted)]">Approved</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-[15px] bg-[var(--error)]/10">
                  <svg className="w-6 h-6 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--error)]">{stats.declinedRequests}</div>
                  <div className="text-sm text-[var(--text-muted)]">Declined</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-[15px] bg-[var(--color-primary)]/10">
                  <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-primary)]">{stats.totalRestaurants}</div>
                  <div className="text-sm text-[var(--text-muted)]">Total Restaurants</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Recent Pending Requests */}
        <Card className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Pending Requests
            </h2>
            <Link href="/admin/requests">
              <Button variant="outline" className="text-sm !py-1.5">
                View All
              </Button>
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-[var(--bg-hover)] rounded-lg"
                >
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">
                      {request.contactName}
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">
                      {request.email}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
