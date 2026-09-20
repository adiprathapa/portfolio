import { useCallback, useEffect, useRef, useState } from 'react'
import { PlatformerEnd, PlatformerIntro } from './platformer/PlatformerModals'
import { TouchControls } from './platformer/TouchControls'
import { isOver, type PlatformerPhase } from './platformer/usePlatformer'
import {
  CAPOO_H,
  CAPOO_W,
  CARD_TIME_MS,
  COYOTE_MS,
  FINAL_PROJECT_SLUG,
  GRAVITY,
  JUMP_BUFFER_MS,
  JUMP_CUT_VY,
  JUMP_VY,
  LAND_TOLERANCE,
  MOVE_SPEED,
  PROJECT_SLUGS,
  START_DELAY_MS,
  TELEPORT_MS,
  easeInOutSine,
  findCard,
  firstWordOfCard,
  flagRects,
  isNextCardTouching,
  isWordCovered,
  scrollPerCard,
  wordRects,
} from './platformer/level'
import { useIsMobile } from '../hooks/useMediaQuery'
import { COLOR, PRIMARY } from '../lib/theme'

interface ScrollAnimation {
  from: number
  to: number
  startedAt: number
  duration: number
}

export function ProjectsGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<PlatformerPhase>('intro')
  const [flagsReached, setFlagsReached] = useState(0)
  const isMobile = useIsMobile()

  const phaseRef = useRef<PlatformerPhase>('intro')
  const capooRef = useRef<HTMLDivElement>(null)

  // Position and physics
  const x = useRef(0)
  const y = useRef(40)
  const vy = useRef(0)
  const facing = useRef<1 | -1>(1)
  const moveLeft = useRef(false)
  const moveRight = useRef(false)
  const lastGroundedAt = useRef(0)
  const jumpBufferedUntil = useRef(0)
  const jumpHeld = useRef(false)
  const lastFrame = useRef<number | null>(null)

  // Progress through the stack
  const cardIdx = useRef(0)
  const reachedSlug = useRef<string | null>(null)
  const reachedFlags = useRef<Set<string>>(new Set())
  const teleporting = useRef(false)
  const scrollAnim = useRef<ScrollAnimation | null>(null)
  const railTop = useRef(0)

  // Input handlers close over the first render, so reach the latest via refs.
  const restartRef = useRef<() => void>(() => {})
  const advanceRef = useRef<() => void>(() => {})

  const setPhaseSync = useCallback((next: PlatformerPhase) => {
    phaseRef.current = next
    setPhase(next)
    // Stop fighting the user's scroll the instant the run ends.
    if (isOver(next)) scrollAnim.current = null
  }, [])

  const drawCapoo = useCallback(() => {
    if (!capooRef.current) return
    capooRef.current.style.transform =
      `translate3d(${x.current - CAPOO_W / 2}px, ${y.current}px, 0) scaleX(${facing.current})`
  }, [])

  const placeOnFirstWord = useCallback((slug: string) => {
    const first = firstWordOfCard(slug)
    if (!first) return false
    x.current = (first.rect.left + first.rect.right) / 2
    y.current = first.rect.top - CAPOO_H
    return true
  }, [])

  const scrollYForCard = useCallback((idx: number) => railTop.current + idx * scrollPerCard(), [])

  /** Starts the per-card race: the next card stacks in as the page scrolls. */
  const startCardRace = useCallback((idx: number) => {
    scrollAnim.current = {
      from: scrollYForCard(idx),
      to: scrollYForCard(idx + 1),
      startedAt: performance.now(),
      duration: CARD_TIME_MS,
    }
  }, [scrollYForCard])

  const advanceToNextCard = useCallback(() => {
    const nextIdx = cardIdx.current + 1
    if (nextIdx >= PROJECT_SLUGS.length) return

    cardIdx.current = nextIdx
    reachedSlug.current = PROJECT_SLUGS[nextIdx]
    teleporting.current = true
    vy.current = 0
    facing.current = 1

    scrollAnim.current = {
      from: window.scrollY,
      to: scrollYForCard(nextIdx),
      startedAt: performance.now(),
      duration: TELEPORT_MS,
    }
    // Hand control back to physics once the snap-scroll has settled.
    window.setTimeout(() => {
      teleporting.current = false
      startCardRace(nextIdx)
    }, TELEPORT_MS + 80)
  }, [scrollYForCard, startCardRace])

  const clearFlags = useCallback(() => {
    reachedFlags.current.clear()
    document.querySelectorAll('.flag-reached').forEach((el) => el.classList.remove('flag-reached'))
    setFlagsReached(0)
  }, [])

  // Setup
  useEffect(() => {
    // Lets CSS widen the gaps between words so the level reads as platforms.
    document.documentElement.classList.add('capoo-game')
    // Flags live in the project cards, which outlive the game.
    clearFlags()

    const rail = document.getElementById('projects-rail')
    if (!rail) {
      setPhaseSync('dead-top')
      return
    }
    railTop.current = rail.getBoundingClientRect().top + window.scrollY
    x.current = window.innerWidth * 0.35
    y.current = 40
    vy.current = 0
    cardIdx.current = 0
    reachedSlug.current = PROJECT_SLUGS[0]
    window.scrollTo(0, railTop.current)

    // Place Capoo once layout has settled.
    const placeId = window.setTimeout(() => placeOnFirstWord(PROJECT_SLUGS[0]), 50)
    return () => {
      clearTimeout(placeId)
      document.documentElement.classList.remove('capoo-game')
    }
  }, [clearFlags, placeOnFirstWord, setPhaseSync])

  const restart = useCallback(() => {
    window.scrollTo(0, railTop.current)
    cardIdx.current = 0
    reachedSlug.current = PROJECT_SLUGS[0]
    vy.current = 0
    lastFrame.current = null
    facing.current = 1
    lastGroundedAt.current = 0
    jumpBufferedUntil.current = 0
    jumpHeld.current = false
    teleporting.current = false
    scrollAnim.current = null
    clearFlags()

    // Park Capoo off screen until the spawn point resolves, so he does not
    // flash at the top of the viewport while the rail re-renders.
    y.current = -CAPOO_H * 4
    x.current = window.innerWidth * 0.35

    const begin = () => {
      setPhaseSync('starting')
      window.setTimeout(() => {
        setPhaseSync('playing')
        startCardRace(0)
      }, START_DELAY_MS)
    }

    const placeAndStart = (attempts = 0) => {
      if (placeOnFirstWord(PROJECT_SLUGS[0])) {
        begin()
      } else if (attempts < 20) {
        requestAnimationFrame(() => placeAndStart(attempts + 1))
      } else {
        // Give up locating the spawn word; gravity will land him somewhere.
        y.current = 40
        begin()
      }
    }
    requestAnimationFrame(() => placeAndStart())
  }, [clearFlags, placeOnFirstWord, setPhaseSync, startCardRace])

  useEffect(() => { restartRef.current = restart }, [restart])
  useEffect(() => { advanceRef.current = advanceToNextCard }, [advanceToNextCard])

  // Input
  useEffect(() => {
    const MOVE_KEYS: Record<string, 'left' | 'right'> = {
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', d: 'right', D: 'right',
    }
    const JUMP_KEYS = [' ', 'ArrowUp', 'w', 'W']

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExit(); return }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        restartRef.current()
        return
      }
      if (phaseRef.current !== 'playing') return

      const move = MOVE_KEYS[e.key]
      if (move) {
        e.preventDefault()
        if (move === 'left') { moveLeft.current = true; facing.current = -1 }
        else { moveRight.current = true; facing.current = 1 }
        return
      }
      if (JUMP_KEYS.includes(e.key)) {
        e.preventDefault()
        if (e.repeat) return
        // Buffered, then consumed by the loop once grounded or within coyote time.
        jumpBufferedUntil.current = performance.now() + JUMP_BUFFER_MS
        jumpHeld.current = true
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const move = MOVE_KEYS[e.key]
      if (move === 'left') moveLeft.current = false
      if (move === 'right') moveRight.current = false
      if (JUMP_KEYS.includes(e.key)) jumpHeld.current = false
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest('[data-game-ui]')) return
      if (phaseRef.current !== 'playing') return
      jumpBufferedUntil.current = performance.now() + JUMP_BUFFER_MS
      jumpHeld.current = true
    }
    const onPointerUp = () => { jumpHeld.current = false }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [onExit])

  // Block wheel scrolling during play so the desktop user cannot fight the
  // auto-scroll. Touchmove is deliberately left alone: preventing it on iOS
  // leaves the page stuck even after the listener is removed, and on mobile
  // the next auto-scroll frame overrides a manual swipe anyway.
  useEffect(() => {
    const prevent = (e: Event) => {
      if (isOver(phaseRef.current)) return
      e.preventDefault()
    }
    window.addEventListener('wheel', prevent, { passive: false })
    return () => window.removeEventListener('wheel', prevent)
  }, [])

  // Lock the page behind the intro modal. Body overflow is the iOS-safe way;
  // preventing touchmove leaves Safari wedged after release.
  useEffect(() => {
    if (phase !== 'intro') return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [phase])

  // Game loop
  useEffect(() => {
    let raf: number

    const runScrollAnimation = (t: number) => {
      const anim = scrollAnim.current
      if (!anim) return
      if (isOver(phaseRef.current)) {
        scrollAnim.current = null
        return
      }
      const progress = Math.min((t - anim.startedAt) / anim.duration, 1)
      window.scrollTo(0, anim.from + (anim.to - anim.from) * easeInOutSine(progress))
      if (progress >= 1) scrollAnim.current = null
    }

    const step = (t: number) => {
      const previous = lastFrame.current
      lastFrame.current = t
      const dt = (previous === null ? 16 : Math.min(48, t - previous)) / 1000

      runScrollAnimation(t)

      if (phaseRef.current !== 'playing') {
        raf = requestAnimationFrame(step)
        return
      }

      const slug = PROJECT_SLUGS[cardIdx.current]

      if (teleporting.current) {
        // Pin Capoo to the new card's first word while the page scrolls under him.
        if (placeOnFirstWord(slug)) vy.current = 0
        drawCapoo()
        raf = requestAnimationFrame(step)
        return
      }

      // Horizontal movement
      let dx = 0
      if (moveLeft.current) dx -= MOVE_SPEED * dt
      if (moveRight.current) dx += MOVE_SPEED * dt
      x.current = Math.max(20, Math.min(window.innerWidth - 20, x.current + dx))

      // Coyote time: a buffered jump fires if he was grounded recently.
      if (jumpBufferedUntil.current >= t && t - lastGroundedAt.current <= COYOTE_MS) {
        vy.current = JUMP_VY
        jumpBufferedUntil.current = 0
        lastGroundedAt.current = 0
      }
      // Variable jump height: releasing mid-rise cuts the ascent short.
      if (!jumpHeld.current && vy.current < JUMP_CUT_VY) vy.current = JUMP_CUT_VY

      const prevY = y.current
      vy.current += GRAVITY * dt
      let nextY = y.current + vy.current * dt

      // Each card is its own level, so only its words are platforms.
      const words = wordRects()
        .filter((w) => w.key === slug)
        .sort((a, b) => a.top - b.top)

      let landed = false
      if (vy.current >= 0) {
        for (const word of words) {
          // Capoo's center must be over the word.
          if (x.current < word.left + 1 || x.current > word.right - 1) continue
          if (prevY + CAPOO_H > word.top + LAND_TOLERANCE || nextY + CAPOO_H < word.top - 2) continue
          // Reject words buried under a later card.
          if (isWordCovered(word)) continue
          nextY = word.top - CAPOO_H
          vy.current = 0
          landed = true
          reachedSlug.current = word.key
          break
        }
      }
      if (landed) lastGroundedAt.current = t
      y.current = nextY

      // Touching the card's flag advances to the next card, or wins.
      const capooBox = {
        left: x.current - CAPOO_W / 2,
        right: x.current + CAPOO_W / 2,
        top: y.current,
        bottom: y.current + CAPOO_H,
      }
      for (const flag of flagRects().filter((f) => f.key === slug)) {
        if (capooBox.right < flag.left || capooBox.left > flag.right) continue
        if (capooBox.bottom < flag.top || capooBox.top > flag.bottom) continue
        if (!reachedFlags.current.has(flag.key)) {
          reachedFlags.current.add(flag.key)
          flag.el.classList.add('flag-reached')
          setFlagsReached(reachedFlags.current.size)
          if (flag.key === FINAL_PROJECT_SLUG) setPhaseSync('won')
          else advanceRef.current()
        }
        break
      }

      // Death: pushed off the top of the viewport.
      if (y.current + CAPOO_H < 0) setPhaseSync('dead-top')

      // Death: fell past the card's bottom edge — there is nothing beneath it.
      const card = findCard(slug)
      if (card) {
        if (y.current > card.getBoundingClientRect().bottom - 4) setPhaseSync('dead-bottom')
      } else if (y.current > window.innerHeight + 40) {
        setPhaseSync('dead-bottom')
      }

      // Death: the race caught up and the next card is overlapping him.
      if (
        phaseRef.current === 'playing' &&
        !reachedFlags.current.has(slug) &&
        isNextCardTouching(slug, x.current, y.current, y.current + CAPOO_H)
      ) {
        setPhaseSync('dead-squish')
      }

      drawCapoo()
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [drawCapoo, placeOnFirstWord, setPhaseSync])

  // Lets automated checks reach each flag without playing the level.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const w = window as Window & { __capooTest?: { touchFlag: () => boolean } }
    w.__capooTest = {
      touchFlag: () => {
        const flag = flagRects().find((f) => f.key === PROJECT_SLUGS[cardIdx.current])
        if (!flag || teleporting.current) return false
        x.current = (flag.left + flag.right) / 2
        y.current = (flag.top + flag.bottom) / 2 - CAPOO_H / 2
        vy.current = 0
        return true
      },
    }
    return () => { delete w.__capooTest }
  }, [])

  const beginPlay = useCallback(() => {
    // Re-place in case layout shifted while the intro was up.
    placeOnFirstWord(PROJECT_SLUGS[0])
    vy.current = 0
    setPhaseSync('playing')
    startCardRace(0)
  }, [placeOnFirstWord, setPhaseSync, startCardRace])

  const showControls = isMobile && phase !== 'intro'

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {phase !== 'intro' && (
        <>
          <div
            data-game-ui
            className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium"
            style={{
              color: COLOR.primary,
              background: 'rgba(255,255,255,0.85)',
              border: `1px solid ${PRIMARY.a20}`,
              backdropFilter: 'blur(4px)',
            }}
          >
            Flags {flagsReached} / {PROJECT_SLUGS.length}
          </div>

          <button
            data-game-ui
            onClick={(e) => { e.stopPropagation(); onExit() }}
            className="pointer-events-auto absolute right-4 top-4 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              color: COLOR.primary,
              background: 'rgba(255,255,255,0.9)',
              border: `1px solid ${PRIMARY.a25}`,
              backdropFilter: 'blur(6px)',
            }}
          >
            Exit
          </button>
        </>
      )}

      {phase === 'intro' && <PlatformerIntro isMobile={isMobile} onStart={beginPlay} onExit={onExit} />}

      {showControls && (
        <TouchControls
          onLeft={(down) => { moveLeft.current = down; if (down) facing.current = -1 }}
          onRight={(down) => { moveRight.current = down; if (down) facing.current = 1 }}
          onJump={(down) => {
            if (down) jumpBufferedUntil.current = performance.now() + JUMP_BUFFER_MS
            jumpHeld.current = down
          }}
        />
      )}

      <div
        ref={capooRef}
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: CAPOO_W,
          height: CAPOO_H,
          willChange: 'transform',
          visibility: phase === 'intro' ? 'hidden' : 'visible',
        }}
      >
        <img
          src="/headshot.webp"
          alt="Player"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
            border: '2px solid #fff',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))',
          }}
        />
      </div>

      {isOver(phase) && (
        // Read during render on purpose: the run is over, so this ref is frozen.
        // eslint-disable-next-line react-hooks/refs
        <PlatformerEnd phase={phase} reachedSlug={reachedSlug.current} onRestart={restart} onExit={onExit} />
      )}
    </div>
  )
}
