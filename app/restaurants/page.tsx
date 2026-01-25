'use client'

import PublicReservationModal from '@/components/PublicReservationModal'
import LocaleSelectionModal from '@/components/LocaleSelectionModal'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'
import { useLocale } from '@/contexts/LocaleContext'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface Restaurant {
  id: string
  name: string
  logoUrl?: string
  photos?: string[]
  address: string
  cuisines: string[]
  district: string
  priceRange: string
  rating: number | null
  isOpen: boolean
}

interface RestaurantDetails {
  id: string
  name: string
  logoUrl?: string
  cuisines: string[]
  address: string
  reservationDuration: number
  slotGranularity: number
  tableLayout: string[]
  hasVisualLayout: boolean
  openingHours: any[]
  exceptionalDates: any[]
  floorPlans: any[]
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

// Placeholder cover images for restaurants
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&h=400&fit=crop',
]

export default function RestaurantsPage() {
  const { theme } = useTheme()
  const { country, isLoaded: localeLoaded } = useLocale()
  const logoSrc = theme === 'dark' 
    ? '/uploads/eatsnbeats-light.png'
    : '/uploads/eatsnbeats-dark.png'

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [cuisines, setCuisines] = useState<string[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal state
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const fetchRestaurants = useCallback(async () => {
    // Don't fetch until locale is loaded
    if (!localeLoaded) return
    
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (selectedCuisine) params.set('cuisine', selectedCuisine)
      if (country) params.set('country', country)
      params.set('page', currentPage.toString())
      params.set('limit', '12')

      const response = await fetch(`/api/public/restaurants?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setRestaurants(data.data.restaurants)
        setCuisines(data.data.cuisines)
        setPagination(data.data.pagination)
      } else {
        setError(data.error || 'Failed to load restaurants')
      }
    } catch (err) {
      setError('Failed to load restaurants')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedCuisine, currentPage, country, localeLoaded])

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchRestaurants()
  }

  const handleCuisineFilter = (cuisine: string) => {
    setSelectedCuisine(cuisine === selectedCuisine ? '' : cuisine)
    setCurrentPage(1)
  }

  const handleReserveClick = async (restaurantId: string) => {
    try {
      setIsLoadingDetails(true)
      const response = await fetch(`/api/public/restaurants/${restaurantId}`)
      const data = await response.json()

      if (data.success) {
        setSelectedRestaurant(data.data)
        setIsModalOpen(true)
      } else {
        alert('Failed to load restaurant details')
      }
    } catch (err) {
      alert('Failed to load restaurant details')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const getCoverImage = (index: number) => {
    return COVER_IMAGES[index % COVER_IMAGES.length]
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      {/* Navigation */}
      <nav className="px-6 sm:px-8 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src={logoSrc}
              alt="Eats & Beats"
              width={60}
              height={60}
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Home
            </Link>
            <ThemeToggle />
            <Link
              href="/partner-request"
              className="px-5 py-2 rounded-[20px] border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-medium text-sm hover:bg-[var(--color-primary)] hover:text-white transition-all"
            >
              For Partners
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="px-6 sm:px-8 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight mb-4">
            Discover Your Next{' '}
            <span className="text-[var(--color-primary)]">Favorite Beat</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl">
            The city&apos;s best tables, curated rhythms, and unforgettable culinary experiences waiting for you.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="px-6 sm:px-8 lg:px-12 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by restaurant, cuisine, or vibe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-[25px] bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 rounded-[25px] bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-hover)] transition-all"
            >
              Find
            </button>
          </form>

          {/* Cuisine Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCuisineFilter('')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCuisine === ''
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              All Cuisines
            </button>
            {cuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => handleCuisineFilter(cuisine)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCuisine === cuisine
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant Grid */}
      <section className="px-6 sm:px-8 lg:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-[var(--error)]">{error}</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No restaurants found</h3>
              <p className="text-[var(--text-secondary)]">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    className="group bg-[var(--bg-card)] rounded-[25px] overflow-hidden border border-[var(--border-color)] hover:shadow-lg transition-all"
                  >
                    {/* Cover Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={restaurant.photos?.[0] || restaurant.logoUrl || getCoverImage(index)}
                        alt={restaurant.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Name & Rating */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] line-clamp-1">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>--</span>
                        </div>
                      </div>

                      {/* Info */}
                      <p className="text-sm text-[var(--text-muted)] mb-4">
                        {restaurant.cuisines[0] || 'Restaurant'} • {restaurant.district} • {restaurant.priceRange}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReserveClick(restaurant.id)}
                          disabled={isLoadingDetails}
                          className="flex-1 py-2.5 rounded-[20px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium text-sm hover:bg-[var(--color-primary)] hover:text-white transition-all disabled:opacity-50"
                        >
                          Reserve Now
                        </button>
                        <Link href={`/restaurants/${restaurant.id}`}>
                          <button className="w-10 h-10 rounded-[15px] bg-[var(--bg-hover)] flex items-center justify-center hover:bg-[var(--border-color)] transition-all">
                            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center gap-4">
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasMore}
                    className="px-8 py-3 rounded-[25px] bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Load More Experiences
                  </button>
                  <p className="text-sm text-[var(--text-muted)]">
                    Showing {restaurants.length} of {pagination.totalCount} restaurants
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 sm:px-8 lg:px-12 border-t border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <Image
                src={logoSrc}
                alt="Eats & Beats"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-lg font-semibold text-[var(--text-primary)]">Eats&Beats</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--text-muted)]">
              <Link href="#" className="hover:text-[var(--text-primary)] transition-colors">About Us</Link>
              <Link href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
              <Link href="/partner-request" className="hover:text-[var(--text-primary)] transition-colors">Partner with Us</Link>
              <Link href="#" className="hover:text-[var(--text-primary)] transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              © {new Date().getFullYear()} Eats&Beats Inc. Set your table, find your rhythm.
            </p>
          </div>
        </div>
      </footer>

      {/* Reservation Modal */}
      {selectedRestaurant && (
        <PublicReservationModal
          restaurant={selectedRestaurant}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedRestaurant(null)
          }}
        />
      )}

      {/* Locale Selection Modal - shows on first visit */}
      <LocaleSelectionModal />
    </div>
  )
}
