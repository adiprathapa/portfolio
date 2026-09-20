import React, { type CSSProperties, type MouseEvent } from 'react'
import { RippleButton } from './ripple-button'
import { COLOR, PRIMARY, SHADOW, SURFACE } from '../../lib/theme'
import { cn } from '../../lib/utils'

export type PillVariant = 'primary' | 'ghost' | 'soft'

interface VariantStyle {
  rest: CSSProperties
  hover: Pick<CSSProperties, 'backgroundColor' | 'borderColor'>
}

const VARIANTS: Record<PillVariant, VariantStyle> = {
  primary: {
    rest: {
      backgroundColor: COLOR.primary,
      color: COLOR.white,
      border: '2px solid transparent',
      boxShadow: SHADOW.button,
      transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
    },
    hover: { backgroundColor: COLOR.primaryHover },
  },
  ghost: {
    rest: {
      backgroundColor: 'transparent',
      color: COLOR.primary,
      border: `2px solid ${PRIMARY.a30}`,
      transition: 'background-color 0.3s, border-color 0.3s',
    },
    hover: { backgroundColor: PRIMARY.a06, borderColor: COLOR.primary },
  },
  soft: {
    rest: {
      backgroundColor: SURFACE.tint,
      color: COLOR.primary,
      border: `2px solid ${PRIMARY.a30}`,
      transition: 'background-color 0.3s, border-color 0.3s, color 0.3s',
    },
    hover: { backgroundColor: SURFACE.tintHover, borderColor: COLOR.primary },
  },
}

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PillVariant
  /** Passed through to RippleButton. */
  rippleColor?: string
}

/**
 * The site's rounded action button. Hover is applied to the DOM node directly
 * so a pointer move never re-renders the surrounding game or card.
 */
export function PillButton({
  variant = 'primary',
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  rippleColor = COLOR.accent,
  ...props
}: PillButtonProps) {
  const { rest, hover } = VARIANTS[variant]

  const applyHover = (e: MouseEvent<HTMLButtonElement>, on: boolean) => {
    const target = e.currentTarget
    const source = on ? hover : rest
    target.style.backgroundColor = String(source.backgroundColor ?? '')
    if (hover.borderColor) {
      target.style.borderColor = on ? String(hover.borderColor) : String(PRIMARY.a30)
    }
  }

  return (
    <RippleButton
      className={cn('rounded-full px-5 py-2 text-sm font-medium', className)}
      rippleColor={rippleColor}
      style={{ ...rest, ...style }}
      onMouseEnter={(e) => { applyHover(e, true); onMouseEnter?.(e) }}
      onMouseLeave={(e) => { applyHover(e, false); onMouseLeave?.(e) }}
      {...props}
    />
  )
}
