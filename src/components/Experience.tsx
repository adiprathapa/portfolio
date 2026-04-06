import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Section } from './ui/section'
import { GradientText } from './ui/gradient-text'

/* ── Stripe-inspired shadow system ─────────────────────────── */
const SHADOW = {
  sm: '0 2px 5px -1px rgba(50,50,93,0.25), 0 1px 3px -1px rgba(0,0,0,0.3)',
  md: '0 6px 12px -2px rgba(50,50,93,0.25), 0 3px 7px -3px rgba(0,0,0,0.3)',
  lg: '0 13px 27px -5px rgba(50,50,93,0.25), 0 8px 16px -8px rgba(0,0,0,0.3)',
  xl: '0 30px 60px -12px rgba(50,50,93,0.25), 0 18px 36px -18px rgba(0,0,0,0.3)',
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
  logoOffsetTop?: number
  logoOffsetLeft?: number
  bgImage: string
  gradientColor: string
}

/* ── Data ──────────────────────────────────────────────────── */
const work: ExperienceItem[] = [
  {
    id: 'mitre',
    company: 'MITRE',
    role: 'Software Engineering Intern',
    duration: 'Incoming Summer 2026',
    description:
      'Working on graph neural networks for supply chain and transportation',
    bullets: [
      'Incoming',
    ],
    tech: [
      { name: 'PyTorch Geometric', icon: 'https://cdn.simpleicons.org/pytorch' },
      { name: 'Dash', icon: 'https://cdn.simpleicons.org/plotly' },
    ],
    logo: '/mitre.png',
    logoHeight: 78,
    bgImage: '/pexels-pinamon-17647329.jpg',
    gradientColor: '#0671A4',
  },
  {
    id: 'cornell',
    company: 'Cornell Bowers CIS',
    role: 'CSMore Intern',
    duration: 'January 2026',
    description:
      'Implementing data structures, algorithms, and discrete mathematics',
    bullets: [
      'Developed modular Java applications using object-oriented design patterns, inheritance hierarchies, and encapsulation',
      'Implemented and benchmarked linked lists, trees, hash maps, and graphs, analyzing time and space complexity tradeoffs',
      'Traced execution across multi-class architectures and profiled runtime behavior to debug and resolve bottlenecks',
    ],
    tech: [
      { name: 'Java', icon: 'https://cdn.simpleicons.org/openjdk' },
      { name: 'JUnit', icon: 'https://cdn.simpleicons.org/junit5' },
    ],
    logo: '/cornell.svg',
    logoHeight: 35,
    logoOffsetTop: 22,
    logoOffsetLeft: 0,
    bgImage: '/bowers.jpg',
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
      { name: 'ChatGPT API', icon: 'https://cdn.simpleicons.org/chatbot' },
      { name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript' },
    ],
    logo: '/mines.png',
    logoHeight: 42,
    logoOffsetTop: 19,
    logoOffsetLeft: -3,
    bgImage: '/mines-bg.jpg',
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
      'Created Python simulation programs to model Bohmian trajectories and visualize quantum behavior using Scikit-learn',
      'Produced 3D printed models from simulation data using Matplotlib visualizations to support educational demonstrations',
      'Presented findings at the Nebraska Summer Research Symposium after biweekly reviews with professor to refine methodology',
    ],
    tech: [
      { name: 'scikit-learn', icon: 'https://cdn.simpleicons.org/scikitlearn' },
      { name: 'Python', icon: 'https://cdn.simpleicons.org/python' },
    ],
    logo: '/neb.png',
    logoHeight: 40,
    logoOffsetTop: 21,
    logoOffsetLeft: -8,
    bgImage: '/unl-bg.jpg',
    gradientColor: '#D00000',
  },
]

const involvement: ExperienceItem[] = []
const education: ExperienceItem[] = []

const companyLogos = [
  { src: '/mitre-desktop.png', alt: 'MITRE', h: 23, id: 'mitre' },
  { src: '/cornell.svg', alt: 'Cornell', h: 32, id: 'cornell' },
  { src: '/mines.png', alt: 'Mines', h: 32, id: 'mines' },
  { src: '/neb.png', alt: 'Nebraska', h: 32, id: 'neb' },
]

/* ── Sub-components ────────────────────────────────────────── */

function FeatureCard({ item, direction, paused }: { item: ExperienceItem; direction: number; paused: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{
        borderRadius: 12,
        border: '1.5px solid rgba(6, 113, 164, 0.3)',
        boxShadow: hovered
          ? '0 16px 48px rgba(6, 113, 164, 0.14), 0 8px 24px rgba(0, 0, 0, 0.08)'
          : '0 8px 24px rgba(6, 113, 164, 0.08), 0 4px 12px rgba(0, 0, 0, 0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.3s ease, transform 0.6s ease',
        aspectRatio: '16 / 9',
        minHeight: 340,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ zIndex: 1 }}
        >
          <div className="absolute inset-0">
            <img
              src={item.bgImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: hovered
                  ? `linear-gradient(
                      180deg,
                      ${item.gradientColor}D9 0%,
                      ${item.gradientColor}99 20%,
                      ${item.gradientColor}B3 40%,
                      ${item.gradientColor}CC 60%,
                      ${item.gradientColor}F5 80%,
                      ${item.gradientColor}FF 100%
                    )`
                  : `linear-gradient(
                      180deg,
                      ${item.gradientColor}D9 0%,
                      ${item.gradientColor}66 30%,
                      ${item.gradientColor}4D 50%,
                      ${item.gradientColor}99 70%,
                      ${item.gradientColor}F0 100%
                    )`,
                transition: 'background 0.4s ease',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 70% 30%, transparent 40%, ${item.gradientColor}40 100%)`,
              }}
            />
          </div>
          {/* Logo — top-left */}
          <img
            src={item.logo}
            alt={item.company}
            style={{
              position: 'absolute',
              top: 32 + (item.logoOffsetTop ?? 0) - 28,
              left: 32 + (item.logoOffsetLeft ?? 0),
              height: item.logoHeight,
              width: 'auto',
              objectFit: 'contain',
              filter: 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.18))',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.4s ease',
              zIndex: 2,
            }}
          />
          {/* Description — pinned to bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: 32,
              left: 32,
              right: 32,
              transition: 'transform 0.4s ease',
              zIndex: 2,
            }}
          >
            <h3
              className="text-lg md:text-xl font-medium leading-relaxed max-w-lg"
              style={{
                color: '#FFFFFF',
                textShadow: '0 1px 3px rgba(0,0,0,0.12)',
              }}
            >
              {item.description}
            </h3>
            {item.bullets && item.bullets.length > 0 && (
              <ul
                className="max-w-lg flex flex-col gap-1.5"
                style={{
                  opacity: hovered ? 1 : 0,
                  maxHeight: hovered ? 300 : 0,
                  marginTop: hovered ? 12 : 0,
                  overflow: 'hidden',
                  transform: hovered ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s, max-height 0.35s ease 0.1s, margin-top 0.35s ease 0.1s',
                }}
              >
                {item.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed"
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      textShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Timer bar — hidden when paused */}
      {!paused && (
        <div
          className="absolute bottom-0 left-0 right-0 z-10"
          style={{ height: 3, background: 'rgba(255,255,255,0.15)' }}
        >
          <motion.div
            key={item.id}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: (ROTATION_INTERVAL - 300) / 1000, ease: 'linear' }}
            style={{ height: '100%', background: '#0671A4' }}
          />
        </div>
      )}
    </div>
  )
}


/* ── Main component ────────────────────────────────────────── */

const ROTATION_INTERVAL = 7000

export function Experience() {
  const [tab, setTab] = useState<'work' | 'involvement' | 'education'>('work')
  const [activeId, setActiveId] = useState('mitre')
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const entries = tab === 'work' ? work : tab === 'involvement' ? involvement : education
  const active = entries.find((e) => e.id === activeId) ?? entries[0] ?? null

  const navigateTo = useCallback((id: string) => {
    const currentIdx = entries.findIndex((e) => e.id === activeId)
    const nextIdx = entries.findIndex((e) => e.id === id)
    setDirection(nextIdx >= currentIdx ? 1 : -1)
    setActiveId(id)
  }, [entries, activeId])

  const advanceToNext = useCallback(() => {
    if (entries.length === 0) return
    const currentIdx = entries.findIndex((e) => e.id === activeId)
    const nextIdx = (currentIdx + 1) % entries.length
    setDirection(1)
    setActiveId(entries[nextIdx].id)
  }, [entries, activeId])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(advanceToNext, ROTATION_INTERVAL)
  }, [advanceToNext])

  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(advanceToNext, ROTATION_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [advanceToNext, paused])

  return (
    <Section id="experience" className="bg-surface min-h-screen flex items-center !pt-0">
      <div style={{ transform: 'translateY(15px)' }}>
        {/* Section heading */}
        <GradientText as="h2" className="text-2xl md:text-3xl font-normal">
          Experience
        </GradientText>

        {/* Stripe-style segmented toggle */}
        <div
          className="inline-flex items-center p-1 mt-8"
          style={{
            background: 'rgba(6, 113, 164, 0.08)',
            borderRadius: 10,
            boxShadow: 'inset 0 1px 2px rgba(6, 113, 164, 0.06)',
          }}
        >
          {(['work', 'involvement', 'education'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative text-sm font-semibold px-6 py-2 cursor-pointer"
              style={{
                color: tab === t ? '#FFFFFF' : '#0671A4',
                borderRadius: 8,
                background: tab === t ? '#0671A4' : 'transparent',
                boxShadow: tab === t ? SHADOW.sm : 'none',
                transition: 'all 0.25s cubic-bezier(.25,.1,.25,1)',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content area — outer AnimatePresence keyed by tab (not active.id)
             so the inner AnimatePresence in FeatureCard can cross-fade cards */}
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-10 flex flex-col md:flex-row gap-10 w-full items-start"
            >
              {/* Left column — metadata values only */}
              <div className="relative md:w-[260px] shrink-0 self-stretch">
                <div className="absolute" style={{ top: 0 }}>
                  <p className="text-lg md:text-xl text-heading leading-relaxed">
                    {active.role}
                  </p>
                </div>
                <div className="absolute" style={{ top: 200 }}>
                  <p className="text-lg md:text-xl text-heading leading-relaxed">
                    {active.duration}
                  </p>
                </div>
                <div className="absolute" style={{ top: 400 }}>
                  <p className="text-lg md:text-xl text-heading leading-relaxed mb-3">
                    Tech Stack
                  </p>
                  <div className="flex flex-col gap-2 pl-3">
                    {active.tech.map((t) => (
                      <div key={t.name} className="flex items-center gap-2">
                        <img
                          src={t.icon}
                          alt={t.name}
                          className="w-5 h-5 object-contain"
                        />
                        <span className="text-lg md:text-xl text-heading">
                          {t.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column — featured card */}
              <div className="flex-1 w-full min-w-0" style={{ marginRight: 56 }}>
                <FeatureCard item={active} direction={direction} paused={paused} />
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
              <p className="text-base" style={{ color: '#94A3B8' }}>
                More coming soon.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logo bar with auto-rotation */}
        <div className="mt-16">
          <div className="flex items-center justify-between py-8" style={{ width: 'calc(100% - 33px)' }}>
            {companyLogos.map((logo) => {
              const isActive = active?.id === logo.id
              return (
                <div
                  key={logo.alt}
                  className="relative cursor-pointer"
                  style={{
                    padding: '6px 12px',
                  }}
                  onClick={() => {
                    const match = entries.find((e) => e.id === logo.id)
                    if (match) {
                      navigateTo(match.id)
                      if (timerRef.current) clearInterval(timerRef.current)
                      setPaused(true)
                    }
                  }}
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="object-contain"
                    style={{
                      height: logo.h,
                      filter: isActive
                        ? 'grayscale(0%) opacity(1)'
                        : 'brightness(0) saturate(100%) invert(55%) sepia(40%) saturate(400%) hue-rotate(170deg) brightness(110%) opacity(0.45)',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.35s cubic-bezier(.25,.1,.25,1)',
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Section>
  )
}
