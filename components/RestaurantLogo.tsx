'use client'

import Image from 'next/image'

interface RestaurantLogoProps {
  logoUrl?: string | null
  restaurantName?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { width: 40, height: 40 },
  md: { width: 60, height: 60 },
  lg: { width: 80, height: 80 },
}

export default function RestaurantLogo({ 
  logoUrl, 
  restaurantName = 'Restaurant',
  size = 'md', 
  className = '' 
}: RestaurantLogoProps) {
  const dimensions = sizeMap[size]
  
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={restaurantName}
        width={dimensions.width}
        height={dimensions.height}
        className={`object-contain rounded-lg ${className}`}
      />
    )
  }

  // Fallback: Show initials in a styled container
  const initials = restaurantName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div 
      className={`flex items-center justify-center rounded-lg bg-[var(--color-accent)] text-[var(--text-primary)] font-semibold ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <span className={size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl'}>
        {initials}
      </span>
    </div>
  )
}
