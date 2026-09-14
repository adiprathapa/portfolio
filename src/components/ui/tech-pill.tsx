import type { ReactNode } from 'react'

const PILL_STYLE = {
  backgroundColor: 'rgba(6, 113, 164, 0.08)',
  color: '#0671A4',
  border: '1px solid rgba(6, 113, 164, 0.15)',
}

// Default sizing matches the homepage project cards (small on mobile, larger on lg).
const DEFAULT_CLASS = 'px-1.5 py-0.5 lg:px-3 lg:py-1 rounded-xl text-[10px] leading-[1.2] lg:text-sm lg:leading-normal font-medium'

export function TechPill({ children, href, className = DEFAULT_CLASS }: { children: ReactNode; href?: string; className?: string }) {
  if (href) {
    return (
      <a href={href} className={`${className} transition-colors hover:bg-[rgba(6,113,164,0.14)]`} style={PILL_STYLE}>
        {children}
      </a>
    )
  }
  return (
    <span className={className} style={PILL_STYLE}>
      {children}
    </span>
  )
}
