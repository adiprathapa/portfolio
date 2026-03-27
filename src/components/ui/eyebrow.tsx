import type { ReactNode } from 'react'

interface EyebrowProps {
  children: ReactNode
  className?: string
}

export function Eyebrow({ children, className = '' }: EyebrowProps) {
  return (
    <span className={`text-xs font-semibold uppercase tracking-widest text-primary ${className}`}>
      {children}
    </span>
  )
}
