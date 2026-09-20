import type { ButtonHTMLAttributes } from 'react'
import { COLOR, PRIMARY } from '../../lib/theme'
import { CloseIcon } from './icons'
import { cn } from '../../lib/utils'

/** Small circular dismiss button used by the game panels and modals. */
export function CloseButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Close"
      className={cn('flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors', className)}
      style={{ color: COLOR.primary, background: 'none', border: 'none' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = PRIMARY.a10 }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      {...props}
    >
      <CloseIcon />
    </button>
  )
}
