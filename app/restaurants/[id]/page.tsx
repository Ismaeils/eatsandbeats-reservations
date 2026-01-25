'use client'

import PublicReservationModal from '@/components/PublicReservationModal'
import RestaurantLogo from '@/components/RestaurantLogo'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface RestaurantDetails {
  id: string
  name: string
  logoUrl?: string
  description?: string
  photos: string[]
  cuisines: string[]
  address: string
  phone?: string
  email?: string
  reservationDeposit: number
  currency: string
  reservationDuration: number
  slotGranularity: number
  openingHours: {
    dayOfWeek: number
    isOpen: boolean
    openTime: string | null
    closeTime: string | null
  }[]
  exceptionalDates: {
    date: string
    isOpen: boolean
    openTime: string | null
    closeTime: string | null
    note?: string
  }[]
}

export default function RestaurantDetailPage() {
  const params = useParams()
  const restaurantId = params.id as string
  const { theme } = useTheme()
  const logoSrc = theme === 'dark' 
    ? '/uploads/eatsnbeats-light.png'
    : '/uploads/eatsnbeats-dark.png'

  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(0)

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/public/restaurants/${restaurantId}`)
        const data = await response.json()

        if (data.success) {
          setRestaurant(data.data)
        } else {
          setError(data.error || 'Restaurant not found')
        }
      } catch (err) {
        setError('Failed to load restaurant')
      } finally {
        setIsLoading(false)
      }
    }

    if (restaurantId) {
      fetchRestaurant()
    }
  }, [restaurantId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Restaurant Not Found</h1>
          <p className="text-[var(--text-secondary)] mb-6">{error || 'The restaurant you\'re looking for doesn\'t exist.'}</p>
          <Link href="/restaurants" className="text-[var(--color-primary)] hover:underline">
            Browse all restaurants
          </Link>
        </div>
      </div>
    )
  }

  const displayPhotos = restaurant.photos?.length > 0 ? restaurant.photos : 
    ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop']

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      {/* Navigation */}
      <nav className="px-6 sm:px-8 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/restaurants" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to restaurants</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center"
            >
              <Image
                src={logoSrc}
                alt="Eats & Beats"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Photo Gallery */}
          <div className="mb-8">
            {/* Main Photo */}
            <div className="relative aspect-[21/9] sm:aspect-[3/1] rounded-[25px] overflow-hidden mb-3">
              <Image
                src={displayPhotos[selectedPhoto]}
                alt={`${restaurant.name} photo`}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Thumbnails */}
            {displayPhotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayPhotos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(index)}
                    className={`relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                      selectedPhoto === index 
                        ? 'ring-2 ring-[var(--color-primary)]' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={photo}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Restaurant Info */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Main Info */}
            <div className="flex-1 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <RestaurantLogo 
                  logoUrl={restaurant.logoUrl} 
                  restaurantName={restaurant.name}
                  size="lg"
                />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
                    {restaurant.name}
                  </h1>
                  {restaurant.cuisines.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {restaurant.cuisines.map((cuisine, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {restaurant.description && (
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">About</h2>
                  <p className="text-[var(--text-secondary)] whitespace-pre-line">
                    {restaurant.description}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="bg-[var(--bg-card)] rounded-[20px] p-6 border border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[var(--text-secondary)]">{restaurant.address}</span>
                  </div>
                  
                  {restaurant.phone && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${restaurant.phone}`} className="text-[var(--color-primary)] hover:underline">
                        {restaurant.phone}
                      </a>
                    </div>
                  )}
                  
                  {restaurant.email && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${restaurant.email}`} className="text-[var(--color-primary)] hover:underline">
                        {restaurant.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Opening Hours & CTA */}
            <div className="md:w-80 lg:w-96 space-y-6">
              {/* Reserve Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 rounded-[20px] bg-[var(--color-primary)] text-white font-semibold text-lg hover:bg-[var(--color-primary)]/90 transition-colors"
              >
                Reserve a Table
              </button>

              {/* Opening Hours */}
              <div className="bg-[var(--bg-card)] rounded-[20px] p-6 border border-[var(--border-color)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Opening Hours</h2>
                <div className="space-y-2">
                  {DAYS_OF_WEEK.map((day, index) => {
                    const hours = restaurant.openingHours.find(h => h.dayOfWeek === index)
                    const isToday = new Date().getDay() === index
                    
                    return (
                      <div 
                        key={day} 
                        className={`flex justify-between py-2 ${
                          isToday ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isToday && (
                            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                          )}
                          {day}
                        </span>
                        <span>
                          {hours?.isOpen 
                            ? `${hours.openTime} - ${hours.closeTime}`
                            : 'Closed'
                          }
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="h-16" />

      {/* Reservation Modal */}
      <PublicReservationModal
        restaurant={restaurant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
