import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Section } from './ui/section'
import { GradientText } from './ui/gradient-text'

type EduId = 'cornell' | 'highschool'

type EduItem = {
  id: EduId
  school: string
  degree: string
  period: string
  date: string
  description: string
  bullets: string[]
  bgImage: string
  color: string
}

const items: EduItem[] = [
  {
    id: 'cornell',
    school: 'Cornell University',
    degree: 'B.A. Computer Science',
    period: 'Ithaca, NY',
    date: 'Anticipated 2028',
    description: 'College of Arts and Sciences and Ann S. Bowers College of Computing and Information Science, minor in Artificial Intelligence.',
    bullets: [
      'Data Structures, Object-Oriented Programming, Theory of Computation, Discrete Math, Python Design and Development, Calculus 1, Calculus 2, Linear Algebra for Engineers',
    ],
    bgImage: '/nell.webp',
    color: '#B31B1B',
  },
  {
    id: 'highschool',
    school: 'Millard North High School',
    degree: 'International Baccalaureate Diploma',
    period: 'Omaha, NE',
    date: '',
    description: 'Math Higher Level, Biology Higher Level, English Higher Level, Psychology Standard Level, Spanish Standard Level, Music Standard Level.',
    bullets: [
      'AP Spanish, AP Human Geography, AP World History, AP Physics, AP Computer Science Principles',
      'National Honors Society, Spanish Honors Society, Varsity Marching Band, Speech, Mustang Mentoring',
    ],
    bgImage: '/mnhs.webp',
    color: '#004d2c',
  },
]

function VisualCard({ item }: { item: EduItem }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        borderRadius: 20,
        border: '1.5px solid rgba(6, 113, 164, 0.3)',
        width: 580,
        maxWidth: '100%',
        aspectRatio: '1 / 1',
      }}
    >
      <img
        src={item.bgImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          transform: 'scale(1.02)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${item.color}15 0%, ${item.color}40 58%, ${item.color}60 100%)`,
        }}
      />
    </div>
  )
}

function ListRow({
  item,
  isActive,
  onClick,
  style,
}: {
  item: EduItem
  isActive: boolean
  onClick: () => void
  style?: CSSProperties
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative block w-full cursor-pointer text-left outline-none"
      style={{
        borderRadius: isActive ? 20 : 0,
        background: isActive ? 'rgba(244, 244, 244, 0.72)' : 'transparent',
        transition: 'background 0.25s ease, border-radius 0.25s ease',
        ...style,
      }}
      aria-expanded={isActive}
    >
      <span className={`block ${isActive ? 'px-6 py-9 sm:px-7 lg:px-8' : 'px-6 py-8 sm:px-7 sm:py-9 lg:px-8'}`} style={{ paddingTop: isActive ? '2.694rem' : '2.444rem', paddingBottom: isActive ? '2.694rem' : '2.444rem' }}>
        <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <span
            className="font-medium leading-tight"
            style={{
              color: isActive ? '#111827' : '#202321',
              overflowWrap: 'anywhere',
              transition: 'color 0.25s ease',
              fontSize: 'clamp(1.125rem, 0.75vw + 0.75rem, 1.5rem)',
            }}
          >
            {item.school}
          </span>
          <span
            className={`${isActive ? 'text-sm sm:text-base' : 'hidden text-sm sm:inline sm:text-base'} leading-relaxed text-left sm:text-right`}
            style={{ color: isActive ? '#0671A4' : '#7A7D72' }}
          >
            <span>{item.period}{item.date && isActive ? <>{' · '}<span style={{ color: '#7A7D72' }}>{item.date}</span></> : ''}</span>
          </span>
        </span>

        <AnimatePresence initial={false}>
          {isActive && (
            <motion.span
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="block overflow-hidden"
            >
              <span className="block pt-6">
                <span
                  className="block leading-relaxed"
                  style={{ color: '#515850', fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}
                >
                  {item.degree}
                </span>
                <span
                  className="mt-5 block leading-relaxed"
                  style={{ color: '#515850', fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}
                >
                  {item.description}
                </span>
                <span className="mt-5 block space-y-5">
                  {item.bullets.map((bullet) => (
                    <span
                      key={bullet}
                      className="block leading-relaxed"
                      style={{ color: '#515850', fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}
                    >
                      {bullet}
                    </span>
                  ))}
                </span>
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  )
}

export function Education() {
  const [activeId, setActiveId] = useState<EduId>('cornell')
  const mobileVisualRef = useRef<HTMLDivElement>(null)
  const desktopVisualRef = useRef<HTMLDivElement>(null)
  const [visualHeight, setVisualHeight] = useState(0)
  const [stableColumnFloor, setStableColumnFloor] = useState(0)
  const ghostRefs = useRef<Map<EduId, HTMLDivElement | null>>(new Map())
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  )
  const active = items.find((item) => item.id === activeId) ?? items[0]

  useEffect(() => {
    const el = desktopVisualRef.current
    if (!el) return
    const update = () => {
      setVisualHeight(el.getBoundingClientRect().height)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    const measure = () => {
      let max = 0
      ghostRefs.current.forEach((el) => {
        if (el) max = Math.max(max, el.offsetHeight)
      })
      setStableColumnFloor((prev) => (max > 0 && max !== prev ? max : prev))
    }
    measure()
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure)
    }
    const ro = new ResizeObserver(measure)
    ghostRefs.current.forEach((el) => {
      if (el) ro.observe(el)
    })
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleSelect = (id: EduId) => {
    setActiveId(id)
  }

  const listColumnMinHeight = Math.max(visualHeight, stableColumnFloor)

  return (
    <Section
      id="education"
      className="education-section relative"
      style={{
        background: isMobile
          ? 'linear-gradient(to bottom, #f4f4f4 0%, #E4EFF5 64px, #E4EFF5 100%)'
          : 'linear-gradient(to bottom, #f4f4f4 0%, #f4f4f4 calc(clamp(11rem, 24vh, 20rem) - 61px), #E4EFF5 calc(clamp(11rem, 24vh, 20rem) - 61px), #E4EFF5 100%)',
        paddingTop: isMobile ? 'clamp(6rem, 13vh, 10rem)' : 'clamp(11rem, 24vh, 20rem)',
        paddingBottom: 'clamp(7rem, 12vh, 10rem)',
      }}
    >
      <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <GradientText as="h2" className="font-normal" style={{ fontSize: 'clamp(1.5rem, 1vw + 1rem, 1.875rem)' }}>
            Education
          </GradientText>
          <p
            className="mt-3 max-w-2xl leading-relaxed"
            style={{ color: '#4B5563', fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}
          >
            {activeId === 'cornell'
              ? 'Pursuing a B.A. in Computer Science with a minor in AI at Cornell University.'
              : 'Earned my International Baccalaureate Diploma at Millard North High School.'}
          </p>
        </div>
      </div>

      <div ref={mobileVisualRef} className="mt-8 scroll-mt-24 lg:hidden">
        <VisualCard item={active} />
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:mt-11 lg:grid-cols-12 lg:gap-14">
        <div className="hidden lg:col-span-6 lg:block">
          <div className="lg:sticky lg:top-24">
            <div ref={desktopVisualRef}>
              <VisualCard item={active} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6" style={{ position: 'relative' }}>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              visibility: 'hidden',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          >
            {items.map((scenario) => (
              <div
                key={`ghost-${scenario.id}`}
                ref={(el) => { ghostRefs.current.set(scenario.id, el) }}
                className="flex flex-col gap-4"
                style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
              >
                {items.map((item) => (
                  <ListRow
                    key={item.id}
                    item={item}
                    isActive={item.id === scenario.id}
                    onClick={() => {}}
                  />
                ))}
              </div>
            ))}
          </div>

          <div
            className="flex flex-col gap-4"
            style={visualHeight > 0 ? { minHeight: listColumnMinHeight } : undefined}
          >
            {items.map((item) => (
              <div key={item.id} style={item.id === activeId ? { flex: 1, display: 'flex', flexDirection: 'column' } : undefined}>
                <ListRow
                  item={item}
                  isActive={item.id === activeId}
                  onClick={() => handleSelect(item.id)}
                  style={item.id === activeId ? { flex: 1 } : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </Section>
  )
}
