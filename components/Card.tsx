import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  // If className contains padding (p-), don't add default padding
  const hasCustomPadding = /\bp-\d|\bpx-|\bpy-|\bpt-|\bpb-|\bpl-|\bpr-/.test(className)
  const defaultPadding = hasCustomPadding ? '' : 'p-4 sm:p-5 lg:p-6'
  
  return (
    <div className={`glass-card rounded-xl ${defaultPadding} ${className}`}>
      {children}
    </div>
  )
}
