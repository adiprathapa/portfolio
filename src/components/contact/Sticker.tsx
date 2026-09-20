import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import type { Sticker as StickerData } from '../../data/stickers'

/** Sticker grows by this much while held, which the drag bounds must allow for. */
const DRAG_SCALE = 1.1
const DOUBLE_TAP_MS = 300
/** Inset of the lid's painted surface inside its SVG viewBox. */
const LID_INSET = { left: 0.035, top: 0.05, right: 0.035, bottom: 0.045 }

const SPRING = { type: 'spring', stiffness: 300, damping: 25 } as const
const PEEL_UP = {
  rotateX: [0, 18, 4, 0],
  scale: [1, 1.04, 1.08, DRAG_SCALE],
  filter: [
    'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
    'drop-shadow(0 8px 14px rgba(0,0,0,0.28))',
    'drop-shadow(0 10px 20px rgba(0,0,0,0.32))',
    'drop-shadow(0 12px 24px rgba(0,0,0,0.35))',
  ],
}
const PEEL_DOWN = {
  rotateX: [0, -5, 1, 0],
  scale: [DRAG_SCALE, 0.96, 1.01, 1],
  filter: [
    'drop-shadow(0 12px 24px rgba(0,0,0,0.35))',
    'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
    'drop-shadow(0 2px 5px rgba(0,0,0,0.1))',
    'drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
  ],
}
const PEEL_TIMING = { duration: 0.3, ease: [0.33, 0, 0.2, 1] } as const

type Insets = { top: number; left: number; right: number; bottom: number }

/**
 * Scans the artwork's alpha channel for its opaque bounding box, as a fraction
 * of each edge. Stickers have generous transparent padding, and without this
 * they could be dragged until only the padding overlapped the lid.
 */
function useOpaqueInsets(src: string, active: boolean) {
  const [insets, setInsets] = useState<Insets | null>(null)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)

      let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (data[(y * canvas.width + x) * 4 + 3] <= 10) continue
          if (x < minX) minX = x
          if (y < minY) minY = y
          if (x > maxX) maxX = x
          if (y > maxY) maxY = y
        }
      }
      if (maxX < minX || maxY < minY) return
      setInsets({
        top: minY / canvas.height,
        left: minX / canvas.width,
        right: 1 - (maxX + 1) / canvas.width,
        bottom: 1 - (maxY + 1) / canvas.height,
      })
    }
    img.src = src
    return () => { cancelled = true }
  }, [active, src])

  return insets
}

/** Drag bounds that keep the sticker's visible pixels on the lid surface. */
function useDragBounds(
  stickerRef: RefObject<HTMLDivElement | null>,
  lidRef: RefObject<HTMLDivElement | null> | undefined,
  insets: Insets | null,
  disabled: boolean,
) {
  const [bounds, setBounds] = useState<Insets | undefined>()

  useEffect(() => {
    if (disabled || !lidRef?.current || !stickerRef.current || !insets) {
      setBounds(undefined)
      return
    }
    const frame = requestAnimationFrame(() => {
      const lidEl = lidRef.current
      const el = stickerRef.current
      if (!lidEl || !el) return

      const lid = lidEl.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      const growX = (rect.width * (DRAG_SCALE - 1)) / 2
      const growY = (rect.height * (DRAG_SCALE - 1)) / 2

      const visible = {
        left: rect.left - growX + insets.left * rect.width * DRAG_SCALE,
        top: rect.top - growY + insets.top * rect.height * DRAG_SCALE,
        right: rect.right + growX - insets.right * rect.width * DRAG_SCALE,
        bottom: rect.bottom + growY - insets.bottom * rect.height * DRAG_SCALE,
      }
      // Convert viewport distances into the element's own space, which the
      // laptop's `zoom` and scale transforms have changed.
      const scaleX = rect.width / el.offsetWidth || 1
      const scaleY = rect.height / el.offsetHeight || 1

      setBounds({
        top: (lid.top + lid.height * LID_INSET.top - visible.top) / scaleY,
        left: (lid.left + lid.width * LID_INSET.left - visible.left) / scaleX,
        right: (lid.right - lid.width * LID_INSET.right - visible.right) / scaleX,
        bottom: (lid.bottom - lid.height * LID_INSET.bottom - visible.bottom) / scaleY,
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [disabled, lidRef, stickerRef, insets])

  return bounds
}

interface StickerProps {
  sticker: StickerData
  style: CSSProperties
  /** The lid, which constrains dragging. */
  lidRef: RefObject<HTMLDivElement | null>
  disabled?: boolean
  /** Deferred until the section is near the viewport (the alpha scan is costly). */
  active?: boolean
  /** Returns the next z-index, so a dropped sticker lands on top. */
  onDropped: () => number
}

export function Sticker({ sticker, style, lidRef, disabled, active = true, onDropped }: StickerProps) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [placedZ, setPlacedZ] = useState<number | undefined>()
  const stickerRef = useRef<HTMLDivElement>(null)
  const peelRef = useRef<HTMLDivElement>(null)
  const lastTap = useRef(0)
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)

  const insets = useOpaqueInsets(sticker.src, active)
  const dragBounds = useDragBounds(stickerRef, lidRef, insets, !!disabled)

  useEffect(() => {
    if (!hovered) return
    const dismiss = () => setHovered(false)
    window.addEventListener('scroll', dismiss, { passive: true })
    return () => window.removeEventListener('scroll', dismiss)
  }, [hovered])

  const isTouch = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    window.matchMedia('(pointer: coarse)').matches ||
    window.innerWidth < 1024
  )
  const hoverHandlers = disabled || isTouch ? {} : {
    onMouseEnter: () => { if (!dragging) setHovered(true) },
    onMouseLeave: () => setHovered(false),
  }

  // Measured on mount so a tooltip near the viewport edge shifts inward.
  const tooltipRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    const offsetX = sticker.tooltipOffsetX ?? 0
    el.style.left = '50%'
    el.style.transform = `translateX(calc(-50% + ${offsetX}px))`

    const rect = el.getBoundingClientRect()
    const pad = 8
    const viewport = document.documentElement.clientWidth
    const shift = rect.left < pad ? pad - rect.left : rect.right > viewport - pad ? viewport - pad - rect.right : 0
    if (shift === 0) return
    el.style.left = `calc(50% + ${shift}px)`
    el.style.transform = `translateX(calc(-50% + ${offsetX + shift}px))`
  }, [sticker.tooltipOffsetX])

  const peel = (keyframes: typeof PEEL_UP) => {
    if (peelRef.current) animate(peelRef.current, keyframes, PEEL_TIMING)
  }

  return (
    <motion.div
      ref={stickerRef}
      className="absolute select-none"
      style={{
        ...style,
        x: dragX,
        y: dragY,
        zIndex: dragging ? 1000 : hovered ? 100 : placedZ,
        cursor: disabled ? 'default' : dragging ? 'grabbing' : 'grab',
      }}
      drag={!disabled}
      dragConstraints={dragBounds}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => {
        setDragging(true)
        setHovered(false)
        peel(PEEL_UP)
      }}
      onDragEnd={() => {
        setDragging(false)
        setPlacedZ(onDropped())
        peel(PEEL_DOWN)
      }}
      onTap={() => {
        const now = Date.now()
        // Double tap snaps the sticker back to where it started.
        if (now - lastTap.current < DOUBLE_TAP_MS) {
          animate(dragX, 0, SPRING)
          animate(dragY, 0, SPRING)
        }
        lastTap.current = now
      }}
    >
      <div className="absolute" style={{ ...sticker.hoverArea, cursor: 'inherit' }} {...hoverHandlers} />
      <div style={{ perspective: 600 }}>
        <div
          ref={peelRef}
          style={{
            transformOrigin: 'center top',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
            willChange: 'transform, filter',
          }}
        >
          <img
            src={sticker.src}
            alt={sticker.alt}
            className="pointer-events-none h-auto w-full"
            style={{
              transition: dragging ? 'none' : 'transform 0.2s ease',
              transform: `${sticker.rotation ? `rotate(${sticker.rotation}deg) ` : ''}${hovered && !dragging ? 'scale(1.08)' : 'scale(1)'}`,
            }}
          />
        </div>
      </div>

      {hovered && !dragging && (
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium"
          style={{
            left: '50%',
            transform: `translateX(calc(-50% + ${sticker.tooltipOffsetX ?? 0}px))`,
            top: sticker.tooltipTop,
            zIndex: 9999,
            background: 'rgba(15,15,15,0.85)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          }}
        >
          {sticker.label}
        </div>
      )}
    </motion.div>
  )
}
