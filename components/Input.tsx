import React, { useCallback } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({
  label,
  error,
  className = '',
  onFocus,
  ...props
}: InputProps) {
  // Scroll input into view when focused (helps with mobile keyboard)
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Small delay to let the keyboard open first
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
    onFocus?.(e)
  }, [onFocus])

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-1.5 sm:mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-[20px] bg-[var(--bg-card)] border border-[var(--border-color)] text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all shadow-sm ${className}`}
        onFocus={handleFocus}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-[var(--error)]">{error}</p>
      )}
    </div>
  )
}
