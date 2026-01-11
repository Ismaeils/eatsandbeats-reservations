'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  linkTo?: string
  className?: string
}

const sizeMap = {
  sm: { width: 60, height: 60 },
  md: { width: 100, height: 100 },
  lg: { width: 140, height: 140 },
  xl: { width: 180, height: 180 },
}

export default function Logo({ size = 'md', linkTo, className = '' }: LogoProps) {
  const { theme } = useTheme()
  const dimensions = sizeMap[size]
  
  // Use different logo based on theme
  // Light theme: dark logo, Dark theme: light logo
  const logoSrc = theme === 'dark' 
    ? '/uploads/eatsnbeats-light.png'  // Light colored logo for dark backgrounds
    : '/uploads/eatsnbeats-dark.png'   // Dark colored logo for light backgrounds

  const logoImage = (
    <Image
      src={logoSrc}
      alt="Eats & Beats"
      width={dimensions.width}
      height={dimensions.height}
      className={`object-contain ${className}`}
      priority
    />
  )

  if (linkTo) {
    return (
      <Link href={linkTo} className="block">
        {logoImage}
      </Link>
    )
  }

  return logoImage
}
