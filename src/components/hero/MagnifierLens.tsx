import { createPortal } from 'react-dom'
import type { RefObject } from 'react'
import type { Greeting } from '../../data/greetings'
import { renderSegments } from './useTypewriter'

const LENS_SIZE = 140
const LENS_RADIUS = LENS_SIZE / 2
const MAGNIFY = 1.5

interface MagnifierLensProps {
  headingRef: RefObject<HTMLElement | null>
  cursor: { x: number; y: number }
  text: string
  greeting: Greeting
}

/**
 * Circular loupe that follows the cursor over the hero heading. It renders a
 * scaled clone of the heading positioned so the point under the cursor stays
 * put, which reads as magnification.
 */
export function MagnifierLens({ headingRef, cursor, text, greeting }: MagnifierLensProps) {
  // Measured during render on purpose: the lens follows the cursor frame by
  // frame, so a layout-effect read would always be one frame behind.
  // eslint-disable-next-line react-hooks/refs
  const headingRect = headingRef.current?.getBoundingClientRect()
  if (!headingRect) return null

  const left = cursor.x - LENS_RADIUS
  const top = cursor.y - LENS_RADIUS

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left,
        top,
        width: LENS_SIZE,
        height: LENS_SIZE,
        borderRadius: '50%',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 30px rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(135deg, #eef6fb 0%, #e0f2fe 50%, #f0f9ff 100%)',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <div
        aria-hidden
        className="absolute whitespace-nowrap font-heading font-bold tracking-tight text-heading"
        style={{
          left: headingRect.left - left,
          top: headingRect.top - top,
          transform: `scale(${MAGNIFY})`,
          transformOrigin: `${cursor.x - headingRect.left}px ${cursor.y - headingRect.top}px`,
          lineHeight: 1.2,
          fontSize: 'clamp(2rem, 5vw, 4.5rem)',
        }}
      >
        <span className="text-primary">
          {renderSegments(text, greeting.segments)}
          <span className="ml-0.5 text-primary/60">|</span>
        </span>
      </div>
    </div>,
    document.body,
  )
}
