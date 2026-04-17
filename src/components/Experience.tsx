import { useState, useEffect, useCallback, useRef } from 'react'
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
      'Working on graph neural networks and graph attention networks',
    bullets: ['Incoming'],
    tech: [
      { name: 'PyTorch Geometric', icon: 'https://cdn.simpleicons.org/pytorch' },
      { name: 'Dash', icon: 'https://cdn.simpleicons.org/plotly' },
    ],
    logo: '/mitre.png',
    logoHeight: 91,
    logoInvert: true,
    logoOffsetY: -25,
    bgImage: '/pexels-pinamon-17647329.jpg',
    gradientColor: '#0671A4',
  },
  {
    id: 'cornell',
    company: 'Cornell Bowers CIS',
    role: 'CSMore Intern',
    duration: 'January 2026',
    description:
      'Implementing modular class designs, data structures, and algorithms',
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
    logoHeight: 44,
    logoInvert: true,
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
    logoHeight: 44,
    logoInvert: true,
    logoOffsetY: 0,
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
    logoHeight: 42,
    logoInvert: true,
    logoOffsetY: -1,
    logoOffsetX: -12,
    bgImage: '/unl-bg.jpg',
    gradientColor: '#D00000',
  },
]

const involvement: ExperienceItem[] = [
  {
    id: 'cds',
    company: 'Cornell Data & Strategy',
    role: 'Tech Implementation Associate',
    duration: 'Fall 2025 — Present',
    description:
      'Delivering data prediction and visualization tools to clients',
    bullets: [],
    tech: [
      { name: 'Redis', icon: 'https://cdn.simpleicons.org/redis' },
      { name: 'PostgreSQL', icon: 'https://cdn.simpleicons.org/postgresql' },
    ],
    logo: '/logodsa.png',
    logoHeight: 79,
    logoInvert: true,
    logoOffsetY: -16,
    bgImage: '/cornell data strategy.png',
    gradientColor: '#1C3D6B',
  },
  {
    id: 'c2s2',
    company: 'Cornell Custom Silicon Systems',
    role: 'Project Manager',
    duration: 'Fall 2025 — Present',
    description:
      'Designing and taping out custom silicon chips as part of a student led project team',
    bullets: [],
    tech: [
      { name: 'Confluence', icon: 'https://cdn.simpleicons.org/confluence' },
      { name: 'Apache HTTP Server', icon: 'https://cdn.simpleicons.org/apache' },
    ],
    logo: '/c2s2logo.png',
    logoHeight: 72,
    logoInvert: true,
    logoOffsetY: -6,
    logoOffsetX: -4,
    bgImage: '/c2s2.jpeg',
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
    bgImage: '/cas.webp',
    gradientColor: '#6B1D2A',
  },
]

const education: ExperienceItem[] = [
  {
    id: 'cornell-edu',
    company: 'Cornell University',
    role: 'B.A. Computer Science',
    duration: 'August 2025 — May 2029',
    description:
      'College of Arts & Sciences. Minoring in Artificial Intelligence.',
    bullets: [],
    tech: [
      { name: 'Java', icon: 'https://cdn.simpleicons.org/openjdk' },
      { name: 'Python', icon: 'https://cdn.simpleicons.org/python' },
      { name: 'OCaml', icon: 'https://cdn.simpleicons.org/ocaml' },
    ],
    logo: '/cornell.svg',
    logoHeight: 44,
    logoInvert: true,
    bgImage: '/bowers.jpg',
    gradientColor: '#B31B1B',
  },
]

/* ── Card dimensions ──────────────────────────────────────── */
const CARD_W = 580
const CARD_H = 560
const GAP = 24

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden cursor-pointer"
      style={{
        width: CARD_W,
        height: CARD_H,
        flexShrink: 0,
        borderRadius: 20,
        border: '1.5px solid rgba(6, 113, 164, 0.3)',
        opacity: isActive ? 1 : 0.92,
        transition: 'opacity 0.4s ease',
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
              ? 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
              : 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
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
                className="text-xl font-semibold mt-1.5 leading-snug"
                style={{ color: '#FFFFFF', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
              >
                {item.role}
              </h3>
              <p
                className="text-lg mt-2.5 leading-relaxed"
                style={{
                  color: 'rgba(255,255,255,0.88)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                {item.description}
              </p>
              {/* Tech stack */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {item.tech.map((t) => (
                  <div key={t.name} className="flex items-center gap-1.5">
                    <img
                      src={t.icon}
                      alt={t.name}
                      className="w-4 h-4 object-contain"
                      style={{ filter: 'brightness(0) invert(1)', opacity: 0.85 }}
                    />
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {t.name}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div>
              <p
                className="text-lg leading-relaxed"
                style={{
                  color: 'rgba(255,255,255,0.88)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
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
      className="relative overflow-hidden w-full"
      style={{ borderRadius: 16, border: '1.5px solid rgba(6, 113, 164, 0.3)', aspectRatio: '16 / 10', minHeight: 300 }}
    >
      <img src={item.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${item.gradientColor}70 0%, ${item.gradientColor}30 20%, ${item.gradientColor}60 55%, ${item.gradientColor}E8 80%, ${item.gradientColor}FA 100%)`,
        }}
      />
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        <img
          src={item.logo}
          alt={item.company}
          style={{
            height: item.logoHeight * 0.7,
            width: 'auto',
            maxWidth: '50%',
            objectFit: 'contain',
            filter: item.logoInvert
              ? 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.2))'
              : 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
            borderRadius: item.logoInvert ? 0 : 8,
          }}
        />
        <div>
          <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {item.duration}
          </p>
          <h3 className="text-lg font-semibold mt-1" style={{ color: '#FFFFFF' }}>
            {item.role}
          </h3>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {item.description}
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {item.tech.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5">
                <img src={t.icon} alt={t.name} className="w-3.5 h-3.5 object-contain" style={{ filter: 'brightness(0) invert(1)', opacity: 0.7 }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Education bento (inline in carousel) ────────────────── */

const BENTO_W = 1428
const BENTO_GAP = 16

function EducationBentoInline({ isActive, onClick, activeCard, setActiveCard }: { isActive: boolean; onClick: () => void; activeCard: 'cornell' | 'highschool'; setActiveCard: (v: 'cornell' | 'highschool') => void }) {
  const [cornellHovered, setCornellHovered] = useState(false)
  const [hsHovered, setHsHovered] = useState(false)
  const cornellColor = '#B31B1B'
  const hsColor = '#004d2c'

  const cornellActive = isActive && activeCard === 'cornell'
  const hsActive = isActive && activeCard === 'highschool'

  return (
    <div
      className="flex"
      style={{
        width: isActive ? BENTO_W : CARD_W * 2 + BENTO_GAP,
        height: CARD_H,
        flexShrink: 0,
        gap: BENTO_GAP,
        opacity: isActive ? 1 : 0.92,
        transition: 'width 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.4s ease',
      }}
    >
      {/* Cornell card */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ borderRadius: 20, border: '1.5px solid rgba(6, 113, 164, 0.3)', minWidth: 0, flex: isActive ? (activeCard === 'cornell' ? 3 : 2) : 1, transition: 'flex 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
        onClick={() => { setActiveCard('cornell'); onClick() }}
        onMouseEnter={() => setCornellHovered(true)}
        onMouseLeave={() => setCornellHovered(false)}
      >
        <img
          src="/nell.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: cornellActive || cornellHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: cornellActive
              ? `linear-gradient(180deg, ${cornellColor}73 0%, ${cornellColor}D0 55%, ${cornellColor}F5 100%)`
              : `linear-gradient(180deg, ${cornellColor}50 0%, ${cornellColor}A0 55%, ${cornellColor}DD 100%)`,
            transition: 'background 0.5s ease',
          }}
        />
        <div className="relative z-10 h-full flex flex-col justify-between p-7">
          <img
            src="/cornell.svg"
            alt="Cornell University"
            style={{
              height: 36,
              width: 'auto',
              filter: 'brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
            }}
            className="self-start"
          />
          <div>
            {cornellActive ? (
              <motion.div
                key="cornell-active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
              >
                <h3
                  className="text-xl font-semibold mt-1.5 leading-snug"
                  style={{ color: '#FFFFFF', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                >
                  B.A. Computer Science
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                >
                  College of Arts & Sciences &nbsp;&middot;&nbsp; Minor in Artificial Intelligence
                </p>
                <div className="mt-3">
                  <p
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Relevant Coursework
                  </p>
                  <p
                    className="text-sm mt-1 leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    Object-Oriented Programming &nbsp;&middot;&nbsp; Data Structures &nbsp;&middot;&nbsp; Python Design and Development
                  </p>
                </div>
              </motion.div>
            ) : (
              <p
                className="text-lg leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.88)', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
              >
                Bachelor of Arts, Computer Science
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Millard North High School card */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ borderRadius: 20, border: '1.5px solid rgba(6, 113, 164, 0.3)', minWidth: 0, flex: isActive ? (activeCard === 'highschool' ? 3 : 2) : 1, transition: 'flex 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
        onClick={(e) => { e.stopPropagation(); setActiveCard('highschool'); onClick() }}
        onMouseEnter={() => setHsHovered(true)}
        onMouseLeave={() => setHsHovered(false)}
      >
        <img
          src="/mnhs.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: hsActive || hsHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: hsActive
              ? `linear-gradient(180deg, ${hsColor}73 0%, ${hsColor}D0 55%, ${hsColor}F5 100%)`
              : `linear-gradient(180deg, ${hsColor}40 0%, ${hsColor}80 55%, ${hsColor}CC 100%)`,
            transition: 'background 0.5s ease',
          }}
        />
        <div className="relative z-10 h-full flex flex-col justify-between p-7">
          <img
            src="/mnhs-removebg-preview.png"
            alt="Millard North High School"
            className="self-start"
            style={{
              height: 36,
              width: 'auto',
              filter: 'brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
            }}
          />
          <div>
            {hsActive ? (
              <motion.div
                key="hs-active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
              >
                <h3
                  className="text-xl font-semibold mt-1.5 leading-snug"
                  style={{ color: '#FFFFFF', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                >
                  Millard North High School
                </h3>
                <div className="mt-3">
                  <p
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Activities and Societies
                  </p>
                  <p
                    className="text-sm mt-1 leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    National Honors Society &nbsp;&middot;&nbsp; Spanish Honors Society &nbsp;&middot;&nbsp; Varsity Marching Band &nbsp;&middot;&nbsp; Speech &nbsp;&middot;&nbsp; Mustang Mentoring
                  </p>
                </div>
              </motion.div>
            ) : (
              <p
                className="text-lg leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.88)', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
              >
                International Baccalaureate Diploma Program
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ────────────────────────────────────────── */

const ROTATION_INTERVAL = 7000

export function Experience() {
  // Carousel: work → involvement → education bento at the end
  const allEntries = [...work, ...involvement]

  const [activeId, setActiveId] = useState('mitre')
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const [showEducation, setShowEducation] = useState(false)
  const [eduActiveCard, setEduActiveCard] = useState<'cornell' | 'highschool'>('cornell')
  const [isVisible, setIsVisible] = useState(false)
  const [tabVisible, setTabVisible] = useState(!document.hidden)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const sectionRef = useRef<HTMLDivElement>(null)

  const activeIdx = Math.max(0, allEntries.findIndex((e) => e.id === activeId))
  const active = allEntries[activeIdx]

  // Derive which tab is active
  const tab: 'work' | 'involvement' | 'education' = showEducation
    ? 'education'
    : activeIdx < work.length
      ? 'work'
      : 'involvement'

  // Offset: education bento sits right after the last card
  const activeOffset = showEducation
    ? allEntries.length * (CARD_W + GAP)
    : activeIdx * (CARD_W + GAP)

  const navigateTo = useCallback(
    (id: string) => {
      const currentIdx = allEntries.findIndex((e) => e.id === activeId)
      const nextIdx = allEntries.findIndex((e) => e.id === id)
      setDirection(nextIdx >= currentIdx ? 1 : -1)
      setActiveId(id)
      setShowEducation(false)
    },
    [allEntries, activeId],
  )

  const handleTabClick = useCallback(
    (t: 'work' | 'involvement' | 'education') => {
      if (t === 'education') {
        setShowEducation(true)
        if (timerRef.current) clearInterval(timerRef.current)
        setPaused(true)
        return
      }
      setShowEducation(false)
      const target = t === 'work' ? work[0] : involvement[0]
      if (target) {
        navigateTo(target.id)
        if (timerRef.current) clearInterval(timerRef.current)
        setPaused(true)
      }
    },
    [navigateTo],
  )

  const advanceToNext = useCallback(() => {
    if (allEntries.length === 0) return
    if (showEducation) {
      // Wrap from education back to first card
      setShowEducation(false)
      setDirection(1)
      setActiveId(allEntries[0].id)
      return
    }
    if (activeIdx === allEntries.length - 1 && education.length > 0) {
      // Last involvement card → education bento
      setShowEducation(true)
      setDirection(1)
      return
    }
    const nextIdx = (activeIdx + 1) % allEntries.length
    setDirection(1)
    setActiveId(allEntries[nextIdx].id)
  }, [allEntries, activeIdx, showEducation])

  const navigateToPrev = useCallback(() => {
    if (allEntries.length === 0) return
    if (showEducation) {
      setShowEducation(false)
      setDirection(-1)
      setActiveId(allEntries[allEntries.length - 1].id)
      return
    }
    if (activeIdx === 0 && education.length > 0) {
      setShowEducation(true)
      setDirection(-1)
      return
    }
    const prevIdx = (activeIdx - 1 + allEntries.length) % allEntries.length
    setDirection(-1)
    setActiveId(allEntries[prevIdx].id)
  }, [allEntries, activeIdx, showEducation])

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

  const running = !paused && isVisible && tabVisible

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(advanceToNext, ROTATION_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [advanceToNext, running])

  return (
    <Section id="experience" className="bg-surface min-h-screen flex items-center !pt-0">
      <div ref={sectionRef} style={{ transform: 'translateY(-27px)' }}>
        {/* Header row: description text + toggle */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <GradientText as="h2" className="text-2xl md:text-3xl font-normal">
              Experience
            </GradientText>
            <p
              className="mt-3 text-base md:text-lg leading-relaxed max-w-2xl"
              style={{ color: '#4B5563' }}
            >
              I have experience in software engineering, research, and full stack development.
              Looking for Software and AI/ML engineering internship roles.
            </p>
          </div>

          {/* Stripe-style segmented toggle */}
          <div
            className="inline-flex items-center p-1.5 shrink-0"
            style={{
              background: 'rgba(6, 113, 164, 0.08)',
              borderRadius: 12,
              boxShadow: 'inset 0 1px 2px rgba(6, 113, 164, 0.06)',
            }}
          >
            {(['work', 'involvement', 'education'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleTabClick(t)}
                className="relative text-base font-semibold px-8 py-2.5 cursor-pointer"
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
                className="hidden md:block mt-10 relative"
                style={{
                  width: '100vw',
                  marginLeft: 'calc(-50vw + 50%)',
                  overflow: 'hidden',
                }}
              >
                {/* Arrow buttons */}
                {!(activeIdx === 0 && !showEducation) && (
                  <button
                    onClick={() => {
                      if (showEducation && eduActiveCard === 'highschool') {
                        setEduActiveCard('cornell')
                      } else {
                        navigateToPrev()
                      }
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
                )}
                {!(showEducation && eduActiveCard === 'highschool') && (
                  <button
                    onClick={() => {
                      if (showEducation && eduActiveCard === 'cornell') {
                        setEduActiveCard('highschool')
                      } else {
                        advanceToNext()
                      }
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
                )}
                <div
                  className="flex"
                  style={{
                    gap: GAP,
                    transform: `translateX(calc(max(1.5rem, (100vw - 80rem) / 2) - ${activeOffset}px))`,
                    transition: 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
                  }}
                >
                  {allEntries.map((item) => (
                    <CarouselCard
                      key={item.id}
                      item={item}
                      isActive={!showEducation && active.id === item.id}
                      onClick={() => {
                        navigateTo(item.id)
                        if (timerRef.current) clearInterval(timerRef.current)
                        setPaused(true)
                      }}
                      paused={!running}
                    />
                  ))}
                  {/* Education bento slides in at the end */}
                  {education.length > 0 && (
                    <EducationBentoInline
                      isActive={showEducation}
                      activeCard={eduActiveCard}
                      setActiveCard={setEduActiveCard}
                      onClick={() => {
                        setShowEducation(true)
                        if (timerRef.current) clearInterval(timerRef.current)
                        setPaused(true)
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Mobile: single card + logo nav */}
              <div className="md:hidden mt-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, x: direction * 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MobileCard item={active} />
                  </motion.div>
                </AnimatePresence>
                <div className="flex items-center justify-center gap-6 mt-6">
                  {allEntries.map((item) => {
                    const isItemActive = active.id === item.id
                    return (
                      <button
                        key={item.id}
                        className="cursor-pointer p-2"
                        onClick={() => {
                          navigateTo(item.id)
                          if (timerRef.current) clearInterval(timerRef.current)
                          setPaused(true)
                        }}
                      >
                        <img
                          src={item.logo}
                          alt={item.company}
                          className="object-contain"
                          style={{
                            height: 24,
                            filter: isItemActive ? 'grayscale(0%) opacity(1)' : 'grayscale(100%) opacity(0.35)',
                            transform: isItemActive ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </button>
                    )
                  })}
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
              <p className="text-base" style={{ color: '#94A3B8' }}>
                More coming soon.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  )
}
