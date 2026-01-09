'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import apiClient from '@/lib/api-client'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Layout from '@/components/Layout'
import { format } from 'date-fns'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [statsRes, reservationsRes] = await Promise.all([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/reservations?status=CONFIRMED'),
      ]) as any[]

      if (statsRes?.success) {
        setStats(statsRes.data)
      }
      if (reservationsRes?.success) {
        setReservations(reservationsRes.data || [])
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header with Send Invitation Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <Link href="/invitations/send">
            <Button variant="primary" className="text-lg px-8 py-4">
              Send Reservation Invitation
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="text-white/80 text-sm mb-1">Today&apos;s Reservations</div>
              <div className="text-3xl font-bold text-white">{stats.reservations.today}</div>
            </Card>
            <Card>
              <div className="text-white/80 text-sm mb-1">This Week</div>
              <div className="text-3xl font-bold text-white">{stats.reservations.week}</div>
            </Card>
            <Card>
              <div className="text-white/80 text-sm mb-1">This Month</div>
              <div className="text-3xl font-bold text-white">{stats.reservations.month}</div>
            </Card>
            <Card>
              <div className="text-white/80 text-sm mb-1">Total Reservations</div>
              <div className="text-3xl font-bold text-white">{stats.reservations.total}</div>
            </Card>
          </div>
        )}

        {/* Table Status */}
        {stats && (
          <Card>
            <h2 className="text-2xl font-bold text-white mb-4">Table Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-white/80 text-sm">Total Tables</div>
                <div className="text-2xl font-bold text-white">{stats.tables.total}</div>
              </div>
              <div>
                <div className="text-white/80 text-sm">Available</div>
                <div className="text-2xl font-bold text-green-300">
                  {stats.tables.available}
                </div>
              </div>
              <div>
                <div className="text-white/80 text-sm">Occupied</div>
                <div className="text-2xl font-bold text-red-300">
                  {stats.tables.occupied}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.tables.availableTableIds.map((tableId: string) => (
                <span
                  key={tableId}
                  className="px-3 py-1 rounded-lg bg-green-500/20 text-green-200 border border-green-500/50"
                >
                  {tableId}
                </span>
              ))}
              {stats.tables.occupiedTableIds.map((tableId: string) => (
                <span
                  key={tableId}
                  className="px-3 py-1 rounded-lg bg-red-500/20 text-red-200 border border-red-500/50"
                >
                  {tableId}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Reservations List */}
        <Card>
          <h2 className="text-2xl font-bold text-white mb-4">Recent Reservations</h2>
          {reservations.length === 0 ? (
            <p className="text-white/60">No reservations yet</p>
          ) : (
            <div className="space-y-4">
              {reservations.slice(0, 10).map((reservation) => (
                <div
                  key={reservation.id}
                  className="glass border border-white/20 rounded-lg p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {reservation.guestName}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {reservation.numberOfPeople} people • Table: {reservation.tableId || 'TBD'}
                      </p>
                      <p className="text-white/60 text-sm">
                        {format(new Date(reservation.timeFrom), 'MMM dd, yyyy h:mm a')} -{' '}
                        {format(new Date(reservation.timeTo), 'h:mm a')}
                      </p>
                    </div>
                    <Link href={`/reservations/${reservation.id}/edit`}>
                      <Button variant="outline" className="text-sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

