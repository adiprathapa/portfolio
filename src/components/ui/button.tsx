import type { ReactNode, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'outline-white' | 'link'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  href?: string
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'inline-flex items-center justify-center rounded-full bg-dark text-white px-6 py-3 text-sm font-semibold hover:bg-heading transition-colors',
  outline:
    'inline-flex items-center justify-center rounded-full border border-border text-body px-6 py-3 text-sm font-medium hover:border-heading transition-colors',
  'outline-white':
    'inline-flex items-center justify-center rounded-full border border-white/30 text-white px-6 py-3 text-sm font-medium hover:bg-white/10 transition-colors',
  link: 'inline-flex items-center gap-1.5 text-body font-medium hover:text-heading transition-colors group',
}

export function Button({ variant = 'primary', href, children, className = '', onClick, ...props }: ButtonProps) {
  const classes = `${variantClasses[variant]} ${className}`

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick as React.MouseEventHandler}>
        {children}
        {variant === 'link' && (
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        )}
      </a>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
      {variant === 'link' && (
        <svg
          className="w-4 h-4 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      )}
    </button>
  )
}
