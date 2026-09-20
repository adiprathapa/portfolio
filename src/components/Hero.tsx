import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AnimatedGradientBackground } from './ui/animated-gradient-background'
import { FluidCursor } from './ui/fluid-cursor'
import { LanguageTooltip } from './hero/LanguageTooltip'
import { MagnifierLens } from './hero/MagnifierLens'
import { ProfileCoin } from './hero/ProfileCoin'
import { renderSegments, useTypewriter } from './hero/useTypewriter'
import { greetings } from '../data/greetings'
import { heroChild, heroStagger } from '../lib/animations'
import { posthog } from '../lib/analytics'
import { TEXT } from '../lib/theme'
import { useInView } from '../hooks/useInView'
import { useMediaQuery } from '../hooks/useMediaQuery'

const HEADING_SIZE = 'clamp(2rem, 5vw, 4.5rem)'
/** The tooltip zone extends past the heading so the pointer can reach it. */
const ZONE_PAD = 40
const ZONE_BOTTOM_EXTRA = 200

/** Dismisses the tooltip once the pointer leaves the heading plus its popover. */
function useTooltipDismiss(active: boolean, headingRef: React.RefObject<HTMLElement | null>, dismiss: () => void) {
  useEffect(() => {
    if (!active) return
    const onMouseMove = (e: MouseEvent) => {
      const rect = headingRef.current?.getBoundingClientRect()
      if (!rect) return
      const inZone =
        e.clientX >= rect.left - ZONE_PAD &&
        e.clientX <= rect.right + ZONE_PAD &&
        e.clientY >= rect.top - ZONE_PAD &&
        e.clientY <= rect.bottom + ZONE_BOTTOM_EXTRA
      if (!inZone) dismiss()
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [active, headingRef, dismiss])
}

/** Edge gradient blending the hero into About: sideways on desktop, down on mobile. */
function EdgeFade() {
  const stop = 'var(--color-surface, #EFF3F8)'
  return (
    <>
      <div
        className="pointer-events-none absolute bottom-0 right-0 top-0 z-[5] hidden lg:block"
        style={{ width: '35%', background: `linear-gradient(to right, transparent, ${stop})` }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] lg:hidden"
        style={{ height: '25%', background: `linear-gradient(to bottom, transparent, ${stop})` }}
      />
    </>
  )
}

export function Hero() {
  const prefersReducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const [tooltipActive, setTooltipActive] = useState(false)
  const [headingHovered, setHeadingHovered] = useState(false)
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })

  const isMobile = !useMediaQuery('(min-width: 768px)')
  const effectsActive = useInView(sectionRef, { rootMargin: '120px 0px', threshold: 0.01 })
  const { displayText, current } = useTypewriter(greetings, tooltipActive || !effectsActive)

  useTooltipDismiss(tooltipActive, headingRef, () => setTooltipActive(false))

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-svh items-center justify-center overflow-hidden lg:h-full"
    >
      <AnimatedGradientBackground active={effectsActive} />
      <FluidCursor active={effectsActive && !prefersReducedMotion} />

      <motion.div
        className="relative z-10 flex w-full max-w-5xl flex-col-reverse items-center gap-8 px-6 text-center md:flex-row md:items-center md:gap-12 md:text-left"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
      >
        <div className="min-w-0 flex-1 xl:-ml-5">
          <motion.div
            variants={heroChild}
            className="relative mb-6 inline-block"
            data-nosnippet=""
            onMouseEnter={() => {
              if (isMobile) return
              setTooltipActive(true)
              posthog?.capture('hero_language_tooltip_viewed', { language: current.subtitle })
            }}
          >
            <h1
              ref={headingRef}
              className="whitespace-nowrap font-heading font-bold tracking-tight text-heading"
              style={{ lineHeight: 1.3, minHeight: '2.6em', fontSize: HEADING_SIZE }}
            >
              <span className="sr-only">Aditya (Adi) Prathapa</span>
              <span
                className="text-primary"
                style={{ cursor: headingHovered ? 'none' : undefined }}
                onMouseEnter={() => { if (!isMobile) setHeadingHovered(true) }}
                onMouseLeave={() => { setHeadingHovered(false); setHoveredWordIndex(null) }}
                onMouseMove={(e) => {
                  if (isMobile) return
                  setCursor({ x: e.clientX, y: e.clientY })
                  const word = (e.target as HTMLElement).closest('[data-word-index]')
                  setHoveredWordIndex(word ? Number(word.getAttribute('data-word-index')) : null)
                }}
              >
                {renderSegments(displayText, current.segments)}
                <span className={`ml-0.5 text-primary/60 ${tooltipActive ? 'opacity-100' : 'animate-pulse'}`}>|</span>
              </span>
            </h1>

            <AnimatePresence>
              {tooltipActive && <LanguageTooltip greeting={current} hoveredWordIndex={hoveredWordIndex} />}
            </AnimatePresence>
          </motion.div>

          <motion.p
            variants={heroChild}
            className="mx-auto mb-10 max-w-md text-black md:mx-0"
            style={{
              // Pull the subtitle into the h1's reserved second line, scaled to
              // the heading so tall scripts (Telugu) still clear it on tablets.
              marginTop: isMobile ? '-20px' : tooltipActive ? '92px' : `calc(-0.75 * ${HEADING_SIZE} - 24px)`,
              transition: 'margin-top 280ms ease',
              fontSize: TEXT.body,
            }}
          >
            I'm a Computer Science student at Cornell University minoring in AI, building graph ML and full stack systems.
          </motion.p>
        </div>

        <motion.div variants={heroChild} className="shrink-0">
          <ProfileCoin isMobile={isMobile} />
        </motion.div>
      </motion.div>

      {headingHovered && (
        <MagnifierLens
          headingRef={headingRef}
          cursor={cursor}
          text={displayText}
          greeting={current}
        />
      )}

      <EdgeFade />
    </section>
  )
}
