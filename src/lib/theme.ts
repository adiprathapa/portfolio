/**
 * Design tokens shared by every section. These mirror the CSS custom
 * properties in index.css; anything read from JS (inline styles, canvas,
 * framer-motion values) should come from here instead of a literal.
 */

export const COLOR = {
  primary: '#0671A4',
  primaryHover: '#055a84',
  accent: '#38BDF8',
  white: '#FFFFFF',
  heading: '#111827',
  body: '#4B5563',
  prose: '#515850',
  muted: '#7A7D72',
  ink: '#0f172a',
} as const

export const SURFACE = {
  page: '#f4f4f4',
  tint: '#E4EFF5',
  tintHover: '#D7E8F1',
  panel: '#EFF3F8',
} as const

/** `#RRGGBB` → `rgba(r, g, b, alpha)`. Falls back to the brand primary. */
export function alpha(hex: string, a: number) {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return `rgba(6, 113, 164, ${a})`
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/** Brand primary at the opacities the design uses repeatedly. */
export const PRIMARY = {
  a06: alpha(COLOR.primary, 0.06),
  a08: alpha(COLOR.primary, 0.08),
  a10: alpha(COLOR.primary, 0.1),
  a15: alpha(COLOR.primary, 0.15),
  a20: alpha(COLOR.primary, 0.2),
  a25: alpha(COLOR.primary, 0.25),
  a30: alpha(COLOR.primary, 0.3),
  a50: alpha(COLOR.primary, 0.5),
  a75: alpha(COLOR.primary, 0.75),
  a85: alpha(COLOR.primary, 0.85),
} as const

export const CARD_BORDER = `1.5px solid ${PRIMARY.a30}`
export const CARD_RADIUS = 20

export const SHADOW = {
  card: '0 4px 12px rgba(0, 0, 0, 0.04)',
  cardHover: '0 16px 48px rgba(6, 113, 164, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)',
  button: '0 2px 8px rgba(6, 113, 164, 0.12)',
  /** Stripe-inspired segmented-control shadow. */
  control: '0 2px 5px -1px rgba(50,50,93,0.25), 0 1px 3px -1px rgba(0,0,0,0.3)',
} as const

/** Fluid type scale, kept in one place so sections stay visually in step. */
export const TEXT = {
  h1: 'clamp(2.25rem, 3vw + 1rem, 3.75rem)',
  h2: 'clamp(1.5rem, 1vw + 1rem, 1.875rem)',
  h3: 'clamp(1.125rem, 0.75vw + 0.75rem, 1.5rem)',
  body: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)',
  bodySm: 'clamp(0.875rem, 0.4vw + 0.7rem, 1.05rem)',
  link: 'clamp(0.95rem, 0.4vw + 0.8rem, 1.125rem)',
  nav: 'clamp(0.95rem, 0.3vw + 0.85rem, 1.0625rem)',
} as const

/** Tailwind's `lg` breakpoint; the site's desktop/mobile split. */
export const DESKTOP_BP = 1024
