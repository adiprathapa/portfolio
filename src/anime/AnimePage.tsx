import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { currentlyEnjoying, favoriteAnime, MAL_LIST_URL, type AnimeEntry } from '../data/anime'
import { posthog } from '../lib/analytics'
import { useMediaQuery, useTabVisible } from '../hooks/useMediaQuery'
import { ArrowIcon } from '../components/ui/icons'
import { COLOR, PRIMARY, SHADOW, SURFACE, TEXT } from '../lib/theme'

const EASE = [0.22, 1, 0.36, 1] as const

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const CLIP_WARM_DELAY_MS = 1200
const FOCUS_SETTLE_MS = 80
const FOCUS_BAND = 0.3
const WARM_RANGE = 1.5
const ROW_TOLERANCE_PX = 8
const MIN_TURN_MS = 3000

const SAVE_DATA =
  typeof navigator !== 'undefined' &&
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true

type PreviewMode = 'hover' | 'scroll' | null

interface Focus {
  row: string[]
  turn: number
}

function zigzagCell(i: number) {
  return { gridColumn: (i % 2) + 1, gridRow: `${i + 1} / span 2` }
}

function sameKeys(a: Iterable<string>, b: Iterable<string>) {
  return [...a].join('\n') === [...b].join('\n')
}

function useScrollFocus(enabled: boolean) {
  const cards = useRef(new Map<string, HTMLElement>())
  const focusedRow = useRef<string[]>([])
  const [focus, setFocus] = useState<Focus>({ row: [], turn: 0 })
  const [nearby, setNearby] = useState<ReadonlySet<string>>(() => new Set())

  const register = useCallback((key: string, el: HTMLElement | null) => {
    if (el) cards.current.set(key, el)
    else cards.current.delete(key)
  }, [])

  useEffect(() => {
    if (!enabled) return
    let timer = 0
    let frame = 0

    const centerOffset = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect()
      return Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2)
    }

    const measure = () => {
      const height = window.innerHeight
      const placed = [...cards.current].map(([key, el]) => ({
        key,
        left: el.getBoundingClientRect().left,
        offset: centerOffset(el),
      }))
      const warm = placed.filter((c) => c.offset < height * WARM_RANGE).map((c) => c.key)
      setNearby((prev) => (sameKeys(prev, warm) ? prev : new Set(warm)))

      const best = Math.min(...placed.map((c) => c.offset))
      const row =
        best < height * FOCUS_BAND
          ? placed
              .filter((c) => c.offset - best < ROW_TOLERANCE_PX)
              .sort((a, b) => a.left - b.left)
              .map((c) => c.key)
          : []
      focusedRow.current = row
      setFocus((prev) => (sameKeys(prev.row, row) ? prev : { row, turn: 0 }))
    }

    const releaseIfLeft = () => {
      frame = 0
      const el = cards.current.get(focusedRow.current[0])
      if (!el || centerOffset(el) < window.innerHeight * FOCUS_BAND) return
      focusedRow.current = []
      setFocus({ row: [], turn: 0 })
    }

    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(measure, FOCUS_SETTLE_MS)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(releaseIfLeft)
      schedule()
    }

    schedule()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', schedule)
    }
  }, [enabled])

  const advance = useCallback(() => {
    setFocus((prev) => ({ ...prev, turn: (prev.turn + 1) % Math.max(prev.row.length, 1) }))
  }, [])

  return {
    register,
    nearby,
    advance,
    focused: enabled ? focus.row[focus.turn] : undefined,
    shared: focus.row.length > 1,
  }
}

const FAVORITES = [...favoriteAnime].sort((a, b) => a.title.localeCompare(b.title))

const GRID = 'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-6 lg:gap-x-5 lg:gap-y-10'

function Cover({ entry, eager }: { entry: AnimeEntry; eager: boolean }) {
  if (!entry.image) {
    return (
      <div
        aria-hidden="true"
        className="flex h-full w-full items-center justify-center p-4 text-center"
        style={{
          backgroundColor: SURFACE.panel,
          backgroundImage: `radial-gradient(${PRIMARY.a20} 1px, transparent 1px), linear-gradient(160deg, ${SURFACE.tint} 0%, ${PRIMARY.a15} 100%)`,
          backgroundSize: '16px 16px, 100% 100%',
        }}
      >
        <span className="font-heading font-medium" style={{ color: COLOR.primary, fontSize: TEXT.h3, lineHeight: 1.2 }}>
          {entry.title}
        </span>
      </div>
    )
  }

  return (
    <img
      src={entry.image}
      alt=""
      width={420}
      height={600}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className="h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
    />
  )
}

function ClipPreview({ src, active, warm, onTurnDone }: { src: string; active: boolean; warm: boolean; onTurnDone?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const startedAt = useRef(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (active) {
      startedAt.current = performance.now()
      video.play().catch(() => undefined)
    } else {
      video.pause()
    }
  }, [active])

  const handleEnded = () => {
    const video = videoRef.current
    if (!video) return
    if (onTurnDone && performance.now() - startedAt.current >= MIN_TURN_MS) {
      onTurnDone()
      return
    }
    video.currentTime = 0
    video.play().catch(() => undefined)
  }

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop={!onTurnDone}
      playsInline
      preload={warm ? 'auto' : 'none'}
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      onPlaying={() => setPlaying(true)}
      onEnded={handleEnded}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      style={{ opacity: active && playing ? 1 : 0, transition: 'opacity 250ms ease' }}
    />
  )
}

interface AnimeCardProps {
  entry: AnimeEntry
  eager?: boolean
  badge?: string
  mode: PreviewMode
  focused: boolean
  warm: boolean
  onTurnDone?: () => void
  register: (key: string, el: HTMLElement | null) => void
}

function AnimeCard({ entry, eager = false, badge, mode, focused, warm, onTurnDone, register }: AnimeCardProps) {
  const [hovered, setHovered] = useState(false)
  const tabVisible = useTabVisible()
  const clip = mode ? entry.clip : undefined
  const active = tabVisible && (mode === 'hover' ? hovered : focused)
  const title = entry.title
  const cardRef = useCallback((el: HTMLDivElement | null) => register(title, el), [register, title])

  const body = (
    <>
      <div
        className="relative aspect-[7/10] overflow-hidden rounded-xl transition-[transform,box-shadow] duration-300 ease-out motion-safe:group-hover:-translate-y-1 group-hover:shadow-[0_16px_48px_rgba(6,113,164,0.12),0_4px_12px_rgba(0,0,0,0.05)]"
        style={{ border: `1px solid ${PRIMARY.a15}`, boxShadow: SHADOW.card, backgroundColor: SURFACE.panel }}
        ref={clip && mode === 'scroll' ? cardRef : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Cover entry={entry} eager={eager} />
        {clip && <ClipPreview src={clip} active={active} warm={warm} onTurnDone={focused ? onTurnDone : undefined} />}
        {badge && (
          <span
            className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.92)', color: COLOR.primary, boxShadow: SHADOW.button }}
          >
            {badge}
          </span>
        )}
      </div>
      <h3
        className="mt-3 font-heading font-medium text-heading transition-colors duration-200 group-hover:text-primary"
        style={{ fontSize: 'clamp(0.95rem, 0.3vw + 0.85rem, 1.0625rem)', lineHeight: 1.3 }}
      >
        {entry.title}
      </h3>
      {entry.note && (
        <p className="mt-1 leading-relaxed" style={{ color: COLOR.body, fontSize: TEXT.bodySm }}>
          {entry.note}
        </p>
      )}
    </>
  )

  if (!entry.url) return <div>{body}</div>

  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0671A4]"
    >
      {body}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

export function AnimePage() {
  const reduceMotion = useReducedMotion()
  const initial = reduceMotion ? false : 'hidden'
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const zigzag = useMediaQuery('(max-width: 639px)')
  const mode: PreviewMode = reduceMotion ? null : finePointer ? 'hover' : SAVE_DATA ? null : 'scroll'
  const scroll = useScrollFocus(mode === 'scroll')

  const [warmClips, setWarmClips] = useState(false)

  useEffect(() => {
    if (mode !== 'hover') return
    const id = window.setTimeout(() => setWarmClips(true), CLIP_WARM_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [mode])

  const cardProps = (entry: AnimeEntry) => ({
    entry,
    mode,
    focused: scroll.focused === entry.title,
    warm: mode === 'hover' ? warmClips : scroll.nearby.has(entry.title),
    onTurnDone: scroll.shared ? scroll.advance : undefined,
    register: scroll.register,
  })

  useEffect(() => {
    posthog?.capture('anime_page_viewed')
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-6">
      <motion.header
        className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between lg:mt-10"
        variants={rise}
        initial={initial}
        animate="visible"
      >
        <h1 className="gradient-text font-normal" style={{ fontSize: TEXT.h1, lineHeight: 1.1 }}>
          Some of my favorite anime
        </h1>
        <a
          href={MAL_LIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => posthog?.capture('anime_mal_link_clicked')}
          className="group inline-flex w-fit shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 font-medium transition-colors duration-200 hover:bg-[rgba(6,113,164,0.08)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0671A4]"
          style={{ color: COLOR.primary, border: `1.5px solid ${PRIMARY.a30}`, fontSize: TEXT.link }}
        >
          <span>See my full list on MyAnimeList</span>
          <ArrowIcon size={16} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </motion.header>

      <motion.ul className={`mt-10 lg:mt-12 ${GRID}`} variants={stagger} initial={initial} animate="visible">
        {FAVORITES.map((entry, i) => (
          <motion.li key={entry.title} variants={rise} style={zigzag ? zigzagCell(i) : undefined}>
            <AnimeCard {...cardProps(entry)} eager={i < 6} />
          </motion.li>
        ))}
      </motion.ul>

      <section aria-labelledby="currently-heading" className="mt-20 lg:mt-24">
        <h2 id="currently-heading" className="font-normal text-heading" style={{ fontSize: TEXT.h2 }}>
          Currently watching and reading
        </h2>
        <motion.ul
          className={`mt-6 ${GRID}`}
          variants={stagger}
          initial={initial}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {currentlyEnjoying.map((entry, i) => (
            <motion.li key={entry.title} variants={rise} style={zigzag ? zigzagCell(i) : undefined}>
              <AnimeCard {...cardProps(entry)} badge={entry.status} />
            </motion.li>
          ))}
        </motion.ul>
      </section>
    </div>
  )
}
