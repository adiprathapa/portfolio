import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { currentlyEnjoying, favoriteAnime, MAL_LIST_URL, type AnimeEntry } from '../data/anime'
import { posthog } from '../lib/analytics'
import { useMediaQuery } from '../hooks/useMediaQuery'
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

function ClipPreview({ src, active, warm }: { src: string; active: boolean; warm: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (active) video.play().catch(() => undefined)
    else video.pause()
  }, [active])

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload={warm ? 'auto' : 'none'}
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      onPlaying={() => setPlaying(true)}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      style={{ opacity: active && playing ? 1 : 0, transition: 'opacity 250ms ease' }}
    />
  )
}

function AnimeCard({ entry, eager = false, badge, canPreview = false, warmClips = false }: { entry: AnimeEntry; eager?: boolean; badge?: string; canPreview?: boolean; warmClips?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const clip = canPreview ? entry.clip : undefined

  const body = (
    <>
      <div
        className="relative aspect-[7/10] overflow-hidden rounded-xl transition-[transform,box-shadow] duration-300 ease-out motion-safe:group-hover:-translate-y-1 group-hover:shadow-[0_16px_48px_rgba(6,113,164,0.12),0_4px_12px_rgba(0,0,0,0.05)]"
        style={{ border: `1px solid ${PRIMARY.a15}`, boxShadow: SHADOW.card, backgroundColor: SURFACE.panel }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Cover entry={entry} eager={eager} />
        {clip && <ClipPreview src={clip} active={hovered} warm={warmClips} />}
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
  const canPreview = finePointer && !reduceMotion

  const [warmClips, setWarmClips] = useState(false)

  useEffect(() => {
    if (!canPreview) return
    const id = window.setTimeout(() => setWarmClips(true), CLIP_WARM_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [canPreview])

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
          className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 font-medium transition-colors duration-200 hover:bg-[rgba(6,113,164,0.08)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0671A4]"
          style={{ color: COLOR.primary, border: `1.5px solid ${PRIMARY.a30}`, fontSize: TEXT.link }}
        >
          See my full list on MyAnimeList <span aria-hidden="true">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </motion.header>

      <motion.ul className={`mt-10 lg:mt-12 ${GRID}`} variants={stagger} initial={initial} animate="visible">
        {FAVORITES.map((entry, i) => (
          <motion.li key={entry.title} variants={rise}>
            <AnimeCard entry={entry} eager={i < 6} canPreview={canPreview} warmClips={warmClips} />
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
          {currentlyEnjoying.map((entry) => (
            <motion.li key={entry.title} variants={rise}>
              <AnimeCard entry={entry} badge={entry.status} canPreview={canPreview} warmClips={warmClips} />
            </motion.li>
          ))}
        </motion.ul>
      </section>
    </div>
  )
}
