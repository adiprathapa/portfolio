import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedGradientBackground } from './ui/animated-gradient-background'
import { heroStagger, heroChild } from '../lib/animations'

const LENS_SIZE = 140
const LENS_RADIUS = LENS_SIZE / 2
const MAGNIFY = 1.5

interface WordBreakdown {
  phonetic: string
  meaning: string
}

interface Greeting {
  text: string
  segments: string[]
  subtitle: string
  breakdown: WordBreakdown[]
  showDuoIcon?: boolean
  duoIconSrc?: string
  duoIconLink?: string
}

const greetings: Greeting[] = [
  {
    text: "Hey, I'm Adi",
    segments: ["Hey, ", "I'm ", "Adi"],
    subtitle: 'English (Fluent)',
    breakdown: [
      { phonetic: 'Hey', meaning: 'Hello' },
      { phonetic: "I'm", meaning: 'I am' },
      { phonetic: 'Adi', meaning: 'Adi' },
    ],
  },
  {
    text: 'Hola, soy Adi',
    segments: ['Hola, ', 'soy ', 'Adi'],
    subtitle: 'Spanish (Conversational)',
    showDuoIcon: true,
    duoIconSrc: '/duo.png',
    duoIconLink: 'https://www.duolingo.com/profile/adiP001',
    breakdown: [
      { phonetic: 'Hola', meaning: 'Hello' },
      { phonetic: 'Soy', meaning: 'I am' },
      { phonetic: 'Adi', meaning: 'Adi' },
    ],
  },
  {
    text: 'नमस्ते, मैं आदि हूँ',
    segments: ['नमस्ते, ', 'मैं ', 'आदि ', 'हूँ'],
    subtitle: 'Hindi (Conversational)',
    showDuoIcon: true,
    duoIconSrc: '/duo.png',
    duoIconLink: 'https://www.duolingo.com/profile/adiP001',
    breakdown: [
      { phonetic: 'Namaste', meaning: 'Hello' },
      { phonetic: 'Main', meaning: 'I' },
      { phonetic: 'Ādi', meaning: 'Adi' },
      { phonetic: 'Hoon', meaning: 'Am' },
    ],
  },
  {
    text: 'నమస్కారం, నేను ఆది',
    segments: ['నమస్కారం, ', 'నేను ', 'ఆది'],
    subtitle: 'Telugu (Native)',
    breakdown: [
      { phonetic: 'Namaskāram', meaning: 'Hello' },
      { phonetic: 'Nēnu', meaning: 'I' },
      { phonetic: 'Ādi', meaning: 'Adi' },
    ],
  },
  {
    text: '你好，我是 Adi',
    segments: ['你好，', '我是 ', 'Adi'],
    subtitle: 'Mandarin (Beginner)',
    showDuoIcon: true,
    duoIconSrc: '/nsli.png',
    duoIconLink: 'https://www.virtualbadge.io/certificate-validator?credential=39cfa8cb-56a1-4e8e-be87-b5b67cbd8874',
    breakdown: [
      { phonetic: 'Nǐ hǎo', meaning: 'Hello' },
      { phonetic: 'Wǒ shì', meaning: 'I am' },
      { phonetic: 'Adi', meaning: 'Adi' },
    ],
  },
]

function useTypewriter(
  items: Greeting[],
  paused: boolean,
  typingSpeed = 120,
  deletingSpeed = 60,
  pauseDuration = 2000,
) {
  const [index, setIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [justUnpaused, setJustUnpaused] = useState(false)
  const wasPaused = useRef(false)
  const wasDeletingOnPause = useRef(false)

  useEffect(() => {
    if (paused) {
      wasPaused.current = true
      // If deleting when hovered, switch to retyping
      if (isDeleting) {
        wasDeletingOnPause.current = true
        setIsDeleting(false)
      }
      return
    }
    if (wasPaused.current) {
      wasPaused.current = false
      if (wasDeletingOnPause.current) {
        // Resume deleting when unhovered
        wasDeletingOnPause.current = false
        setWaiting(false)
        setIsDeleting(true)
      } else {
        setJustUnpaused(true)
        const t = setTimeout(() => setJustUnpaused(false), 600)
        return () => clearTimeout(t)
      }
    }
  }, [paused])

  useEffect(() => {
    // When paused and fully retyped (or was waiting), freeze
    if (paused && waiting) return

    if (waiting) {
      const delay = justUnpaused ? 300 : pauseDuration
      const t = setTimeout(() => {
        setWaiting(false)
        setIsDeleting(true)
      }, delay)
      return () => clearTimeout(t)
    }

    const fullText = items[index].text
    const boost = justUnpaused ? 0.5 : 1
    const speed = (isDeleting ? deletingSpeed : typingSpeed) * boost

    const timeout = setTimeout(() => {
      if (isDeleting) {
        const next = displayText.substring(0, displayText.length - 1)
        setDisplayText(next)
        if (next.length === 0) {
          setIsDeleting(false)
          setIndex((prev) => (prev + 1) % items.length)
        }
      } else {
        const next = fullText.substring(0, displayText.length + 1)
        setDisplayText(next)
        if (next.length === fullText.length) {
          setWaiting(true)
        }
      }
    }, speed)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, index, items, typingSpeed, deletingSpeed, pauseDuration, paused, waiting, justUnpaused])

  return { displayText, current: items[index] }
}

export function Hero() {
  const [tooltipActive, setTooltipActive] = useState(false)
  const [headingHovered, setHeadingHovered] = useState(false)
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const { displayText, current } = useTypewriter(greetings, tooltipActive, 120, 60, 2000)

  const renderSegmentedText = (text: string, segments: string[]) => {
    let charCount = 0
    return segments.map((seg, idx) => {
      const start = charCount
      charCount += seg.length
      if (start >= text.length) return null
      const visible = text.substring(start, Math.min(charCount, text.length))
      return (
        <span key={idx} data-word-index={idx}>
          {visible}
        </span>
      )
    })
  }

  // Track tooltip zone via h1 position — dismiss when cursor leaves the zone
  useEffect(() => {
    if (!tooltipActive) return
    const handleMouseMove = (e: MouseEvent) => {
      const hRect = h1Ref.current?.getBoundingClientRect()
      if (!hRect) return
      // Zone: generous box around h1 + tooltip below it
      const pad = 40
      const bottomExtra = 200 // space for tooltip below h1
      const inZone =
        e.clientX >= hRect.left - pad &&
        e.clientX <= hRect.right + pad &&
        e.clientY >= hRect.top - pad &&
        e.clientY <= hRect.bottom + bottomExtra
      if (!inZone) {
        setTooltipActive(false)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [tooltipActive])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ paddingBottom: '20vh' }}
    >
      <AnimatedGradientBackground />

      <motion.div
        className="relative z-10 text-center max-w-4xl px-6"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
      >
        {/* Heading with typewriter */}
        <motion.div
          variants={heroChild}
          className="relative inline-block mb-6"
          onMouseEnter={() => setTooltipActive(true)}
        >
          <h1
            ref={h1Ref}
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-heading tracking-tight"
            style={{ lineHeight: 1.2, minHeight: '2.4em' }}
          >
            <span
              className="text-primary"
              style={{ cursor: headingHovered ? 'none' : undefined }}
              onMouseEnter={() => setHeadingHovered(true)}
              onMouseLeave={() => { setHeadingHovered(false); setHoveredWordIndex(null) }}
              onMouseMove={(e) => {
                setMousePos({ x: e.clientX, y: e.clientY })
                const target = (e.target as HTMLElement).closest('[data-word-index]')
                setHoveredWordIndex(target ? Number(target.getAttribute('data-word-index')) : null)
              }}
            >
              {renderSegmentedText(displayText, current.segments)}
              <span
                className={`ml-0.5 text-primary/60 ${tooltipActive ? 'opacity-100' : 'animate-pulse'}`}
              >
                |
              </span>
            </span>
          </h1>

          {/* Documentation Pop-up */}
          <AnimatePresence>
            {tooltipActive && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute left-1/2 -translate-x-1/2 top-full -mt-10"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 9999,
                }}
              >
                <div className="px-5 pt-2.5 pb-4 whitespace-nowrap">
                  {/* Header row */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center gap-2">
                      {/* Info icon */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-primary shrink-0"
                      >
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M8 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="8" cy="5" r="0.75" fill="currentColor" />
                      </svg>
                      <span
                        className="text-sm font-medium text-heading inline-flex items-center gap-2"
                        style={{ fontFamily: "'Fira Code', monospace" }}
                      >
                        {current.subtitle}
                        {current.showDuoIcon && (
                          <img
                            src={current.duoIconSrc ?? '/images-removebg-preview.png'}
                            alt="Duolingo"
                            onClick={() => current.duoIconLink && window.open(current.duoIconLink, '_blank')}
                            className="cursor-pointer shrink-0 relative -top-0.5 ml-1 hover:animate-[shake_0.4s_ease-in-out]"
                            style={{
                              height: current.duoIconSrc === '/nsli.png' ? 18 : 32,
                              width: 'auto',
                              pointerEvents: 'auto',
                            }}
                          />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Word breakdown */}
                  <div
                    className="flex items-center justify-center text-sm"
                    style={{ fontFamily: "'Fira Code', monospace" }}
                  >
                    {current.breakdown.map((word, i) => (
                      <span key={i} className="flex items-center transition-colors duration-150">
                        {i > 0 && <span className="text-muted mx-2.5 select-none">|</span>}
                        <span className={`font-semibold ${hoveredWordIndex === i ? 'text-primary' : 'text-heading'}`}>{word.phonetic}</span>
                        <span className={`ml-1.5 ${hoveredWordIndex === i ? 'text-primary/70' : 'text-muted'}`}>({word.meaning})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={heroChild}
          className="text-lg md:text-xl text-body mb-10 max-w-md mx-auto"
          style={{
            marginTop: tooltipActive ? '92px' : '-76px',
            transition: 'margin-top 280ms ease',
          }}
        >
          Aditya (Adi) Prathapa is a Computer Science student at Cornell University minoring in AI.
        </motion.p>

      </motion.div>

      {/* Magnifying Lens — scale from cursor point */}
      {headingHovered && (() => {
        const hRect = h1Ref.current?.getBoundingClientRect()
        if (!hRect) return null

        const lensLeft = mousePos.x - LENS_RADIUS
        const lensTop = mousePos.y - LENS_RADIUS

        // h1 position relative to the lens viewport
        const cloneLeft = hRect.left - lensLeft
        const cloneTop = hRect.top - lensTop

        // Transform origin: cursor position within the h1
        const originX = mousePos.x - hRect.left
        const originY = mousePos.y - hRect.top

        return (
          <div
            style={{
              position: 'fixed',
              left: lensLeft,
              top: lensTop,
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
            {/* Text clone — scaled from cursor point */}
            <h1
              className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-heading tracking-tight absolute whitespace-nowrap"
              style={{
                left: cloneLeft,
                top: cloneTop,
                transform: `scale(${MAGNIFY})`,
                transformOrigin: `${originX}px ${originY}px`,
                lineHeight: 1.2,
              }}
            >
              <span className="text-primary">
                {renderSegmentedText(displayText, current.segments)}
                <span className="ml-0.5 text-primary/60">|</span>
              </span>
            </h1>
          </div>
        )
      })()}
    </section>
  )
}
