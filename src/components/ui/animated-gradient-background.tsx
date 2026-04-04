import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AnimatedGradientBackgroundProps {
  className?: string
}

// Spread-out cloud-like blobs — large, soft, slow drift across the section
interface Blob {
  baseX: number
  baseY: number
  radiusX: number
  radiusY: number
  speed: number
  phase: number
  color: string
  size: number
}

const blobs: Blob[] = [
  { baseX: 15, baseY: 25, radiusX: 40, radiusY: 35, speed: 0.4, phase: 0, color: 'rgba(6, 113, 164, 0.45)', size: 45 },
  { baseX: 80, baseY: 20, radiusX: 45, radiusY: 35, speed: 0.35, phase: 1.4, color: 'rgba(56, 189, 248, 0.4)', size: 50 },
  { baseX: 25, baseY: 75, radiusX: 35, radiusY: 45, speed: 0.45, phase: 2.8, color: 'rgba(96, 205, 255, 0.38)', size: 48 },
  { baseX: 70, baseY: 65, radiusX: 45, radiusY: 30, speed: 0.3, phase: 4.0, color: 'rgba(6, 113, 164, 0.4)', size: 45 },
  { baseX: 50, baseY: 40, radiusX: 38, radiusY: 42, speed: 0.38, phase: 5.2, color: 'rgba(56, 189, 248, 0.35)', size: 55 },
  { baseX: 90, baseY: 50, radiusX: 35, radiusY: 40, speed: 0.42, phase: 0.6, color: 'rgba(96, 205, 255, 0.32)', size: 50 },
  { baseX: 10, baseY: 50, radiusX: 42, radiusY: 35, speed: 0.35, phase: 3.3, color: 'rgba(6, 113, 164, 0.3)', size: 55 },
]

const blobs2: Blob[] = [
  { baseX: 35, baseY: 30, radiusX: 42, radiusY: 38, speed: 0.42, phase: 1.8, color: 'rgba(56, 189, 248, 0.35)', size: 50 },
  { baseX: 65, baseY: 40, radiusX: 36, radiusY: 44, speed: 0.35, phase: 3.5, color: 'rgba(6, 113, 164, 0.32)', size: 48 },
  { baseX: 20, baseY: 60, radiusX: 40, radiusY: 34, speed: 0.38, phase: 5.0, color: 'rgba(96, 205, 255, 0.3)', size: 52 },
  { baseX: 80, baseY: 75, radiusX: 34, radiusY: 42, speed: 0.45, phase: 0.3, color: 'rgba(56, 189, 248, 0.3)', size: 50 },
]

function buildGradient(blobList: Blob[], t: number, base?: string) {
  const parts = blobList.map((b) => {
    const x = b.baseX + Math.sin(t * b.speed + b.phase) * b.radiusX
    const y = b.baseY + Math.cos(t * b.speed * 0.7 + b.phase + 0.5) * b.radiusY
    return `radial-gradient(ellipse at ${x}% ${y}%, ${b.color} 0%, transparent ${b.size}%)`
  })
  if (base) parts.push(base)
  return parts.join(', ')
}

export function AnimatedGradientBackground({ className = '' }: AnimatedGradientBackgroundProps) {
  const layer1Ref = useRef<HTMLDivElement>(null)
  const layer2Ref = useRef<HTMLDivElement>(null)
  const rafId = useRef<number>(0)

  useEffect(() => {
    const tick = () => {
      const t = performance.now() / 1000

      if (layer1Ref.current) {
        layer1Ref.current.style.background = buildGradient(
          blobs,
          t,
          'linear-gradient(135deg, #eef6fb 0%, #e0f2fe 50%, #f0f9ff 100%)',
        )
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.background = buildGradient(blobs2, t)
      }

      rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [])

  return (
    <motion.div
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <div
        ref={layer1Ref}
        className="absolute inset-0"
      />
      <div
        ref={layer2Ref}
        className="absolute inset-0"
      />
    </motion.div>
  )
}
