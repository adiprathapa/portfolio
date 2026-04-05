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

function FeatureCard({ item, direction }: { item: ExperienceItem; direction: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{
        borderRadius: 12,
        boxShadow: hovered ? SHADOW.xl : SHADOW.lg,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.6s ease, transform 0.6s ease',
        aspectRatio: '16 / 9',
        minHeight: 340,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Crossfade between slides */}
      <AnimatePresence>
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0"
            style={{
              transform: hovered ? 'scale(1.015)' : 'scale(1)',
              transition: 'transform 1s ease',
            }}
          >
            <img
              src={item.bgImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(
                    180deg,
                    ${item.gradientColor}D9 0%,
                    ${item.gradientColor}66 30%,
                    ${item.gradientColor}4D 50%,
                    ${item.gradientColor}99 70%,
                    ${item.gradientColor}F0 100%
                  )
                `,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 70% 30%, transparent 40%, ${item.gradientColor}40 100%)`,
              }}
            />
          </div>
          <div className="relative h-full flex flex-col justify-between p-8 md:p-10">
            <img
              src={item.logo}
              alt={item.company}
              style={{
                height: item.logoHeight,
                width: 'auto',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.18))',
                alignSelf: 'flex-start',
                marginTop: (item.logoOffsetTop ?? 0) - 28,
                marginLeft: item.logoOffsetLeft ?? 0,
              }}
            />
            <h3
              className="text-lg md:text-xl font-medium leading-relaxed max-w-lg"
              style={{
                color: '#FFFFFF',
                textShadow: '0 1px 3px rgba(0,0,0,0.12)',
              }}
            >
              {item.description}
            </h3>
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Timer bar */}
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
    </div>
  )
}


/* ── Main component ────────────────────────────────────────── */

const ROTATION_INTERVAL = 7000

export function Experience() {
  const [tab, setTab] = useState<'work' | 'involvement' | 'education'>('work')
  const [activeId, setActiveId] = useState('mitre')
  const [direction, setDirection] = useState(1)
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
    timerRef.current = setInterval(advanceToNext, ROTATION_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [advanceToNext])

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
            background: '#E2E7ED',
            borderRadius: 10,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
          }}
        >
          {(['work', 'involvement', 'education'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative text-sm font-semibold px-6 py-2 cursor-pointer"
              style={{
                color: tab === t ? '#FFFFFF' : '#6B7280',
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

        {/* Content area with animated transitions */}
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active.id}
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              className="mt-10 flex flex-col md:flex-row gap-10 w-full items-start"
            >
              {/* Left column — metadata, fixed positions so multiline roles don't shift others */}
              <div className="relative md:w-[260px] shrink-0 self-stretch">
                <div className="absolute" style={{ top: 0 }}>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: '#0671A4' }}
                  >
                    Role
                  </p>
                  <p className="text-lg md:text-xl mt-1.5 text-heading leading-relaxed">
                    {active.role}
                  </p>
                </div>
                <div className="absolute" style={{ top: 120 }}>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: '#0671A4' }}
                  >
                    Duration
                  </p>
                  <p className="text-lg md:text-xl mt-1.5 text-heading leading-relaxed">
                    {active.duration}
                  </p>
                </div>
                <div className="absolute" style={{ top: 230 }}>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2.5"
                    style={{ color: '#0671A4' }}
                  >
                    Stack
                  </p>
                  <div className="flex flex-col gap-2 pl-3">
                    {active.tech.map((t) => (
                      <div key={t.name} className="flex items-center gap-2">
                        <img
                          src={t.icon}
                          alt={t.name}
                          className="w-5 h-5 object-contain"
                        />
                        <span className="text-sm" style={{ color: '#4B5563' }}>
                          {t.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column — featured card */}
              <div className="flex-1 w-full min-w-0">
                <FeatureCard item={active} />
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
          <div className="flex items-center justify-between py-8 w-full">
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
                      resetTimer()
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
