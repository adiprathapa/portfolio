import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Section } from './ui/section'
import { GradientText } from './ui/gradient-text'

/* ── Stripe-inspired shadow ───────────────────────────────── */
const SHADOW = {
  sm: '0 2px 5px -1px rgba(50,50,93,0.25), 0 1px 3px -1px rgba(0,0,0,0.3)',
}

/* ── Types ─────────────────────────────────────────────────── */
interface ExperienceItem {
  id: string
  company: string
  role: string
  duration: string
  description: string
  bullets?: string[]
  tech: { name: string; icon: string }[]
  logo: string
  logoHeight: number
  logoInvert?: boolean
  logoOffsetY?: number
  logoOffsetX?: number
  mobileLogoOffsetX?: number
  mobileLogoOffsetY?: number
  bgImage: string
  gradientColor: string
}

/* ── Data ──────────────────────────────────────────────────── */
const work: ExperienceItem[] = [
  {
    id: 'mitre',
    company: 'MITRE',
    role: 'Data Science Intern',
    duration: 'May — August 2026',
    description:
      'Graph learning on cyber event data with PyTorch Geometric',
    bullets: [
      'Built PyTorch Geometric graph learning workflows using GINEConv to model cyber event relationships',
      'Applied Optuna based hyperparameter optimization across model architecture and training parameters',
      'Refactored a legacy training codebase into modular scripts and built an end to end pipeline testing suite',
    ],
    tech: [
      { name: 'PyTorch Geometric', icon: '/icons/pytorch.svg' },
      { name: 'Optuna', icon: '' },
    ],
    logo: '/mitre.png',
    logoHeight: 91,
    logoInvert: true,
    logoOffsetY: -25,
    mobileLogoOffsetX: -62,
    mobileLogoOffsetY: -22,
    bgImage: '/pexels-pinamon-17647329.webp',
    gradientColor: '#0671A4',
  },
  {
    id: 'cornell',
    company: 'Cornell Bowers CIS',
    role: 'CSMore Intern',
    duration: 'January 2026',
    description:
      'Implemented modular class designs, data structures, and algorithms',
    bullets: [
      'Developed modular Java applications using object-oriented design patterns, inheritance hierarchies, and encapsulation',
      'Implemented and benchmarked linked lists, trees, hash maps, and graphs, analyzing time and space complexity tradeoffs',
      'Traced execution across multi-class architectures and profiled runtime behavior to debug and resolve bottlenecks',
    ],
    tech: [
      { name: 'Java', icon: '/icons/openjdk.svg' },
      { name: 'JUnit', icon: '/icons/junit5.svg' },
    ],
    logo: '/cornell.svg',
    logoHeight: 44,
    logoInvert: true,
    bgImage: '/bowers.webp',
    gradientColor: '#B31B1B',
  },
  {
    id: 'mines',
    company: 'Colorado School of Mines',
    role: 'Software Engineering Intern',
    duration: 'June — July 2024',
    description:
      'Built an AI chatbot and tools to improve access to cybersecurity resources',
    bullets: [
      'Built an AI-powered chatbot module enabling real-time natural language question answering on a cybersecurity platform',
      'Developed an interactive cybersecurity education site with phishing detection simulations using JavaScript, HTML, and CSS',
      'Iterated rapidly through weekly prototyping cycles, prioritizing user experience, accessibility compliance, and product clarity',
    ],
    tech: [
      { name: 'OpenAI API', icon: '/icons/chatbot.svg' },
      { name: 'JavaScript', icon: '/icons/javascript.svg' },
    ],
    logo: '/mines.png',
    logoHeight: 44,
    logoInvert: true,
    logoOffsetY: 0,
    mobileLogoOffsetX: -42,
    bgImage: '/mines-bg.webp',
    gradientColor: '#21314D',
  },
  {
    id: 'neb',
    company: 'University of Nebraska–Lincoln',
    role: 'Physics Research Assistant',
    duration: 'June — August 2023',
    description:
      'Data visualization through 3D printing for Bohmian trajectories',
    bullets: [
      'Created Python simulation programs to model Bohmian trajectories and visualize quantum behavior using scikit-learn',
      'Produced 3D printed models from simulation data using Matplotlib visualizations to support educational demonstrations',
      'Presented findings at the Nebraska Summer Research Symposium after biweekly reviews with professor to refine methodology',
    ],
    tech: [
      { name: 'scikit-learn', icon: '/icons/scikitlearn.svg' },
      { name: 'Python', icon: '/icons/python.svg' },
    ],
    logo: '/neb.png',
    logoHeight: 42,
    logoInvert: true,
    logoOffsetY: -1,
    logoOffsetX: -12,
    mobileLogoOffsetX: -74,
    bgImage: '/unl-bg.webp',
    gradientColor: '#D00000',
  },
]

const involvement: ExperienceItem[] = [
  {
    id: 'cds',
    company: 'Cornell Data & Strategy',
    role: 'Technology Implementation Associate',
    duration: 'September 2025 — Present',
    description:
      'Delivering data prediction and visualization tools to clients',
    bullets: [],
    tech: [
      { name: 'Redis', icon: '/icons/redis.svg' },
      { name: 'PostgreSQL', icon: '/icons/postgresql.svg' },
    ],
    logo: '/logodsa.png',
    logoHeight: 79,
    logoInvert: true,
    logoOffsetY: -16,
    mobileLogoOffsetX: -61,
    mobileLogoOffsetY: -17,
    bgImage: '/cornell-data-strategy.webp',
    gradientColor: '#1C3D6B',
  },
  {
    id: 'c2s2',
    company: 'Cornell Custom Silicon Systems',
    role: 'Operations Engineer',
    duration: 'November 2025 — Present',
    description:
      'Migrated the team site to React and deploy web apps to Apache for a student led chip tapeout team',
    bullets: [],
    tech: [
      { name: 'React', icon: '/icons/react.svg' },
      { name: 'Apache HTTP Server', icon: '/icons/apache.svg' },
    ],
    logo: '/c2s2logo.png',
    logoHeight: 72,
    logoInvert: true,
    logoOffsetY: -6,
    logoOffsetX: -4,
    mobileLogoOffsetX: -72,
    mobileLogoOffsetY: -8,
    bgImage: '/c2s2.webp',
    gradientColor: '#B31B1B',
  },
  {
    id: 'ambassador',
    company: 'Cornell Arts & Sciences',
    role: 'Ambassador',
    duration: 'Fall 2025 — Present',
    description:
      'Representing the College of Arts & Sciences to prospective students and families',
    bullets: [],
    tech: [],
    logo: '/aslogo.png',
    logoHeight: 91,
    logoInvert: true,
    logoOffsetX: -8,
    logoOffsetY: -14,
    mobileLogoOffsetX: -21,
    mobileLogoOffsetY: -15,
    bgImage: '/cas.webp',
    gradientColor: '#6B1D2A',
  },
]

/* ── Card dimensions ──────────────────────────────────────── */
const CARD_W = 580
const CARD_H = 560
const GAP = 24

function TechLabel({ src, name, size }: { src: string; name: string; size: number }) {
  const [errored, setErrored] = useState(false)
  const showIcon = Boolean(src) && !errored

  return (
    <div className="flex items-center" style={{ gap: showIcon ? 6 : 0 }}>
      {showIcon ? (
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="object-contain"
          loading="lazy"
          decoding="async"
          style={{ filter: 'brightness(0) invert(1)', opacity: 0.85 }}
          onError={(event) => {
            setErrored(true)
            event.currentTarget.style.display = 'none'
          }}
        />
      ) : null}
      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{name}</span>
    </div>
  )
}

/* ── Carousel card ────────────────────────────────────────── */

function CarouselCard({
  item,
  isActive,
  onClick,
  paused,
}: {
  item: ExperienceItem
  isActive: boolean
  onClick: () => void
  paused: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden cursor-pointer"
      style={{
        width: CARD_W,
        height: CARD_H,
        flexShrink: 0,
        borderRadius: 20,
        border: '1.5px solid rgba(6, 113, 164, 0.3)',
        boxShadow: hovered || isActive
          ? '0 16px 48px rgba(6, 113, 164, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)'
          : '0 4px 12px rgba(0, 0, 0, 0.04)',
        opacity: isActive ? 1 : 0.92,
        transition: 'opacity 0.4s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Background image — zooms on hover for both active and inactive */}
      <img
        src={item.bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: isActive || hovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      />

      {/* Gradient overlay — heavier on active for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: isActive
            ? `linear-gradient(
                180deg,
                ${item.gradientColor}73 0%,
                ${item.gradientColor}D0 55%,
                ${item.gradientColor}F5 100%
              )`
            : `linear-gradient(
                180deg,
                ${item.gradientColor}50 0%,
                ${item.gradientColor}A0 55%,
                ${item.gradientColor}DD 100%
              )`,
          transition: 'background 0.5s ease',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-7">
        {/* Logo — top-left */}
        <img
          src={item.logo}
          alt={item.company}
          style={{
            height: item.logoHeight * 0.8,
            width: 'auto',
            maxWidth: '55%',
            objectFit: 'contain',
            filter: item.logoInvert
              ? 'brightness(0) invert(1)'
              : 'none',
            borderRadius: item.logoInvert ? 0 : 8,
            alignSelf: 'flex-start',
            marginTop: item.logoOffsetY ?? 0,
            marginLeft: item.logoOffsetX ?? 0,
          }}
        />

        {/* Bottom content */}
        <div>
          {isActive ? (
            <motion.div
              key={`active-${item.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
            >
              <p
                className="text-sm font-medium tracking-wide uppercase"
                style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}
              >
                {item.duration}
              </p>
              <h3
                className="font-semibold mt-1.5 leading-snug"
                style={{ color: '#FFFFFF', textShadow: '0 1px 4px rgba(0,0,0,0.3)', fontSize: 'clamp(1.125rem, 0.75vw + 0.75rem, 1.5rem)' }}
              >
                {item.role}
              </h3>
              <p
                className="mt-2.5 leading-relaxed"
                style={{
                  color: 'rgba(255,255,255,0.88)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)',
                }}
              >
                {item.description}
              </p>
              {/* Tech stack */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {item.tech.map((t) => (
                  <div key={t.name} className="text-xs">
                    <TechLabel src={t.icon} name={t.name} size={16} />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div>
              <p
                className="leading-relaxed"
                style={{
                  color: 'rgba(255,255,255,0.88)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)',
                }}
              >
                {item.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timer bar on active card */}
      {isActive && !paused && (
        <div
          className="absolute bottom-0 left-0 right-0 z-20"
          style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: '0 0 20px 20px' }}
        >
          <motion.div
            key={item.id}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: (ROTATION_INTERVAL - 300) / 1000, ease: 'linear' }}
            style={{ height: '100%', background: 'rgba(255,255,255,0.65)', borderRadius: '0 0 0 20px' }}
          />
        </div>
      )}
    </div>
  )
}

/* ── Mobile card ──────────────────────────────────────────── */

function MobileCard({ item }: { item: ExperienceItem }) {
  return (
    <div
      className="relative w-full"
      style={{ height: 'var(--project-card-h)' }}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: 20,
          border: '1.5px solid rgba(6, 113, 164, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
        }}
      >
        <img src={item.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${item.gradientColor}73 0%, ${item.gradientColor}D0 55%, ${item.gradientColor}F5 100%)`,
          }}
        />
        <div className="relative z-10 h-full flex flex-col justify-between p-7">
          <img
            src={item.logo}
            alt={item.company}
            className="self-start"
            style={{
              height: item.logoHeight * 0.8,
              width: 'auto',
              maxWidth: '55%',
              objectFit: 'contain',
              filter: item.logoInvert
                ? 'brightness(0) invert(1)'
                : 'none',
              borderRadius: item.logoInvert ? 0 : 8,
              marginTop: item.logoOffsetY ?? 0,
              marginLeft: item.logoOffsetX ?? 0,
            }}
          />
          <div>
            {item.duration && (
              <p
                className="text-[10px] font-medium tracking-wide uppercase"
                style={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em' }}
              >
                {item.duration}
              </p>
            )}
            <h3
              className="text-[16px] font-semibold mt-1 leading-snug"
              style={{ color: '#FFFFFF', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
            >
              {item.role}
            </h3>
            <p
              className="text-[13px] leading-[1.3] mt-2"
              style={{
                color: 'rgba(255,255,255,0.88)',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              {item.description}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {item.tech.map((t) => (
                <div key={t.name} className="text-[10px]">
                  <TechLabel src={t.icon} name={t.name} size={14} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ────────────────────────────────────────── */

const ROTATION_INTERVAL = 7000

export function Experience() {
  // Carousel: work → involvement
  const allEntries = [...work, ...involvement]

  const [activeId, setActiveId] = useState('mitre')
  const [, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const [mobileCarouselIdx, setMobileCarouselIdx] = useState(0)
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 390)
  const [insetPx, setInsetPx] = useState(48)
  const [isVisible, setIsVisible] = useState(false)
  const [tabVisible, setTabVisible] = useState(!document.hidden)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const sectionRef = useRef<HTMLDivElement>(null)
  const desktopTrackRef = useRef<HTMLDivElement>(null)
  const total = allEntries.length
  const REPEAT = 7
  const baseOffset = total * Math.floor(REPEAT / 2)
  const [visualIdx, setVisualIdx] = useState(() => baseOffset)
  const [skipTransition, setSkipTransition] = useState(false)
  // Hidden probe used to resolve --mobile-card-inset (a clamp() of vw) into
  // a pixel value for the drag/animate math.
  const insetProbeRef = useRef<HTMLDivElement>(null)

  const displayEntries = useMemo(
    () => Array.from({ length: REPEAT }, () => allEntries).flat(),
    [REPEAT, allEntries],
  )

  const getNearestVisualIdx = useCallback((realIdx: number) => {
    if (total === 0) return baseOffset
    let best = baseOffset + realIdx
    let bestDist = Math.abs(best - visualIdx)
    for (let lane = 0; lane < REPEAT; lane += 1) {
      const candidate = realIdx + total * lane
      const dist = Math.abs(candidate - visualIdx)
      if (dist < bestDist) {
        best = candidate
        bestDist = dist
      }
    }
    return best
  }, [REPEAT, baseOffset, total, visualIdx])

  useEffect(() => {
    if (total === 0) return
    const min = total
    const max = total * (REPEAT - 1)
    if (visualIdx <= min) {
      setSkipTransition(true)
      setVisualIdx((prev) => prev + total * 2)
      requestAnimationFrame(() => requestAnimationFrame(() => setSkipTransition(false)))
      return
    }
    if (visualIdx >= max) {
      setSkipTransition(true)
      setVisualIdx((prev) => prev - total * 2)
      requestAnimationFrame(() => requestAnimationFrame(() => setSkipTransition(false)))
    }
  }, [REPEAT, total, visualIdx])

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth)
    const readInset = () => {
      const w = insetProbeRef.current?.offsetWidth
      if (w && w > 0) setInsetPx(w)
    }
    readInset()
    window.addEventListener('resize', onResize)
    window.addEventListener('resize', readInset)
    const ro = new ResizeObserver(readInset)
    if (insetProbeRef.current) ro.observe(insetProbeRef.current)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('resize', readInset)
      ro.disconnect()
    }
  }, [])

  // inset = 2*peek + 2*gap, split so peek (inset/3) is visible and gap
  // (inset/6) stays subtle — matches the layout documented in index.css.
  const mobileCardGap = insetPx / 6

  const activeIdx = Math.max(0, allEntries.findIndex((e) => e.id === activeId))
  const active = allEntries[activeIdx]

  // Derive which tab is active
  const isMobileView = vw < 768
  const tab: 'work' | 'involvement' = isMobileView
    ? (mobileCarouselIdx < work.length ? 'work' : 'involvement')
    : (activeIdx < work.length ? 'work' : 'involvement')


  const activeOffset = visualIdx * (CARD_W + GAP)

  const navigateTo = useCallback(
    (id: string) => {
      const currentIdx = allEntries.findIndex((e) => e.id === activeId)
      const nextIdx = allEntries.findIndex((e) => e.id === id)
      setDirection(nextIdx >= currentIdx ? 1 : -1)
      setActiveId(id)
    },
    [allEntries, activeId],
  )

  const handleTabClick = useCallback(
    (t: 'work' | 'involvement') => {
      const target = t === 'work' ? work[0] : involvement[0]
      if (target) {
        const idx = allEntries.findIndex(e => e.id === target.id)
        // Direct jump (not a wrap), so set visualIdx explicitly
        setSkipTransition(true)
        if (idx >= 0) setVisualIdx(baseOffset + idx)
        requestAnimationFrame(() => requestAnimationFrame(() => setSkipTransition(false)))
        navigateTo(target.id)
        if (idx >= 0) setMobileCarouselIdx(idx)
        if (timerRef.current) clearInterval(timerRef.current)
        setPaused(true)
      }
    },
    [navigateTo, allEntries],
  )

  const advanceToNext = useCallback(() => {
    if (allEntries.length === 0) return
    const nextIdx = (activeIdx + 1) % allEntries.length
    setDirection(1)
    setActiveId(allEntries[nextIdx].id)
    setVisualIdx((prev) => {
      const next = prev + 1
      return next
    })
  }, [activeIdx, allEntries])

  const navigateToPrev = useCallback(() => {
    if (allEntries.length === 0) return
    const prevIdx = (activeIdx - 1 + allEntries.length) % allEntries.length
    setDirection(-1)
    setActiveId(allEntries[prevIdx].id)
    setVisualIdx((prev) => {
      const next = prev - 1
      return next
    })
  }, [activeIdx, allEntries])

  // Only run timer when section is visible on screen
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Pause when browser tab is not focused
  useEffect(() => {
    const onChange = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  // Desktop scroll navigation removed.

  const running = !paused && isVisible && tabVisible

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(advanceToNext, ROTATION_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [advanceToNext, running])

  return (
    <Section
      id="experience"
      className="experience-section"
      style={{
        backgroundColor: '#f4f4f4',
        paddingBottom: isMobileView ? 32 : 0,
        marginBottom: isMobileView ? 0 : -48,
      }}
    >
      <div ref={sectionRef}>
        {/* Header row: description text + toggle */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <GradientText as="h2" className="font-normal" style={{ fontSize: 'clamp(1.5rem, 1vw + 1rem, 1.875rem)' }}>
              Experience
            </GradientText>
            <p
              className="mt-3 leading-relaxed max-w-2xl"
              style={{ color: '#4B5563', fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}
            >
              I have experience in software engineering, research, and full stack development.
              Looking for summer 2027 software and AI/ML engineering internship roles.
            </p>
          </div>

          {/* Stripe-style segmented toggle */}
          <div
            className="inline-flex items-center p-1.5 shrink-0 self-center md:self-auto"
            style={{
              background: 'rgba(6, 113, 164, 0.08)',
              borderRadius: 12,
              boxShadow: 'inset 0 1px 2px rgba(6, 113, 164, 0.06)',
            }}
          >
            {(['work', 'involvement'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleTabClick(t)}
                className="relative text-base font-semibold px-4 md:px-8 py-2.5 cursor-pointer"
                style={{
                  color: tab === t ? '#FFFFFF' : '#0671A4',
                  borderRadius: 10,
                  background: tab === t ? '#0671A4' : 'transparent',
                  boxShadow: tab === t ? SHADOW.sm : 'none',
                  transition: 'all 0.25s cubic-bezier(.25,.1,.25,1)',
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key="carousel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Desktop: full-bleed carousel */}
              <div
                ref={desktopTrackRef}
                className="hidden md:block mt-10 relative"
                style={{
                  width: '100vw',
                  marginLeft: 'calc(-50vw + 50%)',
                  overflow: 'hidden',
                }}
              >
                {/* Arrow buttons — always visible (infinite loop) */}
                <button
                  aria-label="Previous experience"
                  onClick={() => {
                    navigateToPrev()
                    if (timerRef.current) clearInterval(timerRef.current)
                    setPaused(true)
                  }}
                  className="absolute left-[16px] top-1/2 -translate-y-1/2 z-30 flex items-center justify-center cursor-pointer"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(6,113,164,0.25)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(6,113,164,0.35)',
                    color: '#fff',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(6,113,164,0.45)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(6,113,164,0.25)')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button
                  aria-label="Next experience"
                  onClick={() => {
                    advanceToNext()
                    if (timerRef.current) clearInterval(timerRef.current)
                    setPaused(true)
                  }}
                  className="absolute right-[16px] top-1/2 -translate-y-1/2 z-30 flex items-center justify-center cursor-pointer"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(6,113,164,0.25)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(6,113,164,0.35)',
                    color: '#fff',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(6,113,164,0.45)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(6,113,164,0.25)')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
                <div
                  className="flex"
                  style={{
                    gap: GAP,
                    transform: `translateX(calc(max(1.5rem, (100vw - 80rem) / 2) - ${activeOffset}px))`,
                    transition: skipTransition
                      ? 'none'
                      : 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
                  }}
                >
                  {displayEntries.map((item, i) => {
                    const realIdx = i % allEntries.length
                    return (
                      <CarouselCard
                        key={`card-${i}`}
                        item={item}
                        isActive={i === visualIdx}
                        onClick={() => {
                          setVisualIdx(getNearestVisualIdx(realIdx))
                          navigateTo(allEntries[realIdx].id)
                          if (timerRef.current) clearInterval(timerRef.current)
                          setPaused(true)
                        }}
                        paused={!running}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Mobile: peek carousel — centered card with equal peeks, arrow nav only */}
              <div className="md:hidden mt-10 overflow-hidden" style={{ margin: '40px -24px 0' }}>
                {/* Probe resolves --mobile-card-inset (clamp of vw) to px. */}
                <div
                  ref={insetProbeRef}
                  aria-hidden
                  style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    pointerEvents: 'none',
                    height: 1,
                    width: 'var(--mobile-card-inset)',
                  }}
                />
                <motion.div
                  className="flex touch-pan-y"
                  style={{ gap: `${mobileCardGap}px` }}
                  drag="x"
                  dragElastic={0.2}
                  dragMomentum={false}
                  dragConstraints={{
                    left: insetPx / 2 - (allEntries.length - 1) * (vw - insetPx + mobileCardGap),
                    right: insetPx / 2,
                  }}
                  onDragStart={() => {
                    if (timerRef.current) clearInterval(timerRef.current)
                    setPaused(true)
                  }}
                  onDragEnd={(_, info) => {
                    const step = vw - insetPx + mobileCardGap
                    const posThreshold = step / 4
                    const velThreshold = 400
                    const last = allEntries.length - 1
                    if ((info.offset.x < -posThreshold || info.velocity.x < -velThreshold) && mobileCarouselIdx < last) {
                      setMobileCarouselIdx(mobileCarouselIdx + 1)
                    } else if ((info.offset.x > posThreshold || info.velocity.x > velThreshold) && mobileCarouselIdx > 0) {
                      setMobileCarouselIdx(mobileCarouselIdx - 1)
                    }
                  }}
                  animate={{ x: insetPx / 2 - mobileCarouselIdx * (vw - insetPx + mobileCardGap) }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {allEntries.map((item, i) => (
                    <div
                      key={item.id}
                      className="shrink-0 cursor-pointer"
                      style={{
                        width: vw - insetPx,
                        opacity: i === mobileCarouselIdx ? 1 : 0.7,
                        transform: i === mobileCarouselIdx ? 'scale(1)' : 'scale(0.95)',
                        transition: 'opacity 0.3s, transform 0.3s',
                      }}
                      onClick={() => { if (i !== mobileCarouselIdx) setMobileCarouselIdx(i) }}
                    >
                      <MobileCard item={item} />
                    </div>
                  ))}
                </motion.div>
                {/* Arrow navigation */}
                <div className="flex justify-end gap-3 mt-9 px-4">
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(6, 113, 164, 0.1)',
                      opacity: mobileCarouselIdx === 0 ? 0.4 : 1,
                      transition: 'opacity 0.2s',
                    }}
                    aria-label="Previous experience"
                    disabled={mobileCarouselIdx === 0}
                    onClick={() => { if (mobileCarouselIdx > 0) setMobileCarouselIdx(mobileCarouselIdx - 1) }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0671A4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(6, 113, 164, 0.1)',
                      opacity: mobileCarouselIdx === allEntries.length - 1 ? 0.4 : 1,
                      transition: 'opacity 0.2s',
                    }}
                    aria-label="Next experience"
                    disabled={mobileCarouselIdx === allEntries.length - 1}
                    onClick={() => { if (mobileCarouselIdx < allEntries.length - 1) setMobileCarouselIdx(mobileCarouselIdx + 1) }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0671A4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-10 flex items-center justify-center"
              style={{ minHeight: 300 }}
            >
              <p style={{ color: '#94A3B8', fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}>
                More coming soon.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  )
}
