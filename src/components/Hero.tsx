import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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

interface GreetingIcon {
  src: string
  link: string
  height?: number
}

interface Greeting {
  text: string
  segments: string[]
  subtitle: string
  breakdown: WordBreakdown[]
  icons?: GreetingIcon[]
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
    icons: [
      { src: '/duo.png', link: 'https://www.duolingo.com/profile/adiP001', height: 32 },
      { src: '/nde.png', link: 'https://www.education.ne.gov/press_release/nebraska-students-awarded-seals-of-biliteracy-11/', height: 33 },
    ],
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
    icons: [
      { src: '/duo.png', link: 'https://www.duolingo.com/profile/adiP001', height: 32 },
    ],
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
    icons: [
      { src: '/nsli.png', link: 'https://www.virtualbadge.io/certificate-validator?credential=39cfa8cb-56a1-4e8e-be87-b5b67cbd8874', height: 18 },
    ],
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
  const [coinFlipped, setCoinFlipped] = useState(false)
  const coinHovered = useRef(false)
  const [showCoinOverlay, setShowCoinOverlay] = useState(false)
  const coinOverlayTimer = useRef<ReturnType<typeof setTimeout>>()
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
      className="relative h-full flex items-center justify-center overflow-hidden"
      style={{ paddingBottom: '0' }}
    >
      <AnimatedGradientBackground />

      <motion.div
        className="relative z-10 text-center md:text-left max-w-5xl w-full px-6 flex flex-col-reverse md:flex-row items-center md:items-center gap-8 md:gap-12"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
      >
        <div className="flex-1 min-w-0" style={{ marginLeft: -20 }}>
        {/* Heading with typewriter */}
        <motion.div
          variants={heroChild}
          className="relative inline-block mb-6"
          onMouseEnter={() => setTooltipActive(true)}
        >
          <h1
            ref={h1Ref}
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-heading tracking-tight whitespace-nowrap"
            style={{ lineHeight: 1.3, minHeight: '2.6em', fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
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
                className="absolute left-0 top-full -mt-10"
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
                        {current.icons?.map((icon, i) => (
                          <img
                            key={i}
                            src={icon.src}
                            alt=""
                            onClick={() => window.open(icon.link, '_blank')}
                            className="cursor-pointer shrink-0 relative -top-0.5 ml-0.5 hover:animate-[shake_0.4s_ease-in-out]"
                            style={{
                              height: icon.height ?? 32,
                              width: 'auto',
                              pointerEvents: 'auto',
                            }}
                          />
                        ))}
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
          className="text-lg md:text-xl text-body mb-10 max-w-md mx-auto md:mx-0"
          style={{
            marginTop: tooltipActive ? '92px' : '-76px',
            transition: 'margin-top 280ms ease',
          }}
        >
          Aditya (Adi) Prathapa is a Computer Science student at Cornell University minoring in AI.
        </motion.p>
        </div>

        {/* Profile Coin */}
        <motion.div
          variants={heroChild}
          className="shrink-0 w-62 md:w-84 relative group"
          style={{ aspectRatio: '1 / 1', marginRight: -30, perspective: 800 }}
          onMouseEnter={() => {
            if (coinHovered.current) return
            coinHovered.current = true
            setCoinFlipped(f => !f)
            clearTimeout(coinOverlayTimer.current)
            coinOverlayTimer.current = setTimeout(() => setShowCoinOverlay(true), 0)
          }}
          onMouseLeave={() => {
            coinHovered.current = false
            clearTimeout(coinOverlayTimer.current)
            setShowCoinOverlay(false)
          }}
        >
          <a
            href={coinFlipped ? 'https://github.com/adiprathapa' : 'https://www.linkedin.com/in/adi-prathapa/'}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute block cursor-pointer"
            style={{
              width: '85%',
              height: '85%',
              top: '5%',
              left: '5%',
              borderRadius: '50%',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.3, 1)',
              transform: coinFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front — headshot */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                borderRadius: '50%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: '3px solid #F5F7FA',
                backfaceVisibility: 'hidden',
              }}
            >
              <img
                src="/headshot.jpg"
                alt="Adi Prathapa"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 30%',
                  transform: 'scale(1.1) translateY(-10px)',
                }}
              />
              {/* LinkedIn overlay */}
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.35)',
                  transition: 'opacity 0.15s ease',
                  opacity: showCoinOverlay ? 1 : 0,
                }}
              >
                <svg viewBox="0 0 24 24" fill="white" className="absolute w-6 h-6 md:w-9 md:h-9 drop-shadow-lg" style={{ bottom: 'calc(15% + 10px)', right: 'calc(10% + 11px)' }}>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
            </div>
            {/* Back — pixel cat */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                borderRadius: '50%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: '3px solid #F5F7FA',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <img
                src="/pfp.png"
                alt="GitHub avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* GitHub overlay */}
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.35)',
                  transition: 'opacity 0.3s ease',
                  opacity: showCoinOverlay ? 1 : 0,
                }}
              >
                <svg viewBox="0 0 24 24" fill="white" className="absolute w-8 h-8 md:w-11 md:h-11 drop-shadow-lg" style={{ bottom: 'calc(15% + 10px)', right: 'calc(10% + 5px)' }}>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </div>
            </div>
          </a>
        </motion.div>

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

        return createPortal(
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
          </div>,
          document.body
        )
      })()}

      {/* Right-edge fade into About */}
      <div
        className="absolute top-0 right-0 bottom-0 pointer-events-none z-[5]"
        style={{
          width: '35%',
          background: 'linear-gradient(to right, transparent, var(--color-surface, #EFF3F8))',
        }}
      />
    </section>
  )
}
