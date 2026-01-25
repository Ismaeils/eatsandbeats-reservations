'use client'

import Button from '@/components/Button'
import Card from '@/components/Card'
import ImageUpload from '@/components/ImageUpload'
import Input from '@/components/Input'
import Layout from '@/components/Layout'
import apiClient from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

const STEP_TITLES = [
  'About Your Restaurant',
  'Photos',
  'Contact Information',
]

const STEP_DESCRIPTIONS = [
  'Tell guests about your restaurant and cuisine',
  'Add your logo and photos for your listing',
  'How can guests reach you?',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [restaurant, setRestaurant] = useState<any>(null)

  // Form data
  const [formData, setFormData] = useState({
    description: '',
    cuisines: '',
    logoUrl: '',
    photos: [] as string[],
    phone: '',
    email: '',
  })

  const fetchRestaurant = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/restaurants/me') as any
      if (response?.success) {
        const res = response.data
        setRestaurant(res)
        setFormData({
          description: res.description || '',
          cuisines: res.cuisines?.join(', ') || '',
          logoUrl: res.logoUrl || '',
          photos: res.photos || [],
          phone: res.phone || '',
          email: res.email || '',
        })
      }
    } catch (err: any) {
      console.error('Failed to load restaurant:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRestaurant()
  }, [fetchRestaurant])

  const handleSave = async () => {
    setError('')
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
        if (step < 3) {
          setStep(step + 1)
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(response?.error || 'Failed to save')
      }
    } catch (err: any) {
      setError(err.error || 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleSave()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
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
      photos: formData.photos.filter((_, i) => i !== index) 
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
            Complete Your Profile
          </h1>
          <p className="text-[var(--text-secondary)]">
            Help guests discover your restaurant
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            {[1, 2, 3].map((s, index) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  step >= s 
                    ? 'bg-[var(--color-primary)] text-[var(--bg-app)]' 
                    : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
                }`}>
                  {step > s ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                {index < 2 && (
                  <div className={`w-12 md:w-20 h-1 transition-colors ${
                    step > s ? 'bg-[var(--color-primary)]' : 'bg-[var(--bg-hover)]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              {STEP_TITLES[step - 1]}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {STEP_DESCRIPTIONS[step - 1]}
            </p>
          </div>

          {error && (
            <div className="bg-[var(--error)]/20 border border-[var(--error)]/50 text-[var(--error)] px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: About */}
          {step === 1 && (
            <div className="space-y-6">
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
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <div className="space-y-6">
              <ImageUpload
                label="Restaurant Logo"
                currentImageUrl={formData.logoUrl}
                onUpload={(url) => setFormData({ ...formData, logoUrl: url })}
                type="logo"
              />

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Restaurant Photos (up to 5)
                </label>
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  These photos will appear on your restaurant listing page.
                </p>

                {/* Photo grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-[var(--bg-hover)]">
                      <img
                        src={photo}
                        alt={`Restaurant photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
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
          )}

          {/* Step 3: Contact */}
          {step === 3 && (
            <div className="space-y-6">
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

              {restaurant && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Address
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-color)] text-[var(--text-primary)]">
                    {restaurant.address}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    You can update your address in restaurant settings.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              Skip for Now
            </Button>
            <Button onClick={handleSave} isLoading={isSaving} className="flex-1">
              {step === 3 ? 'Complete' : 'Save & Continue'}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
