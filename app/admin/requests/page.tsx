'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { format } from 'date-fns'

interface RestaurantRequest {
  id: string
  email: string
  contactName: string
  phone: string
  description: string
  status: 'PENDING' | 'APPROVED' | 'DECLINED'
  approvalCode?: string
  createdAt: string
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RestaurantRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [declineModal, setDeclineModal] = useState<{ open: boolean; requestId: string | null; reason: string }>({
    open: false,
    requestId: null,
    reason: '',
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
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
        setRequests(data.data || [])
      } else {
        setError(data.error || 'Failed to load requests')
      }
    } catch (err) {
      setError('Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      setActionLoading(requestId)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`/api/requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchRequests()
      } else {
        alert(data.error || 'Failed to approve request')
      }
    } catch (err) {
      alert('Failed to approve request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async () => {
    if (!declineModal.requestId) return
    
    try {
      setActionLoading(declineModal.requestId)
      const token = localStorage.getItem('adminToken')
      
      const response = await fetch(`/api/requests/${declineModal.requestId}/decline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: declineModal.reason }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setDeclineModal({ open: false, requestId: null, reason: '' })
        fetchRequests()
      } else {
        alert(data.error || 'Failed to decline request')
      }
    } catch (err) {
      alert('Failed to decline request')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredRequests = requests.filter(r => 
    statusFilter === 'ALL' ? true : r.status === statusFilter
  )

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-[var(--warning)]/20 text-[var(--warning)]',
      APPROVED: 'bg-[var(--success)]/20 text-[var(--success)]',
      DECLINED: 'bg-[var(--error)]/20 text-[var(--error)]',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Restaurant Requests
          </h1>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            {['PENDING', 'APPROVED', 'DECLINED', 'ALL'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-[20px] text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Requests List */}
        <Card className="p-0 overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg">No {statusFilter.toLowerCase()} requests</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {filteredRequests.map((request) => (
                <div key={request.id} className="p-4 lg:p-6 hover:bg-[var(--bg-hover)] transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {request.contactName}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {request.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {request.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-[var(--bg-app)] rounded-lg">
                        <p className="text-sm text-[var(--text-secondary)]">
                          {request.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {request.status === 'PENDING' && (
                      <div className="flex gap-2 lg:flex-col">
                        <Button
                          variant="primary"
                          className="text-sm !py-2"
                          onClick={() => handleApprove(request.id)}
                          isLoading={actionLoading === request.id}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="text-sm !py-2"
                          onClick={() => setDeclineModal({ open: true, requestId: request.id, reason: '' })}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                    
                    {request.status === 'APPROVED' && request.approvalCode && (
                      <div className="text-sm text-[var(--text-muted)]">
                        <span className="block">Registration link sent</span>
                        <code className="text-xs bg-[var(--bg-hover)] px-2 py-1 rounded">
                          {request.approvalCode.substring(0, 8)}...
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Decline Modal */}
      {declineModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeclineModal({ open: false, requestId: null, reason: '' })} />
          <div className="relative bg-[var(--bg-card)] rounded-[25px] p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              Decline Request
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Optionally provide a reason for declining this request. This will be included in the email to the restaurant.
            </p>
            <textarea
              value={declineModal.reason}
              onChange={(e) => setDeclineModal({ ...declineModal, reason: e.target.value })}
              placeholder="Reason for declining (optional)"
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none h-24"
            />
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeclineModal({ open: false, requestId: null, reason: '' })}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleDecline}
                isLoading={actionLoading === declineModal.requestId}
              >
                Decline Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
