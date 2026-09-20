import { useCallback, useRef } from 'react'
import { motion, useAnimation, type PanInfo } from 'framer-motion'
import type { PhotoCard } from '../../data/aboutCards'
import { clamp } from '../../lib/math'
import { PRIMARY } from '../../lib/theme'

const COARSE_POINTER = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
/** Below this release speed the card springs back instead of flying off. */
const THROW_SPEED_FLOOR = 300

interface ThrowSample {
  lastTime: number
  lastVx: number
  lastVy: number
  peakSpeed: number
  peakAcceleration: number
}

function emptySample(): ThrowSample {
  return { lastTime: performance.now(), lastVx: 0, lastVy: 0, peakSpeed: 0, peakAcceleration: 0 }
}

/**
 * Converts a drag release into a flight: how hard it felt (release speed, peak
 * speed and peak acceleration) sets the spin and duration, while the distance
 * is at least far enough to clear the viewport edge it is heading for.
 */
function planThrow(info: PanInfo, sample: ThrowSample, rect: DOMRect | undefined) {
  const vx = info.velocity.x
  const vy = info.velocity.y
  const speed = Math.hypot(vx, vy)

  const releaseForce = clamp((speed - THROW_SPEED_FLOOR) / 1800, 0, 1)
  const peakForce = clamp((sample.peakSpeed - THROW_SPEED_FLOOR) / 2600, 0, 1)
  const accelerationForce = clamp((sample.peakAcceleration - 1800) / 22000, 0, 1)
  const throwForce = Math.pow(
    clamp(releaseForce * 0.45 + peakForce * 0.3 + accelerationForce * 0.25, 0, 1),
    0.72,
  )

  const viewportExit = clamp(Math.hypot(window.innerWidth, window.innerHeight) * 0.68, 680, 1300)
  const dirX = vx / speed
  const dirY = vy / speed
  const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
  const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2

  const exitX = dirX > 0 ? (window.innerWidth - centerX) / dirX : dirX < 0 ? -centerX / dirX : Infinity
  const exitY = dirY > 0 ? (window.innerHeight - centerY) / dirY : dirY < 0 ? -centerY / dirY : Infinity
  const toEdge = Math.min(exitX, exitY)
  const clearDistance = Number.isFinite(toEdge)
    ? toEdge + Math.max(rect?.width ?? 400, rect?.height ?? 420)
    : viewportExit

  const distance = Math.max(viewportExit * (0.7 + throwForce * 0.22), clearDistance)

  // Log-scale the release speed so a very hard throw still reads as motion
  // rather than teleporting off screen in one frame.
  const speedFloor = 2000
  const speedCeiling = 100000
  const speedRange = Math.log(clamp(speed, speedFloor, speedCeiling) / speedFloor) / Math.log(speedCeiling / speedFloor)
  const pixelsPerSecond = (620 + Math.pow(speedRange, 0.55) * 2600) * 1.5

  return {
    speed,
    dirX,
    dirY,
    distance,
    duration: clamp(distance / pixelsPerSecond, 0.32, 1.8),
    spin: (vx >= 0 ? 1 : -1) * (7 + throwForce * 24),
  }
}

function backgroundFor(card: PhotoCard, loaded: boolean) {
  if (loaded) {
    return card.topLeftBlue
      ? `linear-gradient(145deg, rgba(6,113,164,0.5) 0%, rgba(56,189,248,0.3) 36%, transparent 65%), url('${card.image}')`
      : `linear-gradient(135deg, rgba(6,113,164,0.3), rgba(56,189,248,0.2), transparent 60%), url('${card.image}')`
  }
  return card.topLeftBlue
    ? 'linear-gradient(145deg, rgba(6,113,164,0.34), rgba(56,189,248,0.22), rgba(6,113,164,0.1))'
    : 'linear-gradient(135deg, rgba(6,113,164,0.22), rgba(56,189,248,0.14), rgba(6,113,164,0.08))'
}

interface ThrowableCardProps {
  card: PhotoCard
  zIndex: number
  imageLoaded: boolean
  onGone: (id: string) => void
  onGrab?: () => void
  onThrowSpeed?: (speed: number) => void
}

export function ThrowableCard({ card, zIndex, imageLoaded, onGone, onGrab, onThrowSpeed }: ThrowableCardProps) {
  const controls = useAnimation()
  const cardRef = useRef<HTMLDivElement>(null)
  const sample = useRef<ThrowSample>(emptySample())
  const { rotation } = card

  const startSampling = useCallback(() => {
    sample.current = emptySample()
    onGrab?.()
  }, [onGrab])

  const sampleMotion = useCallback((_: unknown, info: PanInfo) => {
    const now = performance.now()
    const s = sample.current
    const dt = Math.max((now - s.lastTime) / 1000, 0.016)
    const speed = Math.hypot(info.velocity.x, info.velocity.y)
    const acceleration = Math.hypot(info.velocity.x - s.lastVx, info.velocity.y - s.lastVy) / dt

    s.lastTime = now
    s.lastVx = info.velocity.x
    s.lastVy = info.velocity.y
    s.peakSpeed = Math.max(s.peakSpeed, speed)
    s.peakAcceleration = Math.max(s.peakAcceleration, acceleration)
  }, [])

  const handleDragEnd = useCallback(async (_: unknown, info: PanInfo) => {
    const plan = planThrow(info, sample.current, cardRef.current?.getBoundingClientRect())

    if (plan.speed <= THROW_SPEED_FLOOR) {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } })
      return
    }

    onThrowSpeed?.(Math.round(plan.speed))
    await controls.start({
      x: info.offset.x + plan.dirX * plan.distance,
      y: info.offset.y + plan.dirY * plan.distance,
      rotate: rotation + plan.spin,
      transition: { duration: plan.duration, ease: 'linear' },
    })

    // Re-enter at the back of the stack.
    onGone(card.id)
    controls.set({ x: 0, y: 0, rotate: rotation, scale: 0.95 })
    await controls.start({ opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } })
  }, [controls, card.id, onGone, onThrowSpeed, rotation])

  return (
    <motion.div
      ref={cardRef}
      drag={COARSE_POINTER ? 'x' : true}
      dragDirectionLock={COARSE_POINTER}
      onDragStart={startSampling}
      onDrag={sampleMotion}
      dragElastic={0.8}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ rotate: rotation }}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="group absolute inset-0 cursor-grab overflow-hidden rounded-2xl"
      style={{
        zIndex,
        rotate: rotation,
        ...(COARSE_POINTER ? { touchAction: 'pan-y' as const } : {}),
        border: `1.5px solid ${PRIMARY.a30}`,
        boxSizing: 'border-box',
        backgroundClip: 'padding-box',
        backgroundImage: backgroundFor(card, imageLoaded),
        backgroundSize: card.bgSize ?? 'cover',
        backgroundPosition: card.bgPosition ?? 'center',
        filter: 'saturate(1.3) contrast(1.1) brightness(1.05)',
        transition: 'background-image 0.25s ease',
      }}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 animate-pulse" style={{ background: 'rgba(255, 255, 255, 0.22)' }} />
      )}
      <span className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-gradient-to-t from-[rgba(6,113,164,0.7)] to-transparent px-4 py-3 text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {card.caption}
      </span>
    </motion.div>
  )
}
