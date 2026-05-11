import type { CSSProperties, ElementType, ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  as?: ElementType
  className?: string
  style?: CSSProperties
}

export function GradientText({ children, as: Tag = 'span', className = '', style }: GradientTextProps) {
  return (
    <Tag className={`gradient-text ${className}`} style={style}>
      {children}
    </Tag>
  )
}
