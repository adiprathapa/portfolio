import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ProjectStackCard } from './ui/project-stack-card'
import { ArrowIcon } from './ui/icons'
import { Experience } from './Experience'
import { Education } from './Education'
import { featuredProjects, type Project } from '../data/projects'
import { stackCardY } from '../lib/projectStack'
import { posthog } from '../lib/analytics'
import { warmDocument } from '../lib/prefetch'
import { clamp, rootFontSize } from '../lib/math'
import { COLOR, DESKTOP_BP, PRIMARY, SURFACE } from '../lib/theme'
import { useIsMobile } from '../hooks/useMediaQuery'

const cardCount = featuredProjects.length

function StackCard({
  project,
  index,
  cardProgress,
  lastY,
  spacing,
  stagger,
  interactive,
}: {
  project: Project
  index: number
  cardProgress: MotionValue<number>
  lastY: MotionValue<number>
  spacing: number
  stagger: number
  interactive: boolean
}) {
  const yValue = useTransform(cardProgress, (p) => stackCardY(index, p, cardCount, spacing, stagger))
  // Earlier cards disappear once the last card has covered them.
  const hideOpacity = useTransform(lastY, (y) => Number(y > stagger * index))
  // Full size once the card's top reaches the bottom of the previous card (~500px),
  // smallest at 1120px away, linear ramp between
  const scale = useTransform(yValue, (y) => {
    const minScale = 0.85
    const fullSizeAt = 500
    if (y <= fullSizeAt) return 1
    const t = Math.min((y - fullSizeAt) / (1120 - fullSizeAt), 1)
    return 1 - t * (1 - minScale)
  })
  const isLast = index === cardCount - 1

  return (
    <motion.div
      data-project-card={project.slug}
      className="absolute inset-x-0 top-0 w-full origin-bottom"
      style={{
        y: yValue,
        scale,
        zIndex: index + 1,
        ...(isLast ? {} : { opacity: hideOpacity }),
        willChange: 'transform',
      }}
    >
      <ProjectStackCard
        project={project}
        position={index + 1}
        cardHeight="var(--project-stack-card-h)"
        enableBackground
        interactive={interactive}
      />
    </motion.div>
  )
}

function readStickyPtPx() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--project-sticky-pt').trim()
  if (raw.endsWith('vh')) return window.innerHeight * (parseFloat(raw) / 100)
  if (raw.endsWith('rem')) return parseFloat(raw) * rootFontSize()
  return parseFloat(raw) || 0
}

/** Gap between the last card and the Experience heading that follows it. */
const EXPERIENCE_GAP = 96
const FALLBACK_EXPERIENCE_H = 550

function fallbackCardHeight(mobile: boolean) {
  return mobile ? clamp(window.innerHeight * 0.52, 360, 470) : 500
}

/** Vertical distance between consecutive cards in the stack. */
function cardSpacing(cardH: number, mobile: boolean) {
  return mobile ? cardH + Math.round(cardH * 0.15) : cardH + 150
}

/** How far Experience extends past the viewport once the cards have landed. */
function experienceOverflow(cardH: number, experienceH: number) {
  return Math.max(0, readStickyPtPx() + cardH + EXPERIENCE_GAP + experienceH - window.innerHeight)
}

export function Projects({ onPlatformer, platformerActive = false }: { onPlatformer?: () => void; platformerActive?: boolean } = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardHProbeRef = useRef<HTMLDivElement>(null)
  const experienceRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile(true)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [sectionHeight, setSectionHeight] = useState('calc(100dvh + clamp(8rem, 20dvh, 12rem))')

  // Size the sticky rail from the same travel distance the cards animate over,
  // so Experience is never pulled up before the last card has landed.
  useLayoutEffect(() => {
    const compute = () => {
      const mobile = window.innerWidth < DESKTOP_BP
      const cardH = cardHProbeRef.current?.offsetHeight ?? fallbackCardHeight(mobile)
      const travel = cardSpacing(cardH, mobile) * Math.max(0, cardCount - 1)
      const experienceH = experienceRef.current?.offsetHeight ?? FALLBACK_EXPERIENCE_H
      setSectionHeight(`${Math.ceil(window.innerHeight + travel + experienceOverflow(cardH, experienceH))}px`)
    }
    compute()

    // iOS Safari fires resize when the URL bar collapses; recomputing on those
    // scroll-driven resizes causes layout jerks, so only width changes count.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      compute()
    }
    window.addEventListener('resize', onResize)
    const ro = new ResizeObserver(compute)
    if (cardHProbeRef.current) ro.observe(cardHProbeRef.current)
    if (experienceRef.current) ro.observe(experienceRef.current)
    return () => {
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })

  // Recomputed on every render from live layout, which is what keeps the rail
  // in step with the cards as fonts settle and media loads.
  /* eslint-disable react-hooks/refs */
  const cardH = cardHProbeRef.current?.offsetHeight ?? fallbackCardHeight(isMobile)
  const experienceH = experienceRef.current?.offsetHeight ?? FALLBACK_EXPERIENCE_H

  const spacing = cardSpacing(cardH, isMobile)
  // Scale the stagger with the card so mobile matches desktop's 28/500 ratio
  // instead of eating a disproportionate slice of the smaller card.
  const stagger = isMobile ? Math.max(14, Math.round(cardH * 0.056)) : 28
  const overflow = experienceOverflow(cardH, experienceH)
  /* eslint-enable react-hooks/refs */

  // Two-phase scroll over one sticky section: phase 1 stacks the cards, phase 2
  // lifts the whole group so Experience fills the viewport.
  const cardRail = Math.max(0, cardCount - 1) * spacing
  const totalRail = cardRail + overflow
  // Keep phase 1's input range non-empty even with a single card.
  const cardAnimationEnd = clamp(totalRail > 0 ? cardRail / totalRail : 1, 0.0001, 0.9999)

  const cardProgress = useTransform(scrollYProgress, [0, cardAnimationEnd], [0, 1])
  const lastY = useTransform(cardProgress, (p) => stackCardY(cardCount - 1, p, cardCount, spacing, stagger))
  const phase2Offset = useTransform(scrollYProgress, [cardAnimationEnd, 1], [0, -overflow])
  // Both ride the phase-2 wrapper, so their gap to the last card stays constant.
  const experienceInsideY = useTransform(lastY, (y: number) => y + cardH + EXPERIENCE_GAP)
  const seeAllY = useTransform(lastY, (y: number) => y + cardH + 24)

  const [platformerVisible, setPlatformerVisible] = useState(true)
  const [platformerDismissed, setPlatformerDismissed] = useState(false)
  useEffect(() => {
    if (!platformerActive) setPlatformerDismissed(false)
  }, [platformerActive])

  useMotionValueEvent(cardProgress, 'change', (latest) => {
    const nextIndex = clamp(Math.floor(latest * (cardCount - 1) + 0.001), 0, cardCount - 1)
    setActiveCardIndex((current) => (current === nextIndex ? current : nextIndex))
    setPlatformerVisible((current) => {
      const next = latest < 0.012
      return current === next ? current : next
    })
  })

  const warmProjects = () => warmDocument('/projects/')

  return (
    <>
    <div id="projects-rail" ref={containerRef} className="relative" style={{ height: sectionHeight, zIndex: 5, ...(isMobile ? {} : { backgroundColor: SURFACE.tint }) }}>
      <section id="projects" className="sticky top-16 h-[calc(100vh-4rem)] lg:top-0 lg:h-screen pt-[var(--project-sticky-pt)] px-6" style={{ clipPath: `inset(-200px 0px ${isMobile ? '-420px' : '-600px'} 0px)` }}>
        {onPlatformer && (
          <div
            className="pointer-events-none absolute z-[20] mx-auto flex justify-start lg:justify-end max-w-[calc(100vw-var(--mobile-card-inset))] lg:max-w-7xl"
            style={{
              top: 'calc(var(--project-sticky-pt) - 2rem)',
              left: '1.5rem',
              right: '1.5rem',
            }}
          >
            <motion.button
              type="button"
              onClick={(e) => { setPlatformerDismissed(true); onPlatformer(); (e.currentTarget as HTMLButtonElement).blur() }}
              className="pointer-events-auto flex items-center gap-2 text-[10px] lg:text-sm bg-transparent border-0 p-0 cursor-pointer select-none"
              style={{ color: PRIMARY.a75 }}
              animate={{ opacity: platformerVisible && !platformerDismissed ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.svg
                className="size-3 lg:size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                animate={{ y: [0, 3, 0, 3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', times: [0, 0.25, 0.5, 0.75, 1] }}
              >
                <path d="M12 5v14" />
                <path d="M19 12l-7 7-7-7" />
              </motion.svg>
              Platformer
            </motion.button>
          </div>
        )}
        {/* Phase 2 wrapper: scrolls cards + Experience up together after
            the card animation ends, keeping the 48px gap constant. */}
        <motion.div style={{ y: phase2Offset, position: 'relative' }}>
          <div className="relative z-[3]" style={{ maxWidth: isMobile ? 'calc(100vw - var(--mobile-card-inset))' : 1280, marginLeft: 'auto', marginRight: 'auto', height: isMobile ? 'var(--project-stack-card-h)' : 500, overflow: 'visible' }}>
            {featuredProjects.map((project, i) => (
              <StackCard
                key={project.slug}
                project={project}
                index={i}
                cardProgress={cardProgress}
                lastY={lastY}
                spacing={spacing}
                stagger={stagger}
                interactive={i >= activeCardIndex && i <= activeCardIndex + 1}
              />
            ))}
          </div>
          {/* See all projects: rides in the gap under the last card */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
            style={{ y: seeAllY, zIndex: cardCount + 1 }}
          >
            <a
              href="/projects/"
              className="group pointer-events-auto inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[15px] font-medium transition-colors lg:text-base bg-[#0671A4] hover:bg-[#055a84]"
              style={{ color: COLOR.white, border: '2px solid transparent' }}
              onMouseEnter={warmProjects}
              onFocus={warmProjects}
              onTouchStart={warmProjects}
              onClick={() => posthog?.capture('projects_index_link_clicked', { source: 'home_stack_button' })}
            >
              <span>See all projects</span>
              <ArrowIcon />
            </a>
          </motion.div>
          {/* Experience follows the last card; the shared wrapper keeps the gap constant. */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: '-1.5rem',
              right: '-1.5rem',
              y: experienceInsideY,
              zIndex: cardCount + 1,
            }}
          >
            <div ref={experienceRef}>
              <Experience />
            </div>
          </motion.div>
        </motion.div>
        {/* Hidden probe */}
        <div
          ref={cardHProbeRef}
          aria-hidden
          style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            width: 1,
            height: 'var(--project-stack-card-h)',
          }}
        />
      </section>
    </div>
    <div className="relative" style={{ backgroundColor: SURFACE.tint }}>
      <Education />
    </div>
    </>
  )
}
