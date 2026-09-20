import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Section } from './ui/section'
import { GradientText } from './ui/gradient-text'
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from './ui/icons'
import {
  CARD_GAP,
  CARD_W,
  ExperienceCarouselCard,
  ExperienceMobileCard,
} from './experience/ExperienceCard'
import { useInfiniteCarousel } from './experience/useInfiniteCarousel'
import { experienceEntries, involvement, work, type ExperienceTab } from '../data/experience'
import { COLOR, PRIMARY, SHADOW, SURFACE, TEXT } from '../lib/theme'
import { useInView } from '../hooks/useInView'
import { useTabVisible } from '../hooks/useMediaQuery'

const ROTATION_MS = 7000
const TABS: ExperienceTab[] = ['work', 'involvement']
const TOTAL = experienceEntries.length

/** Round arrow control that floats over the desktop rail. */
function RailArrow({ side, label, onClick, children }: {
  side: 'left' | 'right'
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`absolute ${side === 'left' ? 'left-[16px]' : 'right-[16px]'} top-1/2 z-30 flex -translate-y-1/2 cursor-pointer items-center justify-center`}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: PRIMARY.a25,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${PRIMARY.a30}`,
        color: COLOR.white,
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,113,164,0.45)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = PRIMARY.a25 }}
    >
      {children}
    </button>
  )
}

function MobileArrow({ label, disabled, onClick, children }: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full"
      style={{ backgroundColor: PRIMARY.a10, opacity: disabled ? 0.4 : 1, transition: 'opacity 0.2s' }}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

/**
 * Reads `--mobile-card-inset` (a clamp of vw) as pixels, for the drag math.
 * Returns the inset and the probe element to render.
 */
function useMobileCardInset() {
  const probeRef = useRef<HTMLDivElement>(null)
  const [inset, setInset] = useState(48)

  useEffect(() => {
    const read = () => {
      const width = probeRef.current?.offsetWidth
      if (width && width > 0) setInset(width)
    }
    read()
    window.addEventListener('resize', read)
    const ro = new ResizeObserver(read)
    if (probeRef.current) ro.observe(probeRef.current)
    return () => {
      window.removeEventListener('resize', read)
      ro.disconnect()
    }
  }, [])

  const probe = (
    <div
      ref={probeRef}
      aria-hidden
      style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', height: 1, width: 'var(--mobile-card-inset)' }}
    />
  )

  return { inset, probe }
}

function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 390 : window.innerWidth))
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}

export function Experience() {
  const [activeId, setActiveId] = useState(experienceEntries[0].id)
  const [paused, setPaused] = useState(false)
  const [mobileIdx, setMobileIdx] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  const vw = useViewportWidth()
  const { inset, probe } = useMobileCardInset()
  const rail = useInfiniteCarousel(TOTAL)
  const inView = useInView(sectionRef, { threshold: 0.3 })
  const tabVisible = useTabVisible()

  const displayEntries = useMemo(
    () => Array.from({ length: rail.repeat }, () => experienceEntries).flat(),
    [rail.repeat],
  )

  const activeIdx = Math.max(0, experienceEntries.findIndex((e) => e.id === activeId))
  const isMobileView = vw < 768
  // inset = 2*peek + 2*gap, split so the peek stays visible and the gap subtle.
  const mobileGap = inset / 6
  const mobileStep = vw - inset + mobileGap
  const tab: ExperienceTab = isMobileView
    ? (mobileIdx < work.length ? 'work' : 'involvement')
    : (activeIdx < work.length ? 'work' : 'involvement')

  const stopRotation = useCallback(() => setPaused(true), [])

  const advance = useCallback((delta: 1 | -1) => {
    setActiveId(experienceEntries[(activeIdx + delta + TOTAL) % TOTAL].id)
    rail.step(delta)
  }, [activeIdx, rail])

  const selectCard = useCallback((realIdx: number) => {
    rail.glideTo(realIdx)
    setActiveId(experienceEntries[realIdx].id)
    stopRotation()
  }, [rail, stopRotation])

  const selectTab = useCallback((next: ExperienceTab) => {
    const target = next === 'work' ? work[0] : involvement[0]
    const idx = experienceEntries.findIndex((e) => e.id === target.id)
    if (idx < 0) return
    rail.snapTo(idx)
    setActiveId(target.id)
    setMobileIdx(idx)
    stopRotation()
  }, [rail, stopRotation])

  const running = !paused && inView && tabVisible

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => advance(1), ROTATION_MS)
    return () => clearInterval(id)
  }, [advance, running])

  return (
    <Section
      id="experience"
      className="experience-section"
      style={{
        backgroundColor: SURFACE.page,
        paddingBottom: isMobileView ? 32 : 0,
        marginBottom: isMobileView ? 0 : -48,
      }}
    >
      <div ref={sectionRef}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <GradientText as="h2" className="font-normal" style={{ fontSize: TEXT.h2 }}>Experience</GradientText>
            <p className="mt-3 max-w-2xl leading-relaxed" style={{ color: COLOR.body, fontSize: TEXT.body }}>
              I have experience in software engineering, research, and full stack development.
              Looking for summer 2027 software and AI/ML engineering internship roles.
            </p>
          </div>

          <div
            className="inline-flex shrink-0 items-center self-center p-1.5 md:self-auto"
            style={{ background: PRIMARY.a08, borderRadius: 12, boxShadow: 'inset 0 1px 2px rgba(6, 113, 164, 0.06)' }}
          >
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => selectTab(t)}
                className="relative cursor-pointer px-4 py-2.5 text-base font-semibold md:px-8"
                style={{
                  color: tab === t ? COLOR.white : COLOR.primary,
                  borderRadius: 10,
                  background: tab === t ? COLOR.primary : 'transparent',
                  boxShadow: tab === t ? SHADOW.control : 'none',
                  transition: 'all 0.25s cubic-bezier(.25,.1,.25,1)',
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="carousel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Desktop: full-bleed infinite rail */}
            <div
              className="relative mt-10 hidden md:block"
              style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', overflow: 'hidden' }}
            >
              <RailArrow side="left" label="Previous experience" onClick={() => { advance(-1); stopRotation() }}>
                <ChevronLeftIcon />
              </RailArrow>
              <RailArrow side="right" label="Next experience" onClick={() => { advance(1); stopRotation() }}>
                <ChevronRightIcon />
              </RailArrow>
              <div
                className="flex"
                style={{
                  gap: CARD_GAP,
                  transform: `translateX(calc(max(1.5rem, (100vw - 80rem) / 2) - ${rail.visualIdx * (CARD_W + CARD_GAP)}px))`,
                  transition: rail.skipTransition ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              >
                {displayEntries.map((item, i) => (
                  <ExperienceCarouselCard
                    key={`card-${i}`}
                    item={item}
                    isActive={i === rail.visualIdx}
                    onClick={() => selectCard(i % TOTAL)}
                    paused={!running}
                    rotationMs={ROTATION_MS}
                  />
                ))}
              </div>
            </div>

            {/* Mobile: centered peek carousel with equal side peeks */}
            <div className="mt-10 overflow-hidden md:hidden" style={{ margin: '40px -24px 0' }}>
              {probe}
              <motion.div
                className="flex touch-pan-y"
                style={{ gap: `${mobileGap}px` }}
                drag="x"
                dragElastic={0.2}
                dragMomentum={false}
                dragConstraints={{ left: inset / 2 - (TOTAL - 1) * mobileStep, right: inset / 2 }}
                onDragStart={stopRotation}
                onDragEnd={(_, info) => {
                  const pastThreshold = Math.abs(info.offset.x) > mobileStep / 4 || Math.abs(info.velocity.x) > 400
                  if (!pastThreshold) return
                  const delta = info.offset.x < 0 || info.velocity.x < 0 ? 1 : -1
                  setMobileIdx((current) => Math.min(TOTAL - 1, Math.max(0, current + delta)))
                }}
                animate={{ x: inset / 2 - mobileIdx * mobileStep }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {experienceEntries.map((item, i) => (
                  <div
                    key={item.id}
                    className="shrink-0 cursor-pointer"
                    style={{
                      width: vw - inset,
                      opacity: i === mobileIdx ? 1 : 0.7,
                      transform: i === mobileIdx ? 'scale(1)' : 'scale(0.95)',
                      transition: 'opacity 0.3s, transform 0.3s',
                    }}
                    onClick={() => { if (i !== mobileIdx) setMobileIdx(i) }}
                  >
                    <ExperienceMobileCard item={item} />
                  </div>
                ))}
              </motion.div>

              <div className="mt-9 flex justify-end gap-3 px-4">
                <MobileArrow
                  label="Previous experience"
                  disabled={mobileIdx === 0}
                  onClick={() => setMobileIdx((i) => Math.max(0, i - 1))}
                >
                  <ArrowLeftIcon stroke={COLOR.primary} />
                </MobileArrow>
                <MobileArrow
                  label="Next experience"
                  disabled={mobileIdx === TOTAL - 1}
                  onClick={() => setMobileIdx((i) => Math.min(TOTAL - 1, i + 1))}
                >
                  <ArrowRightIcon stroke={COLOR.primary} />
                </MobileArrow>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Section>
  )
}
