import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Section } from './ui/section'
import { GradientText } from './ui/gradient-text'
import { education, type EducationId, type EducationItem } from '../data/education'
import { CARD_BORDER, CARD_RADIUS, COLOR, SURFACE, TEXT } from '../lib/theme'
import { useElementSize } from '../hooks/useElementSize'
import { useIsMobile } from '../hooks/useMediaQuery'

function VisualCard({ item }: { item: EducationItem }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ borderRadius: CARD_RADIUS, border: CARD_BORDER, width: 580, maxWidth: '100%', aspectRatio: '1 / 1' }}
    >
      <img src={item.bgImage} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ transform: 'scale(1.02)' }} />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${item.color}15 0%, ${item.color}40 58%, ${item.color}60 100%)` }}
      />
    </div>
  )
}

const BODY_STYLE: CSSProperties = { color: COLOR.prose, fontSize: TEXT.body }

function ListRow({ item, isActive, onClick, style }: {
  item: EducationItem
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
        borderRadius: isActive ? CARD_RADIUS : 0,
        background: isActive ? 'rgba(244, 244, 244, 0.72)' : 'transparent',
        transition: 'background 0.25s ease, border-radius 0.25s ease',
        ...style,
      }}
      aria-expanded={isActive}
    >
      <span
        className="block px-6 sm:px-7 lg:px-8"
        style={{ paddingTop: isActive ? '2.694rem' : '2.444rem', paddingBottom: isActive ? '2.694rem' : '2.444rem' }}
      >
        <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <span
            className="font-medium leading-tight"
            style={{
              color: isActive ? COLOR.heading : '#202321',
              overflowWrap: 'anywhere',
              transition: 'color 0.25s ease',
              fontSize: TEXT.h3,
            }}
          >
            {item.school}
          </span>
          <span
            className={`${isActive ? 'text-sm sm:text-base' : 'hidden text-sm sm:inline sm:text-base'} text-left leading-relaxed sm:text-right`}
            style={{ color: isActive ? COLOR.primary : COLOR.muted }}
          >
            {item.location}
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
                <span className="block leading-relaxed" style={BODY_STYLE}>{item.degree}</span>
                <span className="mt-5 block leading-relaxed" style={BODY_STYLE}>{item.description}</span>
                <span className="mt-5 block space-y-5">
                  {item.bullets.map((bullet) => (
                    <span key={bullet} className="block leading-relaxed" style={BODY_STYLE}>{bullet}</span>
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

/**
 * Measures every expanded state off screen and returns the tallest, so the
 * list column keeps one height and the page below it never jumps.
 */
function useStableColumnFloor() {
  const ghostRefs = useRef<Map<EducationId, HTMLDivElement | null>>(new Map())
  const [floor, setFloor] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      let max = 0
      ghostRefs.current.forEach((el) => { if (el) max = Math.max(max, el.offsetHeight) })
      setFloor((prev) => (max > 0 && max !== prev ? max : prev))
    }
    measure()
    document.fonts?.ready.then(measure)
    const ro = new ResizeObserver(measure)
    ghostRefs.current.forEach((el) => { if (el) ro.observe(el) })
    return () => ro.disconnect()
  }, [])

  const ghosts = (
    <div
      aria-hidden
      style={{ position: 'absolute', top: 0, left: 0, right: 0, visibility: 'hidden', pointerEvents: 'none', zIndex: -1 }}
    >
      {education.map((expanded) => (
        <div
          key={`ghost-${expanded.id}`}
          ref={(el) => { ghostRefs.current.set(expanded.id, el) }}
          className="flex flex-col gap-4"
          style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        >
          {education.map((item) => (
            <ListRow key={item.id} item={item} isActive={item.id === expanded.id} onClick={() => {}} />
          ))}
        </div>
      ))}
    </div>
  )

  return { floor, ghosts }
}

export function Education() {
  const [activeId, setActiveId] = useState<EducationId>(education[0].id)
  const visualRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { height: visualHeight } = useElementSize(visualRef)
  const { floor, ghosts } = useStableColumnFloor()

  const active = education.find((item) => item.id === activeId) ?? education[0]

  return (
    <Section
      id="education"
      className="education-section relative"
      style={{
        background: isMobile
          ? `linear-gradient(to bottom, ${SURFACE.page} 0%, ${SURFACE.tint} 64px, ${SURFACE.tint} 100%)`
          : `linear-gradient(to bottom, ${SURFACE.page} 0%, ${SURFACE.page} calc(clamp(11rem, 24vh, 20rem) - 61px), ${SURFACE.tint} calc(clamp(11rem, 24vh, 20rem) - 61px), ${SURFACE.tint} 100%)`,
        paddingTop: isMobile ? 'clamp(6rem, 13vh, 10rem)' : 'clamp(11rem, 24vh, 20rem)',
        paddingBottom: 'clamp(7rem, 12vh, 10rem)',
      }}
    >
      <div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <GradientText as="h2" className="font-normal" style={{ fontSize: TEXT.h2 }}>Education</GradientText>
            <p className="mt-3 max-w-2xl leading-relaxed" style={{ color: COLOR.body, fontSize: TEXT.body }}>
              {active.summary}
            </p>
          </div>
        </div>

        <div className="mt-8 scroll-mt-24 lg:hidden">
          <VisualCard item={active} />
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:mt-11 lg:grid-cols-12 lg:gap-14">
          <div className="hidden lg:col-span-6 lg:block">
            <div className="lg:sticky lg:top-24">
              <div ref={visualRef}>
                <VisualCard item={active} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6" style={{ position: 'relative' }}>
            {ghosts}
            <div
              className="flex flex-col gap-4"
              style={visualHeight > 0 ? { minHeight: Math.max(visualHeight, floor) } : undefined}
            >
              {education.map((item) => {
                const isActive = item.id === activeId
                return (
                  <div key={item.id} style={isActive ? { flex: 1, display: 'flex', flexDirection: 'column' } : undefined}>
                    <ListRow
                      item={item}
                      isActive={isActive}
                      onClick={() => setActiveId(item.id)}
                      style={isActive ? { flex: 1 } : undefined}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
