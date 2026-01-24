'use client'

import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'
import Image from 'next/image'
import Link from 'next/link'

export default function LandingPage() {
  const { theme } = useTheme()
  
  const logoSrc = theme === 'dark' 
    ? '/uploads/eatsnbeats-light.png'
    : '/uploads/eatsnbeats-dark.png'

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      {/* Navigation */}
      <nav className="px-6 sm:px-8 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
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

          {/* Right side */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-5 py-2 rounded-[20px] border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-medium text-sm hover:bg-[var(--color-primary)] hover:text-white transition-all"
            >
              For Partners
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-100px)] flex items-center px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Curated Culinary Experiences
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight">
                  Eats&Beats:{' '}
                  <span className="block">
                    The <em className="text-[var(--color-primary)] not-italic">Rhythm</em> of Dining
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-lg leading-relaxed">
                  Discover the perfect harmony between exceptional cuisine and curated atmospheres. 
                  We connect you with venues where every meal becomes a memory.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/restaurants"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-[25px] bg-[var(--color-primary)] text-white font-semibold text-base hover:bg-[var(--color-primary-hover)] transition-all shadow-lg hover:shadow-xl"
                >
                  Explore Our Restaurants
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-[var(--border-color)]">
                <div>
                  <div className="text-3xl font-bold text-[var(--text-primary)]">200+</div>
                  <div className="text-sm text-[var(--text-muted)]">Partner Venues</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--text-primary)]">50K+</div>
                  <div className="text-sm text-[var(--text-muted)]">Happy Diners</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--text-primary)]">4.9</div>
                  <div className="text-sm text-[var(--text-muted)]">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-[30px] overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1000&fit=crop"
                  alt="Luxury dining experience"
                  width={600}
                  height={700}
                  className="w-full h-[500px] lg:h-[600px] object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Floating card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-[20px] p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Live Beats Tonight</div>
                      <div className="text-xs text-[var(--text-muted)]">Jazz sessions at partner venues</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Why Eats&Beats?
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              We don&apos;t just list restaurants; we curate stages for your memories. 
              From acoustics to ambiance, we consider everything.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-[25px] bg-[var(--bg-app)] border border-[var(--border-color)]">
              <div className="w-14 h-14 rounded-[20px] bg-[var(--color-primary)]/10 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Hand-Picked Venues</h3>
              <p className="text-[var(--text-secondary)]">
                Every restaurant is personally vetted for culinary excellence and unique atmosphere.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-[25px] bg-[var(--bg-app)] border border-[var(--border-color)]">
              <div className="w-14 h-14 rounded-[20px] bg-[var(--color-primary)]/10 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Seamless Booking</h3>
              <p className="text-[var(--text-secondary)]">
                One-tap reservations with real-time floor mapping. Know exactly where you&apos;ll sit before you arrive.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-[25px] bg-[var(--bg-app)] border border-[var(--border-color)]">
              <div className="w-14 h-14 rounded-[20px] bg-[var(--color-primary)]/10 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Curated Vibes</h3>
              <p className="text-[var(--text-secondary)]">
                Enjoy atmospheres tailored to your mood. Our curators sync music with the kitchen&apos;s energy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[30px] overflow-hidden bg-[var(--color-primary)] p-12 sm:p-16 text-center">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to find your next favorite spot?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of food lovers who are discovering their perfect dining experiences.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/restaurants"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-[25px] bg-white text-[var(--color-primary)] font-semibold text-base hover:bg-white/90 transition-all"
                >
                  Explore Restaurants
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-[25px] border-2 border-white text-white font-semibold text-base hover:bg-white/10 transition-all"
                >
                  Partner With Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 sm:px-8 lg:px-12 border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image
                src={logoSrc}
                alt="Eats & Beats"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-sm text-[var(--text-muted)]">
                Crafting culinary memories through the perfect blend of taste, sound, and space.
              </span>
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              © {new Date().getFullYear()} Eats&Beats. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
