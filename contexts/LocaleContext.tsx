'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Available options - can be extended later
export const COUNTRIES = [
  { code: 'UAE', name: 'United Arab Emirates' }
]

export const LANGUAGES = [
  { code: 'en', name: 'English' }
]

export const CURRENCIES = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' }
]

// Currency symbol mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
  AED: 'AED',
  USD: '$',
  EUR: '€',
}

interface LocaleData {
  country: string
  language: string
}

interface LocaleContextType {
  country: string
  language: string
  showLocaleModal: boolean
  isLoaded: boolean
  setLocale: (locale: LocaleData) => void
  closeModal: () => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

const LOCALE_STORAGE_KEY = 'userLocale'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState('UAE')
  const [language, setLanguage] = useState('en')
  const [showLocaleModal, setShowLocaleModal] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check localStorage on mount
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY)
    
    if (savedLocale) {
      try {
        const parsed = JSON.parse(savedLocale) as LocaleData
        setCountry(parsed.country || 'UAE')
        setLanguage(parsed.language || 'en')
      } catch {
        // Invalid data, show modal
        setShowLocaleModal(true)
      }
    } else {
      // No saved preference, show modal
      setShowLocaleModal(true)
    }
    
    setIsLoaded(true)
  }, [])

  const setLocale = (locale: LocaleData) => {
    setCountry(locale.country)
    setLanguage(locale.language)
    localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(locale))
    setShowLocaleModal(false)
  }

  const closeModal = () => {
    setShowLocaleModal(false)
  }

  return (
    <LocaleContext.Provider
      value={{
        country,
        language,
        showLocaleModal,
        isLoaded,
        setLocale,
        closeModal,
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
