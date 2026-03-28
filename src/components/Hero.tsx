import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedGradientBackground } from './ui/animated-gradient-background'
import { heroStagger, heroChild } from '../lib/animations'

const LENS_SIZE = 200
const LENS_RADIUS = LENS_SIZE / 2
const MAGNIFY = 1.5

interface WordBreakdown {
  phonetic: string
  meaning: string
}

interface Greeting {
  text: string
  subtitle: string
  breakdown: WordBreakdown[]
  showDuoIcon?: boolean
  duoIconSrc?: string
}

const greetings: Greeting[] = [
  {
    text: "Hey, I'm Adi",
    subtitle: 'English (Fluent)',
    breakdown: [
      { phonetic: 'Hey', meaning: 'Hello' },
      { phonetic: "I'm", meaning: 'I am' },
      { phonetic: 'Adi', meaning: 'Adi' },
    ],
  },
  {
    text: 'Hola, soy Adi',
    subtitle: 'Spanish (Conversational)',
    showDuoIcon: true,
    duoIconSrc: '/duo.png',
    breakdown: [
      { phonetic: 'Hola', meaning: 'Hello' },
      { phonetic: 'Soy', meaning: 'I am' },
      { phonetic: 'Adi', meaning: 'Adi' },
    ],
  },
  {
    text: 'नमस्ते, मैं आदि हूँ',
    subtitle: 'Hindi (Conversational)',
    showDuoIcon: true,
    duoIconSrc: '/duo.png',
    breakdown: [
      { phonetic: 'Namaste', meaning: 'Hello' },
      { phonetic: 'Main', meaning: 'I' },
      { phonetic: 'Ādi', meaning: 'Adi' },
      { phonetic: 'Hoon', meaning: 'Am' },
    ],
  },
  {
    text: 'నమస్కారం, నేను ఆది',
    subtitle: 'Telugu (Native)',
    breakdown: [
      { phonetic: 'Namaskāram', meaning: 'Hello' },
      { phonetic: 'Nēnu', meaning: 'I' },
      { phonetic: 'Ādi', meaning: 'Adi' },
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

  useEffect(() => {
    if (paused) {
      wasPaused.current = true
      return
    }
    if (wasPaused.current) {
      wasPaused.current = false
      setJustUnpaused(true)
      const t = setTimeout(() => setJustUnpaused(false), 600)
      return () => clearTimeout(t)
    }
  }, [paused])

  useEffect(() => {
    // When paused (hovered), still finish typing the current word but don't delete or cycle
    if (paused && (isDeleting || waiting)) return

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
  const [logoHovered, setLogoHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)
  const { displayText, current } = useTypewriter(greetings, tooltipActive, 120, 60, 2000)

  const getSectionRect = useCallback(() => {
    return sectionRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 }
  }, [])

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
        onMouseEnter={() => setTooltipActive(true)}
        onMouseLeave={() => {
          setTooltipActive(false)
          setHeadingHovered(false)
        }}
      >
        {/* Heading with typewriter */}
        <motion.div
          variants={heroChild}
          className="relative inline-block mb-6"
          onMouseEnter={() => {
            setTooltipActive(true)
            setHeadingHovered(true)
          }}
          onMouseLeave={() => setHeadingHovered(false)}
          onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
          style={{ cursor: headingHovered ? 'none' : undefined }}
        >
          <h1
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-heading tracking-tight"
            style={{ lineHeight: 1.2, minHeight: '2.4em' }}
          >
            <span className="text-primary">
              {displayText}
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
                className="absolute left-1/2 -translate-x-1/2 top-full mt-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: 9999,
                  pointerEvents: 'none',
                }}
              >
                <div className="px-5 py-4 whitespace-nowrap">
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
                            onClick={() => window.open('https://www.duolingo.com/profile/adiP001', '_blank')}
                            onMouseEnter={() => setLogoHovered(true)}
                            onMouseLeave={() => setLogoHovered(false)}
                            className="cursor-pointer shrink-0 relative -top-0.5 transition-all duration-300"
                            style={{
                              height: logoHovered ? '40px' : '32px',
                              width: 'auto',
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
                      <span key={i} className="flex items-center">
                        {i > 0 && <span className="text-muted mx-2.5 select-none">|</span>}
                        <span className="font-semibold text-heading">{word.phonetic}</span>
                        <span className="text-muted ml-1.5">({word.meaning})</span>
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
          Software engineer crafting thoughtful digital experiences.
        </motion.p>

      </motion.div>

      {/* Magnifying Lens — shows a 1.5× scaled copy of the hero content */}
      {headingHovered && (() => {
        const rect = getSectionRect()
        const relX = mousePos.x - rect.left
        const relY = mousePos.y - rect.top
        return (
          <div
            style={{
              position: 'fixed',
              left: mousePos.x - LENS_RADIUS,
              top: mousePos.y - LENS_RADIUS,
              width: LENS_SIZE,
              height: LENS_SIZE,
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 30px rgba(255, 255, 255, 0.1)',
              background: '#e8f1f8',
              overflow: 'hidden',
              pointerEvents: 'none',
              zIndex: 50,
            }}
          >
            {/* Scaled clone of hero content */}
            <div
              style={{
                position: 'absolute',
                left: -relX * MAGNIFY + LENS_RADIUS,
                top: -relY * MAGNIFY + LENS_RADIUS,
                width: rect.width,
                height: rect.height,
                transform: `scale(${MAGNIFY})`,
                transformOrigin: '0 0',
              }}
            >
              {/* Gradient background clone */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute inset-0 animate-breathe"
                  style={{
                    background: `
                      radial-gradient(ellipse at 20% 50%, rgba(6, 113, 164, 0.3) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 20%, rgba(56, 189, 248, 0.25) 0%, transparent 50%),
                      radial-gradient(ellipse at 40% 80%, rgba(6, 113, 164, 0.2) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 60%, rgba(56, 189, 248, 0.15) 0%, transparent 40%),
                      linear-gradient(135deg, #eef6fb 0%, #e0f2fe 50%, #f0f9ff 100%)
                    `,
                  }}
                />
                <div
                  className="absolute inset-0 animate-breathe"
                  style={{
                    animationDelay: '4s',
                    background: `
                      radial-gradient(ellipse at 60% 30%, rgba(56, 189, 248, 0.2) 0%, transparent 50%),
                      radial-gradient(ellipse at 30% 70%, rgba(6, 113, 164, 0.15) 0%, transparent 50%)
                    `,
                  }}
                />
              </div>
              {/* Text clone */}
              <div
                className="relative z-10 flex items-center justify-center"
                style={{ width: rect.width, height: rect.height, paddingBottom: '20vh' }}
              >
                <div className="text-center max-w-4xl px-6">
                  <div className="inline-block mb-6">
                    <h1
                      className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-heading tracking-tight"
                      style={{ lineHeight: 1.2, minHeight: '2.4em' }}
                    >
                      <span className="text-primary">
                        {displayText}
                        <span className="ml-0.5 text-primary/60">|</span>
                      </span>
                    </h1>
                  </div>
                  <p
                    className="text-lg md:text-xl text-body mb-10 max-w-md mx-auto"
                    style={{ marginTop: '92px' }}
                  >
                    Software engineer crafting thoughtful digital experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </section>
  )
}
