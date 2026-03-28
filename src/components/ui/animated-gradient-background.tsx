import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AnimatedGradientBackgroundProps {
  className?: string
}

interface MeshBlob {
  baseX: number
  baseY: number
  radiusX: number
  radiusY: number
  speed: number
  phase: number
  color: string
  size: number
}

const meshBlobs: MeshBlob[] = [
  { baseX: 10, baseY: 20, radiusX: 20, radiusY: 16, speed: 0.10, phase: 0,   color: 'rgba(6, 113, 164, 0.55)',  size: 65 },
  { baseX: 75, baseY: 15, radiusX: 22, radiusY: 18, speed: 0.08, phase: 1.4, color: 'rgba(56, 189, 248, 0.50)',  size: 70 },
  { baseX: 30, baseY: 70, radiusX: 18, radiusY: 22, speed: 0.12, phase: 2.8, color: 'rgba(96, 205, 255, 0.45)',  size: 60 },
  { baseX: 65, baseY: 60, radiusX: 24, radiusY: 14, speed: 0.07, phase: 4.0, color: 'rgba(14, 165, 233, 0.40)',  size: 65 },
  { baseX: 45, baseY: 35, radiusX: 16, radiusY: 20, speed: 0.09, phase: 5.2, color: 'rgba(139, 92, 246, 0.25)',  size: 55 },
  { baseX: 85, baseY: 45, radiusX: 18, radiusY: 16, speed: 0.11, phase: 0.6, color: 'rgba(56, 189, 248, 0.45)',  size: 60 },
  { baseX: 20, baseY: 45, radiusX: 20, radiusY: 18, speed: 0.09, phase: 3.3, color: 'rgba(6, 113, 164, 0.45)',   size: 70 },
]

export function AnimatedGradientBackground({ className = '' }: AnimatedGradientBackgroundProps) {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafId = useRef<number>(0)

  useEffect(() => {
    const tick = () => {
      const t = performance.now() / 1000

      meshBlobs.forEach((b, i) => {
        const el = blobRefs.current[i]
        if (!el) return
        const x = Math.sin(t * b.speed + b.phase) * b.radiusX
        const y = Math.cos(t * b.speed * 0.7 + b.phase + 0.5) * b.radiusY
        const scale = 1 + 0.15 * Math.sin(t * b.speed * 0.5 + b.phase * 2)
        el.style.transform = `translate(${x}%, ${y}%) scale(${scale})`
      })

      rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [])

  return (
    <motion.div
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Static base gradient */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #eef6fb 0%, #e0f2fe 50%, #f0f9ff 100%)' }}
      />

      {/* SVG gooey filter definition */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden>
        <defs>
          <filter id="mesh-goo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Blob container with gooey filter */}
      <div
        className="absolute inset-0"
        style={{ filter: 'url(#mesh-goo)' }}
      >
        {meshBlobs.map((b, i) => (
          <div
            key={i}
            ref={(el) => { blobRefs.current[i] = el }}
            style={{
              position: 'absolute',
              left: `${b.baseX - b.size / 2}%`,
              top: `${b.baseY - b.size / 2}%`,
              width: `${b.size}%`,
              height: `${b.size}%`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
