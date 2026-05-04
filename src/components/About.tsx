import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, useAnimation, type PanInfo } from 'framer-motion'
import { GradientText } from './ui/gradient-text'
import { heroStagger, heroChild, staggerContainer } from '../lib/animations'

interface TechItem {
  name: string
  icon: string
  url: string
  blurb?: string
}

const networkxBlueFilter = 'brightness(0) saturate(100%) invert(30%) sepia(80%) saturate(700%) hue-rotate(170deg) brightness(90%) contrast(95%)'

function getIconSrc(icon: string, hovered: boolean) {
  if (!hovered) return icon
  if (icon.includes('/confluence/0671A4')) return icon.replace('/0671A4', '/4C9AFF')
  if (icon.includes('/posthog/0671A4')) return icon.replace('/0671A4', '/F9BD2B')
  return icon.replace('/0671A4', '')
}

function SmallCard({ tech }: { tech: TechItem }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [iconLoaded, setIconLoaded] = useState(false)
  const [iconFailed, setIconFailed] = useState(false)
  const canHoverRef = useRef(false)
  const iconSize = tech.name === 'Apache HTTP Server' ? 40 : tech.name === 'YAML' ? 24 : 32
  const accentColor = getTechAccentColor(tech)
  const borderColor = hovered ? accentColor : 'rgba(6, 113, 164, 0.3)'
  const textColor = hovered ? accentColor : '#0671A4'

  function SmallCard({ tech }: { tech: TechItem }) {
    const [hovered, setHovered] = useState(false)
    const [pressed, setPressed] = useState(false)
    const [iconLoaded, setIconLoaded] = useState(false)
    const [iconFailed, setIconFailed] = useState(false)
    const canHoverRef = useRef(false)
    const iconSize = tech.name === 'Apache HTTP Server' ? 40 : tech.name === 'YAML' ? 24 : 32
    const accentColor = getTechAccentColor(tech)
    const borderColor = hovered ? accentColor : 'rgba(6, 113, 164, 0.3)'
    const textColor = hovered ? accentColor : '#0671A4'

    useEffect(() => {
      const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
      const update = () => {
        canHoverRef.current = mql.matches
      }
      update()
      mql.addEventListener('change', update)
      return () => mql.removeEventListener('change', update)
    }, [])

    useEffect(() => {
      let cancelled = false

      const baseSrc = getIconSrc(tech.icon, false)
      const hoverSrc = getIconSrc(tech.icon, true)
      const base = new Image()
      base.referrerPolicy = 'no-referrer'
      base.crossOrigin = 'anonymous'
      base.src = baseSrc
      base.onload = () => {
        if (!cancelled) setIconLoaded(true)
      }
      base.onerror = () => {
        if (!cancelled) setIconLoaded(true)
      }

      if (hoverSrc !== baseSrc) {
        const hoverImg = new Image()
        hoverImg.referrerPolicy = 'no-referrer'
        hoverImg.crossOrigin = 'anonymous'
        hoverImg.src = hoverSrc
      }

      return () => {
        cancelled = true
      }
    }, [tech.icon])

    return (
      <div
        className="rounded-xl flex items-center px-5 cursor-pointer select-none relative"
        style={{
          width: 220,
          height: 146,
          background: hovered ? '#FFFFFF' : '#F5F5F5',
          border: `1.5px solid ${borderColor}`,
          transform: pressed ? 'scale(0.97)' : hovered ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
          zIndex: hovered ? 20 : 1,
          boxShadow: hovered
            ? '0 16px 48px rgba(6, 113, 164, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)'
            : '0 4px 12px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
          gap: iconFailed ? 0 : 12,
          justifyContent: iconFailed ? 'center' : 'flex-start',
        }}
        onMouseEnter={() => { if (canHoverRef.current) setHovered(true) }}
        onMouseLeave={() => { if (canHoverRef.current) { setHovered(false); setPressed(false) } }}
        onMouseDown={() => { if (canHoverRef.current) setPressed(true) }}
        onMouseUp={() => { if (canHoverRef.current) setPressed(false) }}
        onClick={() => window.open(tech.url, '_blank')}
      >
        {!iconFailed ? (
          <div className="relative shrink-0" style={{ width: iconSize, height: iconSize }}>
            {!iconLoaded && (
              <div
                className="absolute inset-0 rounded-md animate-pulse"
                style={{ background: 'rgba(6, 113, 164, 0.14)' }}
              />
            )}
            <img
              src={getIconSrc(tech.icon, hovered)}
              alt={tech.name}
              className="w-full h-full shrink-0"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              style={{
                opacity: iconLoaded ? 1 : 0,
                filter: (tech.name === 'NetworkX' || tech.name === 'Claude API' || tech.name === 'Flask') && !hovered ? networkxBlueFilter : undefined,
                transform: hovered ? 'rotate(-8deg) scale(1.1)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease, opacity 0.22s ease',
              }}
              onLoad={() => setIconLoaded(true)}
              onError={() => {
                setIconLoaded(true)
                setIconFailed(true)
              }}
            />
          </div>
        ) : null}
        <span
          className="text-base font-medium"
          style={{ color: textColor, transition: 'color 0.2s ease', textAlign: iconFailed ? 'center' : 'left' }}
        >
          {tech.name}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={textColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute top-3 right-3"
          style={{
            opacity: hovered ? 0.7 : 0,
            transform: hovered ? 'translate(0, 0)' : 'translate(-4px, 4px)',
            transition: 'all 0.2s ease',
          }}
        >
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </div>
    )
  }

function TallCard({ tech }: { tech: TechItem }) {
    const [hovered, setHovered] = useState(false)
    const [pressed, setPressed] = useState(false)
    const [iconLoaded, setIconLoaded] = useState(false)
    const [iconFailed, setIconFailed] = useState(false)
    const canHoverRef = useRef(false)
    const iconSize = tech.name === 'Apache HTTP Server' ? 52 : tech.name === 'YAML' ? 30 : 40
    const tallBlurb = (tech.blurb ?? `Applied ${tech.name} in shipped projects and internal workflows`).replace(/[.\s]+$/, '')
    const accentColor = getTechAccentColor(tech)
    const borderColor = hovered ? accentColor : 'rgba(6, 113, 164, 0.3)'
    const textColor = hovered ? accentColor : '#0671A4'
    const blurbColor = hovered ? hexToRgba(accentColor, 0.75) : 'rgba(6, 113, 164, 0.7)'

    useEffect(() => {
      const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
      const update = () => {
        canHoverRef.current = mql.matches
      }
      update()
      mql.addEventListener('change', update)
      return () => mql.removeEventListener('change', update)
    }, [])

    useEffect(() => {
      let cancelled = false

      const baseSrc = getIconSrc(tech.icon, false)
      const hoverSrc = getIconSrc(tech.icon, true)
      const base = new Image()
      base.referrerPolicy = 'no-referrer'
      base.crossOrigin = 'anonymous'
      base.src = baseSrc
      base.onload = () => {
        if (!cancelled) setIconLoaded(true)
      }
      base.onerror = () => {
        if (!cancelled) setIconLoaded(true)
      }

      if (hoverSrc !== baseSrc) {
        const hoverImg = new Image()
        hoverImg.referrerPolicy = 'no-referrer'
        hoverImg.crossOrigin = 'anonymous'
        hoverImg.src = hoverSrc
      }

      return () => {
        cancelled = true
      }
    }, [tech.icon])

    return (
      <div
        className="rounded-xl flex flex-col justify-center items-start px-6 gap-3 cursor-pointer select-none relative"
        style={{
          width: 300,
          height: 300,
          background: hovered ? '#FFFFFF' : '#F5F5F5',
          border: `1.5px solid ${borderColor}`,
          transform: pressed ? 'scale(0.97)' : hovered ? 'scale(1.03) translateY(-3px)' : 'scale(1)',
          zIndex: hovered ? 20 : 1,
          boxShadow: hovered
            ? '0 16px 48px rgba(6, 113, 164, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)'
            : '0 4px 12px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
          alignItems: iconFailed ? 'center' : 'flex-start',
          textAlign: iconFailed ? 'center' : 'left',
        }}
        onMouseEnter={() => { if (canHoverRef.current) setHovered(true) }}
        onMouseLeave={() => { if (canHoverRef.current) { setHovered(false); setPressed(false) } }}
        onMouseDown={() => { if (canHoverRef.current) setPressed(true) }}
        onMouseUp={() => { if (canHoverRef.current) setPressed(false) }}
        onClick={() => window.open(tech.url, '_blank')}
      >
        {!iconFailed ? (
          <div className="relative" style={{ width: iconSize, height: iconSize }}>
            {!iconLoaded && (
              <div
                className="absolute inset-0 rounded-md animate-pulse"
                style={{ background: 'rgba(6, 113, 164, 0.14)' }}
              />
            )}
            <img
              src={getIconSrc(tech.icon, hovered)}
              alt={tech.name}
              className="w-full h-full"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              style={{
                opacity: iconLoaded ? 1 : 0,
                filter: (tech.name === 'NetworkX' || tech.name === 'Claude API' || tech.name === 'Flask') && !hovered ? networkxBlueFilter : undefined,
                transform: hovered ? 'rotate(-8deg) scale(1.15)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease, opacity 0.22s ease',
              }}
              onLoad={() => setIconLoaded(true)}
              onError={() => {
                setIconLoaded(true)
                setIconFailed(true)
              }}
            />
          </div>
        ) : null}
        <span className="text-lg font-medium" style={{ color: textColor, transition: 'color 0.2s ease' }}>{tech.name}</span>
        <span className="text-sm leading-relaxed" style={{ color: blurbColor }}>{tallBlurb}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={textColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute top-4 right-4"
          style={{
            opacity: hovered ? 0.7 : 0,
            transform: hovered ? 'translate(0, 0)' : 'translate(-4px, 4px)',
            transition: 'all 0.2s ease',
          }}
        >
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </div>
    )
  }

export function ProjectMarquee({ active }: { active: boolean }) {
    const halfRef = useRef<HTMLDivElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const offsetRef = useRef(0)
    const rafRef = useRef<number>(0)
    const pausedRef = useRef(false)
    const speedMultiplierRef = useRef(1)
    const canHoverRef = useRef(false)

    const handleMouseEnter = useCallback(() => {
      if (canHoverRef.current) pausedRef.current = true
    }, [])
    const handleMouseLeave = useCallback(() => {
      if (canHoverRef.current) pausedRef.current = false
    }, [])

    useEffect(() => {
      const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
      const update = () => {
        canHoverRef.current = mql.matches
      }
      update()
      mql.addEventListener('change', update)

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          speedMultiplierRef.current = 2
        }
      }

      const onKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          speedMultiplierRef.current = 1
        }
      }

      const onWindowBlur = () => {
        speedMultiplierRef.current = 1
      }

      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      window.addEventListener('blur', onWindowBlur)

      return () => {
        mql.removeEventListener('change', update)
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('keyup', onKeyUp)
        window.removeEventListener('blur', onWindowBlur)
      }
    }, [])

    useEffect(() => {
      if (!active) return
      const GAP = 16 // gap-4 = 16px
      const baseSpeed = 1.5
      const tick = () => {
        if (!pausedRef.current) {
          const halfEl = halfRef.current
          if (halfEl) {
            const halfWidth = halfEl.offsetWidth + GAP
            offsetRef.current -= baseSpeed * speedMultiplierRef.current
            if (offsetRef.current <= -halfWidth) {
              offsetRef.current += halfWidth
            }
          }
          if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${offsetRef.current}px)`
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(rafRef.current)
    }, [active])

    // Build a full pass that exhausts all tech items before repeating.
    const buildItems = useCallback((keyPrefix: string) => {
      const nodes: React.ReactNode[] = []
      const majorQueue = [...majorTech]
      const minorQueue = [...minorTech]
      let i = 0

      const pullMinorForTall = () => {
        const idx = minorQueue.findIndex(
          (t) => t.name !== 'YAML' && t.name !== 'CodeMirror' && t.name !== 'Leaflet' && t.name !== 'Pinia'
        )
        if (idx >= 0) return minorQueue.splice(idx, 1)[0]
        return minorQueue.shift()
      }

      while (majorQueue.length > 0 || minorQueue.length > 0) {
        const tallTech = majorQueue.shift() ?? pullMinorForTall()
        if (!tallTech) break

        nodes.push(
          <div key={`${keyPrefix}-tall-${i}`} className="shrink-0">
            <TallCard tech={tallTech} />
          </div>
        )

        const firstSmall = minorQueue.shift() ?? majorQueue.shift()
        const secondSmall = minorQueue.shift() ?? majorQueue.shift()

        if (!firstSmall && !secondSmall) break

        nodes.push(
          <div key={`${keyPrefix}-small-${i}`} className="shrink-0 flex flex-col gap-2">
            {firstSmall && <SmallCard tech={firstSmall} />}
            {secondSmall && <SmallCard tech={secondSmall} />}
          </div>
        )

        i++
      }
      return nodes
    }, [])

    return (
      <div
        className="w-full overflow-visible"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={trackRef}
          className="flex gap-4 w-max items-start"
          style={{ willChange: 'transform' }}
        >
          <div ref={halfRef} className="flex gap-4 items-start shrink-0">
            {buildItems('a')}
          </div>
          <div className="flex gap-4 items-start shrink-0">
            {buildItems('b')}
          </div>
        </div>
      </div>
    )
  }

const CARDS: {
  id: string
  image: string
  caption: string
  bgSize?: string
  bgPosition?: string
  topLeftBlue?: boolean
}[] = [
  { id: 'card-1', image: '/img3.jpg', caption: 'Cornell Data Strategy Meeting' },
  { id: 'card-2', image: '/team-presentation.png', caption: 'Stablecoin Presentation at Cornell Hackathon' },
  { id: 'card-3', image: '/img3.png', caption: 'Formal Organizing Group' },
  { id: 'card-6', image: '/treman-hiking.png', caption: 'Hiking in Robert H. Treman State Park', topLeftBlue: true },
  { id: 'card-4', image: '/card-3.png', caption: 'Eagle Scout Project' },
  { id: 'card-5', image: '/coh.png', caption: 'After Eagle Scout Board of Review', bgSize: '180%', bgPosition: 'center center' },
]

function ThrowableCard({ card, zIndex, rotation, imageLoaded, onGone, onGrab }: {
  card: typeof CARDS[number]
  zIndex: number
  rotation: number
  imageLoaded: boolean
  onGone: (id: string) => void
  onGrab?: () => void
}) {
  const controls = useAnimation()

  const handleDragEnd = useCallback(async (_: unknown, info: PanInfo) => {
    const vx = info.velocity.x
    const vy = info.velocity.y
    const speed = Math.sqrt(vx * vx + vy * vy)

    if (speed > 300) {
      const s = 2000 / speed
      await controls.start({
        x: vx * s,
        y: vy * s,
        transition: { duration: 0.5, ease: 'easeOut' },
      })
      onGone(card.id)
      controls.set({ x: 0, y: 0, scale: 0.95 })
      await controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.25, ease: 'easeOut' },
      })
    } else {
      controls.start({
        x: 0,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 25 },
      })
    }
  }, [controls, card.id, onGone])

  return (
    <motion.div
      drag
      onDragStart={onGrab}
      dragElastic={0.8}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ rotate: rotation }}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="absolute inset-0 group cursor-grab rounded-2xl overflow-hidden"
      style={{
        zIndex,
        rotate: rotation,
        border: '1.5px solid rgba(6, 113, 164, 0.3)',
        boxSizing: 'border-box',
        backgroundClip: 'padding-box',
        backgroundImage: imageLoaded
          ? card.topLeftBlue
            ? `linear-gradient(145deg, rgba(6,113,164,0.5) 0%, rgba(56,189,248,0.3) 36%, transparent 65%), url('${card.image}')`
            : `linear-gradient(135deg, rgba(6,113,164,0.3), rgba(56,189,248,0.2), transparent 60%), url('${card.image}')`
          : card.topLeftBlue
            ? 'linear-gradient(145deg, rgba(6,113,164,0.34), rgba(56,189,248,0.22), rgba(6,113,164,0.1))'
            : 'linear-gradient(135deg, rgba(6,113,164,0.22), rgba(56,189,248,0.14), rgba(6,113,164,0.08))',
        backgroundSize: card.bgSize ?? 'cover',
        backgroundPosition: card.bgPosition ?? 'center',
        filter: 'saturate(1.3) contrast(1.1) brightness(1.05)',
        transition: 'background-image 0.25s ease',
      }}
    >
      {!imageLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: 'rgba(255, 255, 255, 0.22)' }}
        />
      )}
      <span className="absolute bottom-0 left-0 right-0 px-4 py-3 text-white text-xs font-medium bg-gradient-to-t from-[rgba(6,113,164,0.7)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl">
        {card.caption}
      </span>
    </motion.div>
  )
}

export function About() {
  // order[0] = top of stack (highest z), order[last] = bottom
  const [order, setOrder] = useState(() => CARDS.map((_, i) => i))
  const [hasGrabbed, setHasGrabbed] = useState(false)
  const [marqueeActive, setMarqueeActive] = useState(false)
  const [loadedCardImages, setLoadedCardImages] = useState<Record<string, boolean>>({})
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setMarqueeActive(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false

    CARDS.forEach((card) => {
      const img = new Image()
      img.src = card.image
      img.onload = () => {
        if (!cancelled) {
          setLoadedCardImages((prev) => ({ ...prev, [card.id]: true }))
        }
      }
      img.onerror = () => {
        if (!cancelled) {
          setLoadedCardImages((prev) => ({ ...prev, [card.id]: true }))
        }
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const handleGrab = useCallback(() => {
    setHasGrabbed(true)
  }, [])

  const handleGone = useCallback((id: string) => {
    setOrder(prev => {
      const cardIdx = CARDS.findIndex(c => c.id === id)
      return [...prev.filter(i => i !== cardIdx), cardIdx]
    })
  }, [])

  const rotations = [-8, -3, 2, 6, -5, 4]

  return (
    <section ref={sectionRef} id="about" className="relative min-h-full lg:h-full flex flex-col lg:flex-row items-center px-6 pt-[calc(clamp(6rem,14dvh,8rem)+env(safe-area-inset-top))] pb-[clamp(6rem,14dvh,9rem)] lg:py-0 overflow-visible" style={{ background: 'var(--color-surface, #EFF3F8)' }}>
      <motion.div
        className="mx-auto max-w-7xl w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        variants={heroStagger}
        initial="hidden"
        animate={marqueeActive ? 'visible' : 'hidden'}
      >
        {/* Text */}
        <motion.div variants={heroChild}>
          <motion.div className="lg:-mt-[16px]" variants={staggerContainer}>
            <motion.div variants={heroChild}>
              <GradientText as="h2" className="text-2xl lg:text-3xl font-normal mb-1">
                About me
              </GradientText>
            </motion.div>
            <motion.p variants={heroChild} className="text-black text-lg lg:text-xl leading-relaxed mb-4">
              I'm a Computer Science student at Cornell minoring in AI, originally
              from Nebraska. I am really interested in building and working with full stack web
              apps and experimenting with ML models.
            </motion.p>
            <motion.p variants={heroChild} className="text-black text-lg lg:text-xl leading-relaxed mb-4">
              Lately I've been diving deep into web3, stablecoins, and IPFS, the idea of
              programmable money and decentralized finance is something I enjoy working with and learning about. I'm always looking for ways to connect what I'm learning in AI
              with applications outside of the classroom.
            </motion.p>
            <motion.p variants={heroChild} className="text-black text-lg lg:text-xl leading-relaxed">
              Outside of code, I'm an Eagle Scout who still loves getting outdoors,
              camping, hiking, that kind of thing. When I'm not on a trail, you'll
              probably find me gaming, tinkering with some new tech, or catching up
              on anime and other shows.
            </motion.p>
          </motion.div>

        </motion.div>

        {/* Throwable Cards */}
        <motion.div variants={heroChild} className="flex flex-col items-center justify-center lg:ml-[6vw] mt-[clamp(2.5rem,8dvh,5rem)] lg:mt-0 lg:-mt-[2vh] mb-[clamp(4rem,10dvh,6rem)] lg:mb-0">
          <div className="relative w-[min(calc(100vw-var(--mobile-card-inset)),400px)] lg:w-[400px] aspect-[20/21]">
            {CARDS.map((card, i) => (
              <ThrowableCard
                key={card.id}
                card={card}
                zIndex={CARDS.length - order.indexOf(i)}
                rotation={rotations[i]}
                imageLoaded={!!loadedCardImages[card.id]}
                onGone={handleGone}
                onGrab={handleGrab}
              />
            ))}
          </div>
          <motion.p
            className="mt-4 lg:mt-6 flex items-center gap-2 text-sm select-none"
            style={{ color: 'rgba(6, 113, 164, 0.45)' }}
            animate={hasGrabbed ? { opacity: 0 } : { x: [0, 6, -6, 0] }}
            transition={hasGrabbed ? { duration: 0.2 } : { duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.3 16.8a2 2 0 0 1 3-2.6L8 16" />
            </svg>
            Drag to throw
          </motion.p>
        </motion.div>
      </motion.div>

    </section>
  )
}
