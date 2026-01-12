import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-1.5 sm:mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--glass-border)] text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all shadow-sm ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-[var(--error)]">{error}</p>
      )}
    </div>
  )
}
