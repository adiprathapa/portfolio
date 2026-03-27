import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  href?: string
}

export function Card({ children, className = '', href }: CardProps) {
  const classes = `rounded-md border border-border p-6 shadow-card hover:scale-[1.02] transition-transform duration-300 ease-out ${className}`

  if (href) {
    return (
      <a href={href} className={`block ${classes}`} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return <div className={classes}>{children}</div>
}
