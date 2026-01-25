'use client'

import Button from '@/components/Button'
import Card from '@/components/Card'
import ImageUpload from '@/components/ImageUpload'
import Input from '@/components/Input'
import Layout from '@/components/Layout'
import apiClient from '@/lib/api-client'
import { useCallback, useEffect, useState } from 'react'

export default function PublicListingSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    description: '',
    cuisines: '',
    logoUrl: '',
    photos: [] as string[],
    phone: '',
    email: '',
  })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/restaurants/me') as any
      if (response?.success) {
        const restaurant = response.data
        setFormData({
          description: restaurant.description || '',
          cuisines: restaurant.cuisines?.join(', ') || '',
          logoUrl: restaurant.logoUrl || '',
          photos: restaurant.photos || [],
          phone: restaurant.phone || '',
          email: restaurant.email || '',
        })
      }
    } catch (err: any) {
      setError('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const payload = {
        description: formData.description || null,
        cuisines: formData.cuisines.split(',').map(c => c.trim()).filter(c => c),
        logoUrl: formData.logoUrl || null,
        photos: formData.photos,
        phone: formData.phone || null,
        email: formData.email || null,
      }

      const response = await apiClient.patch('/restaurants/onboarding', payload) as any
      if (response?.success) {
        setSuccess('Settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response?.error || 'Failed to save settings')
      }
    } catch (err: any) {
      setError(err.error || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpload = (url: string) => {
    if (formData.photos.length < 5) {
      setFormData({ ...formData, photos: [...formData.photos, url] })
    }
  }

  const handlePhotoRemove = (index: number) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
    })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Public Listing
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage how your restaurant appears to guests
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-[var(--success)]/20 border border-[var(--success)]/50 text-[var(--success)] px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* About Section */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              About Your Restaurant
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell guests what makes your restaurant special..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] resize-none"
                />
              </div>

              <div>
                <Input
                  label="Cuisines (comma-separated)"
                  type="text"
                  value={formData.cuisines}
                  onChange={(e) => setFormData({ ...formData, cuisines: e.target.value })}
                  placeholder="Italian, Mediterranean, Seafood"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  This helps guests find your restaurant when searching by cuisine type.
                </p>
              </div>
            </div>
          </Card>

          {/* Photos Section */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Photos
            </h2>
            <div className="space-y-6">
              <ImageUpload
                label="Restaurant Logo"
                currentImageUrl={formData.logoUrl}
                onUpload={(url) => setFormData({ ...formData, logoUrl: url })}
                type="logo"
              />

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Gallery Photos (up to 5)
                </label>
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  These photos will appear on your restaurant listing page.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-[var(--bg-hover)]">
                      <img
                        src={photo}
                        alt={`Restaurant photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotoRemove(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {formData.photos.length < 5 && (
                    <ImageUpload
                      label=""
                      currentImageUrl=""
                      onUpload={handlePhotoUpload}
                      type="gallery"
                      compact
                    />
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Section */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Contact Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+971 50 123 4567"
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="reservations@restaurant.com"
              />
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
