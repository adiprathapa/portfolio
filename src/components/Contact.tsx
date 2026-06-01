import { type FormEvent, type CSSProperties, useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, useMotionValue, animate, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { RippleButton } from './ui/ripple-button'
import { usePostHog } from '@posthog/react'

function Sticker({ src, alt, label, style, tooltipTop, tooltipBottom, tooltipOffsetX, hoverArea, disabled, rotation, constraintsRef, active = true, getNextZ }: { src: string; alt: string; label: string; style: CSSProperties; tooltipTop?: number; tooltipBottom?: number; tooltipOffsetX?: number; hoverArea?: CSSProperties; disabled?: boolean; rotation?: number; constraintsRef?: React.RefObject<HTMLDivElement | null>; active?: boolean; getNextZ?: () => number }) {
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [placedZ, setPlacedZ] = useState<number | undefined>(undefined)
  const stickerRef = useRef<HTMLDivElement>(null)
  const peelRef = useRef<HTMLDivElement>(null)
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  const lastTapRef = useRef(0)
  // Opaque pixel insets (fraction of image on each side that is transparent)
  const [opaqueInsets, setOpaqueInsets] = useState<{ top: number; left: number; right: number; bottom: number } | null>(null)
  const [dragBounds, setDragBounds] = useState<{ top: number; left: number; right: number; bottom: number } | undefined>()

  const resetPosition = useCallback(() => {
    animate(dragX, 0, { type: 'spring', stiffness: 300, damping: 25 })
    animate(dragY, 0, { type: 'spring', stiffness: 300, damping: 25 })
  }, [dragX, dragY])

  // Scan image pixels to find the bounding box of non-transparent content
  useEffect(() => {
    if (!active) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (data[(y * canvas.width + x) * 4 + 3] > 10) {
            if (x < minX) minX = x
            if (y < minY) minY = y
            if (x > maxX) maxX = x
            if (y > maxY) maxY = y
          }
        }
      }
      if (maxX >= minX && maxY >= minY) {
        setOpaqueInsets({
          top: minY / canvas.height,
          left: minX / canvas.width,
          right: 1 - (maxX + 1) / canvas.width,
          bottom: 1 - (maxY + 1) / canvas.height,
        })
      }
    }
    img.src = src
  }, [active, src])

  // Compute drag bounds from opaque pixel edges and lid surface, correcting for parent transforms
  useEffect(() => {
    if (disabled || !constraintsRef?.current || !stickerRef.current || !opaqueInsets) {
      setDragBounds(undefined)
      return
    }
    const id = requestAnimationFrame(() => {
      const lidEl = constraintsRef?.current
      const el = stickerRef.current
      if (!lidEl || !el) return
      const lid = lidEl.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      // Lid surface edges (inset from SVG viewBox padding)
      const lidLeft = lid.left + lid.width * 0.035
      const lidTop = lid.top + lid.height * 0.05
      const lidRight = lid.right - lid.width * 0.035
      const lidBottom = lid.bottom - lid.height * 0.045
      // Account for whileDrag scale (sticker grows 1.1x from center while dragging)
      const dragScale = 1.1
      const growX = rect.width * (dragScale - 1) / 2
      const growY = rect.height * (dragScale - 1) / 2
      // Visible content edges at dragged size (using pixel-scanned opaque bounds)
      const visLeft = rect.left - growX + opaqueInsets.left * (rect.width * dragScale)
      const visTop = rect.top - growY + opaqueInsets.top * (rect.height * dragScale)
      const visRight = rect.right + growX - opaqueInsets.right * (rect.width * dragScale)
      const visBottom = rect.bottom + growY - opaqueInsets.bottom * (rect.height * dragScale)
      // Convert from viewport space to element-local space (parent scale + zoom)
      const scaleX = rect.width / el.offsetWidth || 1
      const scaleY = rect.height / el.offsetHeight || 1
      setDragBounds({
        top: (lidTop - visTop) / scaleY,
        left: (lidLeft - visLeft) / scaleX,
        right: (lidRight - visRight) / scaleX,
        bottom: (lidBottom - visBottom) / scaleY,
      })
    })
    return () => cancelAnimationFrame(id)
  }, [disabled, constraintsRef, opaqueInsets])

  useEffect(() => {
    if (!hovered) return
    const dismiss = () => setHovered(false)
    window.addEventListener('scroll', dismiss, { passive: true })
    return () => window.removeEventListener('scroll', dismiss)
  }, [hovered])

  const isTouchDevice = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    window.matchMedia('(pointer: coarse)').matches ||
    window.innerWidth < 1024
  )

  const mouseHandlers = disabled || isTouchDevice ? {} : {
    onMouseEnter: () => { if (!isDragging) setHovered(true) },
    onMouseLeave: () => setHovered(false),
  }

  // Ref callback: measure tooltip on mount and clamp within viewport
  const tooltipRefCb = useCallback((el: HTMLDivElement | null) => {
    if (!el) return
    // Reset to default position first so measurement is from center
    el.style.left = '50%'
    el.style.transform = `translateX(calc(-50% + ${tooltipOffsetX ?? 0}px))`
    const rect = el.getBoundingClientRect()
    const pad = 8
    const vw = document.documentElement.clientWidth
    if (rect.left < pad) {
      const shift = pad - rect.left
      el.style.left = `calc(50% + ${shift}px)`
      el.style.transform = `translateX(calc(-50% + ${(tooltipOffsetX ?? 0) + shift}px))`
    } else if (rect.right > vw - pad) {
      const shift = rect.right - (vw - pad)
      el.style.left = `calc(50% - ${shift}px)`
      el.style.transform = `translateX(calc(-50% + ${(tooltipOffsetX ?? 0) - shift}px))`
    }
  }, [tooltipOffsetX])

  return (
    <motion.div
      ref={stickerRef}
      className="absolute select-none"
      style={{
        ...style,
        x: dragX,
        y: dragY,
        zIndex: isDragging ? 1000 : hovered ? 100 : placedZ,
        cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
      }}
      drag={!disabled}
      dragConstraints={dragBounds}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => {
        setIsDragging(true)
        setHovered(false)
        if (peelRef.current) {
          animate(peelRef.current, {
            rotateX: [0, 18, 4, 0],
            scale: [1, 1.04, 1.08, 1.1],
            filter: [
              'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
              'drop-shadow(0 8px 14px rgba(0,0,0,0.28))',
              'drop-shadow(0 10px 20px rgba(0,0,0,0.32))',
              'drop-shadow(0 12px 24px rgba(0,0,0,0.35))',
            ],
          }, { duration: 0.3, ease: [0.33, 0, 0.2, 1] })
        }
      }}
      onDragEnd={() => {
        setIsDragging(false)
        if (getNextZ) setPlacedZ(getNextZ())
        if (peelRef.current) {
          animate(peelRef.current, {
            rotateX: [0, -5, 1, 0],
            scale: [1.1, 0.96, 1.01, 1],
            filter: [
              'drop-shadow(0 12px 24px rgba(0,0,0,0.35))',
              'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
              'drop-shadow(0 2px 5px rgba(0,0,0,0.1))',
              'drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
            ],
          }, { duration: 0.3, ease: [0.33, 0, 0.2, 1] })
        }
      }}
      onTap={() => {
        const now = Date.now()
        if (now - lastTapRef.current < 300) resetPosition()
        lastTapRef.current = now
      }}
      {...(hoverArea ? {} : mouseHandlers)}
    >
      {hoverArea && (
        <div className="absolute" style={{ ...hoverArea, cursor: 'inherit' }} {...mouseHandlers} />
      )}
      <div style={{ perspective: 600 }}>
        <div
          ref={peelRef}
          style={{
            transformOrigin: 'center top',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
            willChange: 'transform, filter',
          }}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-auto pointer-events-none"
            style={{
              transition: isDragging ? 'none' : 'transform 0.2s ease',
              transform: `${rotation ? `rotate(${rotation}deg) ` : ''}${hovered && !isDragging ? 'scale(1.08)' : 'scale(1)'}`,
            }}
          />
        </div>
      </div>
      {hovered && !isDragging && (
        <div
          ref={tooltipRefCb}
          className="absolute whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium pointer-events-none"
          style={{
            left: '50%',
            transform: `translateX(calc(-50% + ${tooltipOffsetX ?? 0}px))`,
            ...(tooltipBottom != null ? { bottom: tooltipBottom } : { top: tooltipTop }),
            zIndex: 9999,
            background: 'rgba(15,15,15,0.85)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          }}
        >
          {label}
        </div>
      )}
    </motion.div>
  )
}

interface GameSticker {
  src: string
  name: string
  rotation?: number
  getStyle: (isLg: boolean) => CSSProperties
}

const GAME_STICKERS: GameSticker[] = [
  { src: '/sticker-claude.png', name: 'Claude', getStyle: (isLg) => ({ bottom: isLg ? 'calc(10% + 197px)' : 'calc(10% + 202px)', left: 'calc(52% + 25px)', width: '18%' }) },
  { src: '/sticker-nell.png', name: 'Cornell', getStyle: (isLg) => ({ bottom: isLg ? 'calc(10% + 260px)' : 'calc(10% + 285px)', left: 'calc(70% + 40px)', width: '16.2%' }) },
  { src: '/sticker-gemini.png', name: 'Coneflower', getStyle: () => ({ bottom: 'calc(10% + 90px)', left: 'calc(30% - 63px)', width: '28.52%' }) },
  { src: '/gemini-sticker.png', name: 'YC', getStyle: (isLg) => ({ top: isLg ? 'calc(10% - 51px)' : 'calc(10% - 59px)', bottom: 'auto', left: 'calc(8% + 5px)', width: '20%' }) },
  { src: '/sticker-c2s2.png', name: 'C2S2', getStyle: (isLg) => ({ bottom: isLg ? 'calc(10% + 105px)' : 'calc(10% + 110px)', left: 'calc(55% + 20px)', width: '15.04%' }) },
  { src: '/sticker-purple.png', name: 'Hackathon', getStyle: (isLg) => ({ bottom: isLg ? 'calc(10% + 210px)' : 'calc(10% + 215px)', left: 'calc(70% + 20px)', width: '22%' }) },
  { src: '/sticker-data.png', name: 'Data Strategy', getStyle: () => ({ bottom: 'calc(10% - 40px)', left: 'calc(6% - 72px)', width: '37%' }) },
  { src: '/sticker-tabs.png', name: 'Google', getStyle: (isLg) => ({ bottom: isLg ? 'calc(10% + 315px)' : 'calc(10% + 340px)', left: 'calc(34% + 130px)', width: '19.8%' }) },
  { src: '/sticker-acsu2.png', name: 'ACSU', getStyle: () => ({ bottom: 'calc(10% + 18px)', left: 'calc(68% + 17px)', width: '23.3%' }) },
  { src: '/sticker-acsu.png', name: "Riley's Way", getStyle: () => ({ bottom: 'calc(10% + 11px)', left: 'calc(55% - 13px)', width: '16%' }) },
  { src: '/sticker-tata.png', name: 'Tata-Cornell', getStyle: () => ({ bottom: 'calc(10% - 31px)', left: 'calc(30% - 86px)', width: '37%' }) },
  { src: '/sticker-frog.png', name: 'TrexQuant', getStyle: () => ({ bottom: 'calc(10% + 91px)', left: 'calc(70% + 40px)', width: '14.4%' }) },
  { src: '/sticker-gemini-char.png', name: 'Arts & Sciences', getStyle: () => ({ bottom: 'calc(10% + 115px)', left: 'calc(8% - 10px)', width: '18%' }) },
  { src: '/sticker-tab.png', name: 'tabs', getStyle: (isLg) => ({ bottom: isLg ? 'calc(10% + 243px)' : 'calc(10% + 253px)', left: isLg ? 'calc(16% + 180px)' : 'calc(16% + 185px)', width: '12.6%' }) },
  { src: '/sticker-cu.png', name: 'Civics Unplugged', getStyle: (isLg) => ({ bottom: isLg ? 'calc(10% + 280px)' : 'calc(10% + 305px)', left: 'calc(2% + 225px)', width: '12.6%' }) },
  { src: '/sticker-claude-confused.png', name: 'Claude Code', rotation: 30, getStyle: (isLg) => ({ bottom: isLg ? 'calc(10% + 209px)' : 'calc(10% + 219px)', left: 'calc(8% + 40px)', width: '18%' }) },
]

function getAccuracyMessage(acc: number) {
  if (acc >= 95) return 'Perfect!'
  if (acc >= 80) return 'Great!'
  if (acc >= 60) return 'Good!'
  if (acc >= 40) return 'Not bad'
  if (acc >= 20) return 'Close-ish'
  return 'Way off!'
}

function getFinalMessage(avg: number) {
  if (avg >= 90) return 'Sticker Master'
  if (avg >= 70) return 'Great Memory'
  if (avg >= 50) return 'Not Bad'
  if (avg >= 30) return 'Keep Practicing'
  return 'Try Again?'
}

export function Contact() {
  const posthog = usePostHog()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ctaHovered, setCtaHovered] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [visualsReady, setVisualsReady] = useState(false)
  const stickerZCounterRef = useRef(50)
  const bumpStickerZ = useCallback(() => ++stickerZCounterRef.current, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisualsReady(true)
          observer.disconnect()
        }
      },
      { rootMargin: '900px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const [isLg, setIsLg] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsLg(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const MOBILE_REF_WIDTH = 700
  const DESKTOP_REF_WIDTH = 651
  const DESKTOP_LEFT_OFFSET = 110
  const laptopContainerRef = useRef<HTMLDivElement>(null)
  const [laptopScale, setLaptopScale] = useState(1)
  const [, setMobileContainerWidth] = useState(375)
  useEffect(() => {
    const el = laptopContainerRef.current
    if (!el) return
    const update = () => {
      const w = el.clientWidth
      const vh = window.innerHeight
      setMobileContainerWidth(w)
      const refWidth = isLg ? DESKTOP_REF_WIDTH : MOBILE_REF_WIDTH
      // SVG aspect ratio is 1000/1500 ≈ 0.667; stickers overflow ~25% beyond SVG bounds
      const estimatedHeight = refWidth * 0.83
      const heightScale = (vh * 0.78) / estimatedHeight

      let widthScale: number
      if (isLg) {
        const available = Math.max(w - DESKTOP_LEFT_OFFSET, 100)
        widthScale = Math.min(available, DESKTOP_REF_WIDTH) / DESKTOP_REF_WIDTH
      } else {
        widthScale = (w * 0.85) / MOBILE_REF_WIDTH
      }
      setLaptopScale(Math.min(widthScale, heightScale))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [isLg])

  const laptopRef = useRef<HTMLDivElement>(null)
  const lidRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: laptopRef,
    offset: ['start end', 'end start'],
  })
  const laptopOpenProgress = isLg ? 0.4 : 0.24
  const rotateX = useTransform(scrollYProgress, [0, laptopOpenProgress], [70, 0], { clamp: true })
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.935, 1.1], { clamp: true })
  const [laptopOpen, setLaptopOpen] = useState(false)
  useMotionValueEvent(rotateX, 'change', (v) => setLaptopOpen(v <= 1))

  const gamePanelRef = useRef<HTMLDivElement>(null)
  const gameButtonRef = useRef<HTMLButtonElement>(null)
  const [gamePanelHeight, setGamePanelHeight] = useState(0)

  // ── Sticker placement game ──
  const [gameActive, setGameActive] = useState(false)
  const [gameRound, setGameRound] = useState(0)
  const [gameScores, setGameScores] = useState<number[]>([])
  const [userClick, setUserClick] = useState<{ x: number; y: number } | null>(null)
  const [userPlacements, setUserPlacements] = useState<Array<{ x: number; y: number }>>([])
  const [roundAccuracy, setRoundAccuracy] = useState<number | null>(null)
  const [gameFinished, setGameFinished] = useState(false)
  const targetRefs = useRef<(HTMLDivElement | null)[]>([])
  const gameStickers = useMemo(() => GAME_STICKERS.map(s => ({ src: s.src, name: s.name, rotation: s.rotation, style: s.getStyle(isLg) })), [isLg])

  const startGame = useCallback(() => {
    setGameActive(true)
    setGameRound(0)
    setGameScores([])
    setUserClick(null)
    setUserPlacements([])
    setRoundAccuracy(null)
    setGameFinished(false)
  }, [])

  const exitGame = useCallback(() => {
    setGameActive(false)
    setGameFinished(false)
  }, [])

  const handleLidGameClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameActive || gameFinished || roundAccuracy !== null) return
    const lid = lidRef.current
    if (!lid) return

    const lidRect = lid.getBoundingClientRect()
    const clickX = e.clientX - lidRect.left
    const clickY = e.clientY - lidRect.top

    const target = targetRefs.current[gameRound]
    if (!target) return

    const targetRect = target.getBoundingClientRect()
    const targetCX = targetRect.left + targetRect.width / 2 - lidRect.left
    const targetCY = targetRect.top + targetRect.height / 2 - lidRect.top

    const dist = Math.sqrt((clickX - targetCX) ** 2 + (clickY - targetCY) ** 2)
    const lidDiag = Math.sqrt(lidRect.width ** 2 + lidRect.height ** 2)
    const acc = Math.max(0, Math.round((1 - dist / (lidDiag * 0.3)) * 100))

    const userPct = { x: (clickX / lidRect.width) * 100, y: (clickY / lidRect.height) * 100 }
    setUserClick(userPct)
    setUserPlacements(prev => [...prev, userPct])
    setRoundAccuracy(acc)
    setGameScores(prev => [...prev, acc])
    posthog?.capture('sticker_game_placed', { sticker: gameStickers[gameRound].name, accuracy: acc })
  }, [gameActive, gameFinished, gameRound, roundAccuracy, gameStickers, posthog])

  const nextGameRound = useCallback(() => {
    if (gameRound + 1 >= gameStickers.length) {
      setGameFinished(true)
      const avg = Math.round([...gameScores].reduce((a, b) => a + b, 0) / gameScores.length)
      posthog?.capture('sticker_game_finished', { average_accuracy: avg, rounds: gameScores.length })
    } else {
      setGameRound(r => r + 1)
    }
    setUserClick(null)
    setRoundAccuracy(null)
  }, [gameRound, gameStickers.length, gameScores, posthog])

  useEffect(() => {
    if (isLg || roundAccuracy === null || gameFinished) return
    const id = window.setTimeout(nextGameRound, 850)
    return () => window.clearTimeout(id)
  }, [isLg, roundAccuracy, gameFinished, nextGameRound])

  const avgScore = gameScores.length > 0 ? Math.round(gameScores.reduce((a, b) => a + b, 0) / gameScores.length) : 0

  useEffect(() => {
    if (!isLg || !laptopOpen) {
      setGamePanelHeight(0)
      return
    }
    const target = gameActive ? gamePanelRef.current : gameButtonRef.current
    if (!target) {
      setGamePanelHeight(0)
      return
    }
    const update = () => setGamePanelHeight(target.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(target)
    return () => ro.disconnect()
  }, [isLg, laptopOpen, gameActive, gameFinished, gameRound, roundAccuracy])

  const validateEmail = (value: string) => {
    if (!value) return 'Please enter your email.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.'
    return ''
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const msg = validateEmail(email)
    if (msg) {
      setError(msg)
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await fetch('https://formsubmit.co/ajax/aprathapa01@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          message: `${email} reached out from your portfolio site.`,
          _subject: 'New contact from portfolio site',
        }),
      })
      setSubmitted(true)
      setEmail('')
      posthog?.capture('contact_form_submitted', { email_domain: email.split('@')[1] })
    } catch (err) {
      setError('Something went wrong. Please try again.')
      posthog?.captureException(err)
      posthog?.capture('contact_form_error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="px-6 pb-8 pt-24 md:py-28 lg:flex lg:items-start lg:pb-16 lg:pt-28"
      style={isLg && gamePanelHeight ? { paddingBottom: `calc(4rem + ${gamePanelHeight + 16}px)` } : undefined}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 lg:gap-x-24 lg:gap-y-6 items-center lg:items-stretch">
          {/* Left column — text, form, social. `contents` on mobile so children act as grid items, flex column on desktop */}
          <div className="contents lg:flex lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:flex-col lg:justify-between lg:pb-16">
            <div className="order-1 lg:order-none">
            <h2
              className="font-normal mb-6 leading-tight text-left"
              style={{ color: '#FFFFFF', fontSize: 'clamp(1.5rem, 1vw + 1rem, 1.875rem)' }}
            >
              Let's work
              <br />
              together
            </h2>

            <p
              className="text-black lg:mb-10 max-w-lg leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}
            >
              Have a project or opportunity in mind or just want to connect? Drop your email and
              I'll reach out.
            </p>
            </div>

            <div className="order-3 lg:order-none">
            <form
              onSubmit={handleSubmit}
              className="mb-12 text-center lg:text-left"
            >
              {submitted ? (
                <p className="text-white leading-relaxed" style={{ fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}>Thanks! I'll be in touch soon.</p>
              ) : (
                <>
                  <div className="glassmorphism mx-auto flex max-w-md flex-col items-stretch gap-2 rounded-xl p-2 sm:flex-row sm:items-center lg:mx-0">
                    <input
                      type="text"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                      disabled={submitting}
                      className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/60 md:text-base"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submitting}
                      className="w-full !bg-black !text-lg !text-white hover:!bg-black/85 sm:w-auto"
                      onMouseEnter={() => setCtaHovered(true)}
                      onMouseLeave={() => setCtaHovered(false)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span>{submitting ? 'Sending...' : 'Get in touch'}</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {ctaHovered ? (
                            <>
                              <path d="M5 12h14" />
                              <path d="M12 5l7 7-7 7" />
                            </>
                          ) : (
                            <path d="M8 5l7 7-7 7" />
                          )}
                        </svg>
                      </span>
                    </Button>
                  </div>
                  {error && (
                    <p className="mt-3 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {error}
                    </p>
                  )}
                </>
              )}
            </form>

            {/* Social links */}
            <div
              className="flex items-center gap-5 justify-center lg:justify-start"
            >
              <a
                href="https://github.com/adiprathapa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')
                }
                onClick={() => posthog?.capture('social_link_clicked', { platform: 'github', location: 'contact' })}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/adi-prathapa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')
                }
                onClick={() => posthog?.capture('social_link_clicked', { platform: 'linkedin', location: 'contact' })}
              >
                <svg
                  className="w-5 h-5"
                  fill="white"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="mailto:aprathapa01@gmail.com"
                className="flex items-center justify-center w-11 h-11 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')
                }
                onClick={() => posthog?.capture('social_link_clicked', { platform: 'email', location: 'contact' })}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
            </div>
          </div>

          {/* Right — MacBook lid with scroll-driven 3D closing animation */}
          <div ref={laptopContainerRef} className="flex flex-col lg:block mt-1 lg:mt-0 order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <div
            ref={laptopRef}
            className="relative flex items-center justify-center order-2 lg:order-none mt-2 lg:mt-0 lg:ml-[110px]"
            style={{
              perspective: 1200,
              width: isLg ? DESKTOP_REF_WIDTH : MOBILE_REF_WIDTH,
              zoom: laptopScale,
              ...(isLg ? {} : { margin: '0 auto' }),
            }}
          >
            <motion.div
              ref={lidRef}
              className="relative w-full"
              style={{
                maxWidth: '78rem',
                rotateX,
                scale,
                transformOrigin: 'center bottom',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* MacBook lid */}
              <img
                src="/macbook-lid.svg"
                alt="MacBook Air Midnight"
                className="w-full h-auto"
                style={{
                  filter: 'none',
                }}
              />

              {/* Apple logo — rendered before stickers so they always stack above */}
              <img
                src="/appl.png"
                alt=""
                className="absolute pointer-events-none select-none"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  height: 71,
                  width: 'auto',
                  opacity: 0.35,
                  filter: 'brightness(0)',
                }}
              />

              {/* Stickers on lid — hidden during game */}
              {visualsReady && (
              <div style={{ opacity: gameActive ? 0 : 1, transition: 'opacity 0.5s ease', pointerEvents: gameActive ? 'none' : 'auto' }}>
              {/* Row bottom */}
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-acsu2.png" alt="ACSU" label="From Association of Computer Science Undergraduates" tooltipTop={-56} style={{ bottom: 'calc(10% + 18px)', left: 'calc(68% + 17px)', width: '23.3%' }} hoverArea={{ top: '5%', left: '2%', width: '96%', height: '89%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-acsu.png" alt="Riley's Way" label="From Team Mentor Role at Riley's Way Retreat '26" tooltipTop={-56} style={{ bottom: 'calc(10% + 11px)', left: 'calc(55% - 13px)', width: '16%' }} hoverArea={{ top: '4%', left: '6%', width: '83%', height: '96%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-tata.png" alt="Tata-Cornell Institute" label="From Cornell Food Hackathon Sponsored by Tata-Cornell Institute" tooltipTop={0} style={{ bottom: 'calc(10% - 31px)', left: 'calc(30% - 86px)', width: '37%' }} hoverArea={{ top: '33%', left: '20%', width: '69%', height: '36%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-data.png" alt="Cornell Data Strategy" label="From Cornell Data Strategy" tooltipTop={-19} style={{ bottom: 'calc(10% - 40px)', left: 'calc(6% - 72px)', width: '37%' }} hoverArea={{ top: '24%', left: '32%', width: '36%', height: '47%', zIndex: 10 }} />
              {/* Row middle */}
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-frog.png" alt="TrexQuant" label="From first Career Fair at Cornell" tooltipTop={-56} style={{ bottom: 'calc(10% + 91px)', left: 'calc(70% + 40px)', width: '14.4%' }} hoverArea={{ top: '7%', left: '8%', width: '85%', height: '85%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-c2s2.png" alt="C2S2" label="From Cornell Custom Silicon Systems" tooltipTop={-56} style={{ bottom: isLg ? 'calc(10% + 105px)' : 'calc(10% + 110px)', left: 'calc(55% + 20px)', width: '15.04%' }} hoverArea={{ top: '5%', left: '5%', width: '92%', height: '92%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-gemini-char.png" alt="Ampersand" label="From Cornell Days '26" tooltipTop={-56} style={{ bottom: 'calc(10% + 115px)', left: 'calc(8% - 10px)', width: '18%' }} hoverArea={{ top: '5%', left: '5%', width: '90%', height: '90%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-gemini.png" alt="Coneflower" label="From my favorite creamery in Omaha, NE" tooltipTop={-56} tooltipOffsetX={11} style={{ bottom: 'calc(10% + 90px)', left: 'calc(30% - 63px)', width: '28.52%' }} hoverArea={{ top: '5%', left: '14%', width: '78%', height: '91%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-purple.png" alt="Hackathons Cornell" label="From first hackathon at Cornell" tooltipTop={-56} style={{ bottom: isLg ? 'calc(10% + 210px)' : 'calc(10% + 215px)', left: 'calc(70% + 20px)', width: '22%' }} hoverArea={{ top: '10%', left: '4%', width: '94%', height: '76%', zIndex: 10 }} />
              {/* Row top */}
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-nell.png" alt="Cornell University" label="From Orientation Week" tooltipTop={-59} style={{ bottom: isLg ? 'calc(10% + 260px)' : 'calc(10% + 285px)', left: 'calc(70% + 40px)', width: '16.2%' }} hoverArea={{ top: '0%', left: '2%', width: '96%', height: '97%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-claude.png" alt="Claude" label="From Claude Builders Club" tooltipTop={-37} style={{ bottom: isLg ? 'calc(10% + 197px)' : 'calc(10% + 202px)', left: 'calc(52% + 25px)', width: '18%' }} hoverArea={{ top: '16%', left: '12%', width: '77%', height: '68%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-tabs.png" alt="Google for Education" label="From event at Okenshields" tooltipTop={-37} style={{ bottom: isLg ? 'calc(10% + 315px)' : 'calc(10% + 340px)', left: 'calc(34% + 130px)', width: '19.8%' }} hoverArea={{ top: '25%', left: '3%', width: '95%', height: '72%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-tab.png" alt="tabs+" label="From Cornell AI Hackathon hosted at tabs" tooltipTop={-40} style={{ bottom: isLg ? 'calc(10% + 243px)' : 'calc(10% + 253px)', left: isLg ? 'calc(16% + 180px)' : 'calc(16% + 185px)', width: '12.6%' }} hoverArea={{ top: '12%', left: '5%', width: '91%', height: '71%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-cu.png" alt="CU mascot" label="From Georgetown '24 Civic Innovation Academy" tooltipTop={-35} style={{ bottom: isLg ? 'calc(10% + 280px)' : 'calc(10% + 305px)', left: 'calc(2% + 225px)', width: '12.6%' }} hoverArea={{ top: '20%', left: '6%', width: '91%', height: '67%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/sticker-claude-confused.png" alt="Claude" label="From Claude Builders Club Hackathon" tooltipTop={-56} rotation={30} style={{ bottom: isLg ? 'calc(10% + 209px)' : 'calc(10% + 219px)', left: 'calc(8% + 40px)', width: '18%' }} hoverArea={{ top: '5%', left: '5%', width: '90%', height: '90%', zIndex: 10 }} />
              <Sticker getNextZ={bumpStickerZ} constraintsRef={lidRef} disabled={!laptopOpen} src="/gemini-sticker.png" alt="YC" label="From YC @ Cornell" tooltipTop={-21} style={{ top: isLg ? 'calc(10% - 51px)' : 'calc(10% - 59px)', bottom: 'auto', left: 'calc(8% + 5px)', width: '20%' }} hoverArea={{ top: '5%', left: '5%', width: '90%', height: '90%', zIndex: 10 }} />
              </div>
              )}

              {/* ── Sticker game elements ── */}
              {gameActive && (
                <>
                  {/* Hidden targets to measure correct positions */}
                  {gameStickers.map((s, i) => (
                    <div
                      key={`target-${i}`}
                      ref={el => { targetRefs.current[i] = el }}
                      className="absolute pointer-events-none"
                      style={{ ...s.style, opacity: 0 }}
                    >
                      <img src={s.src} className="w-full h-auto" alt="" />
                    </div>
                  ))}

                  {/* Click overlay */}
                  {!gameFinished && roundAccuracy === null && (
                    <div
                      className="absolute z-50"
                      style={{ inset: '3%', cursor: 'crosshair', borderRadius: 8 }}
                      onClick={handleLidGameClick}
                    />
                  )}

                  {/* Placed stickers — at user positions during play, at actual positions when finished */}
                  {gameScores.map((_, i) => {
                    if (i === gameRound && roundAccuracy !== null && !gameFinished) return null
                    const sticker = gameStickers[i]
                    const userPos = userPlacements[i]
                    if (!gameFinished && userPos) {
                      return (
                        <div
                          key={`placed-${i}`}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${userPos.x}%`,
                            top: `${userPos.y}%`,
                            width: sticker.style.width as string,
                            transform: `translate(-50%, -50%)${sticker.rotation ? ` rotate(${sticker.rotation}deg)` : ''}`,
                          }}
                        >
                          <img src={sticker.src} className="w-full h-auto" alt="" />
                        </div>
                      )
                    }
                    return (
                      <div
                        key={`placed-${i}`}
                        className="absolute pointer-events-none"
                        style={{
                          ...sticker.style,
                          ...(sticker.rotation ? { transform: `rotate(${sticker.rotation}deg)` } : {}),
                        }}
                      >
                        <img src={sticker.src} className="w-full h-auto" alt="" />
                      </div>
                    )
                  })}

                  {/* Current round sticker — animated entry at user's clicked position */}
                  <AnimatePresence>
                    {roundAccuracy !== null && !gameFinished && userClick && (
                      <motion.div
                        className="absolute pointer-events-none"
                        style={{
                          left: `${userClick.x}%`,
                          top: `${userClick.y}%`,
                          width: gameStickers[gameRound].style.width as string,
                          translateX: '-50%',
                          translateY: '-50%',
                        }}
                        initial={{ opacity: 0, scale: 0.5, rotate: gameStickers[gameRound].rotation ?? 0 }}
                        animate={{ opacity: 1, scale: 1, rotate: gameStickers[gameRound].rotation ?? 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                      >
                        <img src={gameStickers[gameRound].src} className="w-full h-auto" alt="" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

            </motion.div>
          </div>

          {/* ── Sticker game panel ── */}
          <div className="order-1 lg:order-none lg:relative">
          {!gameActive && (
            <motion.button
              ref={gameButtonRef}
              initial={false}
              animate={{ opacity: laptopOpen ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 mt-0 mb-4 mx-auto select-none cursor-pointer lg:absolute lg:top-0 lg:mb-0 lg:mt-4"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                background: 'none',
                border: 'none',
                padding: 0,
                pointerEvents: laptopOpen ? 'auto' : 'none',
                ...(isLg ? { marginLeft: DESKTOP_LEFT_OFFSET - DESKTOP_REF_WIDTH * ((1400 / 1500) * 1.1 - 1) / 2 } : {}),
              }}
              onClick={startGame}
            >
              <motion.svg
                className="size-3 lg:size-4"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                animate={{ x: [0, 3, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M12 12h.01" />
                <path d="M17 12h.01" />
                <path d="M7 12h.01" />
              </motion.svg>
              <span className="text-[10px] lg:text-sm font-medium">Sticker placement</span>
            </motion.button>
          )}

          <AnimatePresence>
            {gameActive && (
              <motion.div
                ref={gamePanelRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className={isLg
                  ? 'mt-4 mb-0 mx-auto rounded-xl px-5 py-4 absolute top-0'
                  : 'mt-4 mb-10 mx-auto rounded-xl px-5 py-4'
                }
                style={{
                  background: 'rgba(239, 243, 248, 0.95)',
                  border: '1.5px solid rgba(6, 113, 164, 0.2)',
                  backdropFilter: 'blur(12px)',
                  width: isLg
                    ? DESKTOP_REF_WIDTH * (1400 / 1500) * 1.1
                    : MOBILE_REF_WIDTH * laptopScale,
                  maxWidth: '100%',
                  zoom: isLg ? laptopScale : undefined,
                  ...(isLg ? { marginLeft: DESKTOP_LEFT_OFFSET - DESKTOP_REF_WIDTH * ((1400 / 1500) * 1.1 - 1) / 2 } : {}),
                }}
              >
                {gameFinished ? (
                  <div className="flex flex-col items-center py-4 gap-3">
                    <p className="font-normal" style={{ color: '#0671A4', fontSize: 'clamp(1.5rem, 1vw + 1rem, 1.875rem)' }}>
                      {getFinalMessage(avgScore)}
                    </p>
                    <p className="text-sm" style={{ color: 'rgba(6, 113, 164, 0.6)' }}>
                      Average accuracy: {avgScore}%
                    </p>
                    <div className="flex gap-2 mt-2">
                      <RippleButton
                        onClick={startGame}
                        className="group rounded-full px-4 py-2 text-sm font-medium"
                        rippleColor="#38BDF8"
                        style={{ backgroundColor: '#0671A4', color: '#FFFFFF', border: '2px solid transparent', transition: 'background-color 0.3s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#055a84' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0671A4' }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 group-hover:rotate-[360deg]">
                            <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
                          </svg>
                          <span>Play Again</span>
                        </span>
                      </RippleButton>
                      <RippleButton
                        onClick={exitGame}
                        className="rounded-full px-4 py-2 text-sm font-medium"
                        rippleColor="#38BDF8"
                        style={{ color: '#0671A4', backgroundColor: '#E4EFF5', border: '2px solid rgba(6, 113, 164, 0.3)', transition: 'background-color 0.3s, border-color 0.3s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D7E8F1'; e.currentTarget.style.borderColor = '#0671A4' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#E4EFF5'; e.currentTarget.style.borderColor = 'rgba(6, 113, 164, 0.3)' }}
                      >
                        Exit
                      </RippleButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg" style={{ background: 'rgba(6, 113, 164, 0.08)' }}>
                      <img src={gameStickers[gameRound].src} alt={gameStickers[gameRound].name} className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium" style={{ color: '#111827', fontSize: isLg ? '0.875rem' : 'clamp(0.7rem, 3.2vw, 0.875rem)', whiteSpace: 'nowrap' }}>
                        {roundAccuracy !== null ? (
                          <>
                            {getAccuracyMessage(roundAccuracy)} <span style={{ color: '#0671A4' }}>{roundAccuracy}%</span>
                          </>
                        ) : (
                          <>
                            Place the <span style={{ color: '#0671A4' }}>{gameStickers[gameRound].name}</span> sticker
                          </>
                        )}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(6, 113, 164, 0.5)' }}>
                        {gameRound + 1} / {gameStickers.length} &middot; Click on the lid where it belongs
                      </p>
                    </div>
                    {roundAccuracy !== null && isLg ? (
                      <RippleButton
                        onClick={nextGameRound}
                        className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium"
                        rippleColor="#38BDF8"
                        style={{ backgroundColor: '#0671A4', color: '#FFFFFF', border: '2px solid transparent', transition: 'background-color 0.3s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#055a84' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0671A4' }}
                      >
                        {gameRound + 1 >= gameStickers.length ? 'Results' : 'Next'}
                      </RippleButton>
                    ) : (
                      <button
                        onClick={exitGame}
                        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer"
                        style={{ color: '#0671A4', background: 'none', border: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 113, 164, 0.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}
