'use client'

import { useState } from 'react'
import { useLocale, COUNTRIES, LANGUAGES } from '@/contexts/LocaleContext'
import Button from './Button'

export default function LocaleSelectionModal() {
  const { showLocaleModal, setLocale, isLoaded } = useLocale()
  const [selectedCountry, setSelectedCountry] = useState('UAE')
  const [selectedLanguage, setSelectedLanguage] = useState('en')

  // Don't render anything until we've checked localStorage
  if (!isLoaded || !showLocaleModal) {
    return null
  }

  const handleContinue = () => {
    setLocale({
      country: selectedCountry,
      language: selectedLanguage,
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--color-primary)] px-6 py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome</h2>
          <p className="text-white/80 text-sm">
            Select your country and language to personalize your experience
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Continue Button */}
          <Button
            variant="primary"
            className="w-full py-3 text-base"
            onClick={handleContinue}
          >
            Continue
          </Button>

          <p className="text-xs text-center text-[var(--text-muted)]">
            You can change these settings anytime from the menu
          </p>
        </div>
      </div>
    </div>
  )
}
