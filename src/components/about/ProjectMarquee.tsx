import { useEffect, useRef, type ReactNode } from 'react'
import { majorTech, minorTech, type TechItem } from '../../data/tech'
import { useCanHoverRef } from '../../hooks/useMediaQuery'
import { TechCard } from './TechCard'

const BASE_SPEED = 1.5
/** Gap between the two halves of the track, matching the flex `gap-4`. */
const TRACK_GAP = 16

/**
 * Deals every tech item into repeating "one tall card + two small cards"
 * groups, so a full pass shows the whole stack before it repeats.
 */
function buildGroups(keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const major = [...majorTech]
  const minor = [...minorTech]
  let i = 0

  const pullMinorForTall = () => {
    const idx = minor.findIndex((t) => !t.neverTall)
    return idx >= 0 ? minor.splice(idx, 1)[0] : minor.shift()
  }

  while (major.length > 0 || minor.length > 0) {
    const tall: TechItem | undefined = major.shift() ?? pullMinorForTall()
    if (!tall) break

    nodes.push(
      <div key={`${keyPrefix}-tall-${i}`} className="shrink-0">
        <TechCard item={tall} variant="tall" />
      </div>,
    )

    const first = minor.shift() ?? major.shift()
    const second = minor.shift() ?? major.shift()
    if (!first && !second) break

    nodes.push(
      <div key={`${keyPrefix}-small-${i}`} className="flex shrink-0 flex-col gap-2">
        {first && <TechCard item={first} variant="small" />}
        {second && <TechCard item={second} variant="small" />}
      </div>,
    )

    i++
  }

  return nodes
}

/** Infinite horizontal tech marquee. Pauses on hover, doubles speed on ←. */
export function ProjectMarquee({ active }: { active: boolean }) {
  const halfRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const offset = useRef(0)
  const halfWidth = useRef(0)
  const raf = useRef<number>(0)
  const paused = useRef(false)
  const speedMultiplier = useRef(1)
  const canHover = useCanHoverRef()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') speedMultiplier.current = 2 }
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') speedMultiplier.current = 1 }
    const onBlur = () => { speedMultiplier.current = 1 }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  useEffect(() => {
    const el = halfRef.current
    if (!el) return
    const update = () => { halfWidth.current = el.offsetWidth + TRACK_GAP }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!active) return
    const tick = () => {
      if (!paused.current) {
        if (halfWidth.current > 0) {
          offset.current -= BASE_SPEED * speedMultiplier.current
          if (offset.current <= -halfWidth.current) offset.current += halfWidth.current
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${offset.current}px)`
        }
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active])

  return (
    <div
      className="w-full overflow-visible"
      onMouseEnter={() => { if (canHover.current) paused.current = true }}
      onMouseLeave={() => { if (canHover.current) paused.current = false }}
    >
      <div ref={trackRef} className="flex w-max items-start gap-4" style={{ willChange: 'transform' }}>
        <div ref={halfRef} className="flex shrink-0 items-start gap-4">{buildGroups('a')}</div>
        <div className="flex shrink-0 items-start gap-4">{buildGroups('b')}</div>
      </div>
    </div>
  )
}
