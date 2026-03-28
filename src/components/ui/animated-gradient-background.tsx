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
  { baseX: 15, baseY: 25, radiusX: 18, radiusY: 14, speed: 0.12, phase: 0, color: 'rgba(6, 113, 164, 0.35)', size: 45 },
  { baseX: 80, baseY: 20, radiusX: 20, radiusY: 16, speed: 0.1, phase: 1.4, color: 'rgba(56, 189, 248, 0.3)', size: 50 },
  { baseX: 25, baseY: 75, radiusX: 16, radiusY: 20, speed: 0.14, phase: 2.8, color: 'rgba(96, 205, 255, 0.28)', size: 48 },
  { baseX: 70, baseY: 65, radiusX: 22, radiusY: 12, speed: 0.09, phase: 4.0, color: 'rgba(6, 113, 164, 0.3)', size: 45 },
  { baseX: 50, baseY: 40, radiusX: 15, radiusY: 18, speed: 0.11, phase: 5.2, color: 'rgba(56, 189, 248, 0.25)', size: 55 },
  { baseX: 90, baseY: 50, radiusX: 14, radiusY: 16, speed: 0.13, phase: 0.6, color: 'rgba(96, 205, 255, 0.22)', size: 50 },
  { baseX: 10, baseY: 50, radiusX: 18, radiusY: 14, speed: 0.1, phase: 3.3, color: 'rgba(6, 113, 164, 0.2)', size: 55 },
]

const blobs2: Blob[] = [
  { baseX: 35, baseY: 30, radiusX: 20, radiusY: 18, speed: 0.13, phase: 1.8, color: 'rgba(56, 189, 248, 0.25)', size: 50 },
  { baseX: 65, baseY: 40, radiusX: 16, radiusY: 20, speed: 0.1, phase: 3.5, color: 'rgba(6, 113, 164, 0.22)', size: 48 },
  { baseX: 20, baseY: 60, radiusX: 18, radiusY: 14, speed: 0.11, phase: 5.0, color: 'rgba(96, 205, 255, 0.2)', size: 52 },
  { baseX: 80, baseY: 75, radiusX: 14, radiusY: 18, speed: 0.14, phase: 0.3, color: 'rgba(56, 189, 248, 0.2)', size: 50 },
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, ease: 'easeOut' }}
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
