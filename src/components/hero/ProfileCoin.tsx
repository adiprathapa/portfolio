import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { animate, motion, useMotionValue, useMotionValueEvent } from 'framer-motion'
import { GithubIcon, LinkedInIcon } from '../ui/icons'
import { posthog } from '../../lib/analytics'
import { PRIMARY } from '../../lib/theme'
import { SITE } from '../../data/site'

const DRAG_DEG_PER_PX = 0.75
const CLICK_SLOP_PX = 6
const CLICK_FACE_TOLERANCE_DEG = 10
const MOMENTUM_S = 0.18
const RELEASE_IDLE_MS = 80
const SPRING = { type: 'spring', stiffness: 140, damping: 18, mass: 0.9 } as const

const ICON_SIZE = 32
const ICON_OFFSET = { margin: '-6px 0 0 -6px' }

type Side = 'linkedin' | 'github'

const FACES: Record<Side, { href: string; label: string; event: string; image: string; alt: string; icon: ReactNode; iconClass: string; iconStyle: React.CSSProperties; imageStyle?: React.CSSProperties }> = {
  linkedin: {
    href: `${SITE.linkedin}/`,
    label: 'LinkedIn profile',
    event: 'linkedin_profile_clicked',
    image: '/headshot.webp',
    alt: 'Adi Prathapa',
    icon: <LinkedInIcon size={ICON_SIZE} className="block" style={ICON_OFFSET} />,
    iconClass: 'absolute h-6 w-6 md:h-9 md:w-9',
    iconStyle: { bottom: 'calc(15% + 10px)', right: 'calc(10% + 11px)', color: '#F4F4F4' },
    imageStyle: { objectPosition: 'center 30%', transform: 'scale(1.1) translateY(-10px)' },
  },
  github: {
    href: SITE.github,
    label: 'GitHub profile',
    event: 'github_profile_clicked',
    image: '/pfp.png',
    alt: 'GitHub avatar',
    icon: <GithubIcon size={ICON_SIZE} className="block" style={ICON_OFFSET} />,
    iconClass: 'absolute h-8 w-8 md:h-11 md:w-11',
    iconStyle: { bottom: 'calc(15% + 10px)', right: 'calc(10% + 5px)', color: '#F4F4F4' },
  },
}

function openFace(side: Side) {
  const face = FACES[side]
  posthog?.capture(face.event, { location: 'hero_coin' })
  window.open(face.href, '_blank')
}

function CoinFace({ side, facing, showOverlay, onTurn }: { side: Side; facing: boolean; showOverlay: boolean; onTurn: (direction: 1 | -1) => void }) {
  const face = FACES[side]

  return (
    <div
      className="absolute inset-0 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0671A4]"
      style={{
        borderRadius: '50%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        border: `3px solid ${PRIMARY.a30}`,
        backfaceVisibility: 'hidden',
        ...(side === 'github' ? { transform: 'rotateY(180deg)' } : {}),
      }}
      role="link"
      tabIndex={facing ? 0 : -1}
      aria-hidden={!facing}
      aria-label={`${face.label}. Use the arrow keys to turn the coin.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openFace(side)
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault()
          onTurn(e.key === 'ArrowLeft' ? -1 : 1)
        }
      }}
    >
      <img
        src={face.image}
        alt={face.alt}
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover', ...face.imageStyle }}
      />
      <div
        className="absolute inset-0"
        style={{
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.35)',
          transition: 'opacity 0.3s ease',
          opacity: showOverlay ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        <span className={face.iconClass} style={face.iconStyle}>{face.icon}</span>
      </div>
    </div>
  )
}

interface DragState {
  pointerId: number
  startX: number
  startAngle: number
  moved: boolean
  lastX: number
  lastT: number
  velocity: number
}

const nearestFace = (angle: number) => Math.round(angle / 180) * 180

function sideAt(angle: number): Side {
  const normalized = ((angle % 360) + 360) % 360
  return normalized > 90 && normalized < 270 ? 'github' : 'linkedin'
}

/** Headshot on one side, GitHub avatar on the other. Drag to turn, click to open the face showing. */
export function ProfileCoin({ isMobile }: { isMobile: boolean }) {
  const rotate = useMotionValue(0)
  const [facing, setFacing] = useState<Side>('linkedin')
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const coinRef = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState | null>(null)
  const settle = useRef<ReturnType<typeof animate> | null>(null)

  useMotionValueEvent(rotate, 'change', (value) => setFacing(sideAt(value)))

  const showOverlay = hovered && !isMobile && !dragging

  // Hover only counts inside the circle, not the square that bounds it.
  const updateHover = (clientX: number, clientY: number) => {
    if (isMobile) return
    const rect = coinRef.current?.getBoundingClientRect()
    if (!rect) return
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    const radius = Math.min(rect.width, rect.height) / 2
    setHovered(dx * dx + dy * dy <= radius * radius)
  }

  const settleTo = (target: number, velocity = 0) => {
    settle.current?.stop()
    settle.current = animate(rotate, target, { ...SPRING, velocity })
  }

  const turn = (direction: 1 | -1) => settleTo(nearestFace(rotate.get()) + direction * 180)

  const endDrag = (allowClick: boolean) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    setDragging(false)
    const current = rotate.get()

    if (!d.moved) {
      const restingOnFace = Math.abs(current - nearestFace(current)) < CLICK_FACE_TOLERANCE_DEG
      if (allowClick && restingOnFace) openFace(sideAt(current))
      settleTo(nearestFace(current))
      return
    }

    const velocity = performance.now() - d.lastT > RELEASE_IDLE_MS ? 0 : d.velocity
    const carry = Math.max(-180, Math.min(180, velocity * MOMENTUM_S))
    settleTo(nearestFace(current + carry), velocity)
  }

  useEffect(() => {
    const cancel = () => endDrag(false)
    window.addEventListener('blur', cancel)
    document.addEventListener('visibilitychange', cancel)
    return () => {
      window.removeEventListener('blur', cancel)
      document.removeEventListener('visibilitychange', cancel)
    }
  })

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    settle.current?.stop()
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startAngle: rotate.get(),
      moved: false,
      lastX: e.clientX,
      lastT: e.timeStamp,
      velocity: 0,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId) return
    if (e.buttons === 0) {
      endDrag(false)
      return
    }
    const dx = e.clientX - d.startX
    if (!d.moved) {
      if (Math.abs(dx) < CLICK_SLOP_PX) return
      d.moved = true
      d.startX = e.clientX
      d.lastX = e.clientX
      d.lastT = e.timeStamp
      setDragging(true)
      return
    }
    const dt = e.timeStamp - d.lastT
    if (dt > 0) {
      const instant = ((e.clientX - d.lastX) * DRAG_DEG_PER_PX * 1000) / dt
      d.velocity = d.velocity * 0.3 + instant * 0.7
    }
    d.lastX = e.clientX
    d.lastT = e.timeStamp
    rotate.set(d.startAngle + (e.clientX - d.startX) * DRAG_DEG_PER_PX)
  }

  const handlePointerEnd = (e: PointerEvent<HTMLDivElement>, allowClick: boolean) => {
    if (drag.current?.pointerId !== e.pointerId) return
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    endDrag(allowClick)
  }

  return (
    <div
      className="group relative w-62 shrink-0 md:w-84"
      style={{ aspectRatio: '1 / 1', marginRight: -30, perspective: 800 }}
      onMouseEnter={(e) => updateHover(e.clientX, e.clientY)}
      onMouseMove={(e) => updateHover(e.clientX, e.clientY)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        ref={coinRef}
        className="absolute block select-none"
        style={{
          width: '85%',
          height: '85%',
          top: '5%',
          left: '5%',
          borderRadius: '50%',
          transformStyle: 'preserve-3d',
          rotateY: rotate,
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'pan-y',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => handlePointerEnd(e, true)}
        onPointerCancel={(e) => handlePointerEnd(e, false)}
        onLostPointerCapture={(e) => handlePointerEnd(e, false)}
      >
        <CoinFace side="linkedin" facing={facing === 'linkedin'} showOverlay={showOverlay && facing === 'linkedin'} onTurn={turn} />
        <CoinFace side="github" facing={facing === 'github'} showOverlay={showOverlay && facing === 'github'} onTurn={turn} />
      </motion.div>
    </div>
  )
}
