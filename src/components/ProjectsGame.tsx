import { useEffect, useRef, useState, useCallback } from 'react'
import { RippleButton } from './ui/ripple-button'

// Capoo sprite size — slightly smaller on mobile so he's less obtrusive on the smaller cards
const CAPOO_W = typeof window !== 'undefined' && window.innerWidth < 1024 ? 22 : 26
const CAPOO_H = typeof window !== 'undefined' && window.innerWidth < 1024 ? 20 : 24
const GRAVITY = 900
const JUMP_VY = -460
const JUMP_CUT_VY = -180 // releasing jump key shortcuts upward velocity to this
const MOVE_SPEED = 200
const START_DELAY_MS = 900
const LAND_TOLERANCE = 10
const COYOTE_MS = 120
const JUMP_BUFFER_MS = 160
const CARD_TIME_MS = 12000 // race timer per card — scroll advances to next card view over this

// Match Projects.tsx's `spacing` constant — different for mobile vs desktop.
// Desktop: cardH (500) + 150 = 650.
// Mobile: cardH * 1.15 where cardH is min(vw - inset, 470). Reading the actual
// rendered card height keeps the per-card scroll aligned with framer-motion's
// rail segments regardless of device.
function getScrollPerCard(): number {
  if (window.innerWidth >= 1024) return 650
  const cardEl = document.querySelector<HTMLElement>('[data-project-card]')
  const cardH = cardEl?.offsetHeight || 400
  return Math.round(cardH * 1.15)
}

type Phase = 'intro' | 'starting' | 'playing' | 'dead-top' | 'dead-bottom' | 'dead-squish' | 'won'

function easeInOutSine(t: number) {
  return -0.5 * (Math.cos(Math.PI * t) - 1)
}

type WordRect = {
  el: HTMLElement
  key: string
  top: number
  bottom: number
  left: number
  right: number
}

type FlagRect = {
  el: HTMLElement
  key: string
  top: number
  bottom: number
  left: number
  right: number
}

// Project display names used as data-game-word / data-card-flag identifiers.
// Order matches Projects.tsx so we know which flag is the final goal.
const PROJECT_NAMES = ['Kiwix', 'Tauron', 'Helicity', 'ZAM', 'Macro Placement', 'Galatea', 'Parameter Golf', 'Spectre']
const FINAL_PROJECT_KEY = 'Spectre'

// data-project-card uses the lowercase key; data-game-word/data-card-flag use the display name
const PROJECT_KEY_TO_DISPLAY: Record<string, string> = {
  kiwix: 'Kiwix',
  tauron: 'Tauron',
  helicity: 'Helicity',
  zamsizing: 'ZAM',
  macroplace: 'Macro Placement',
  galatea: 'Galatea',
  paramgolf: 'Parameter Golf',
  spectre: 'Spectre',
}

const DISPLAY_TO_PROJECT_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(PROJECT_KEY_TO_DISPLAY).map(([k, v]) => [v, k])
)

function findCardElByDisplayName(displayKey: string): HTMLElement | null {
  const lower = DISPLAY_TO_PROJECT_KEY[displayKey]
  if (!lower) return null
  return document.querySelector<HTMLElement>(`[data-project-card="${lower}"]`)
}

function findFirstWordRectForCard(displayKey: string): { rect: DOMRect; el: HTMLElement } | null {
  const el = document.querySelector<HTMLElement>(`[data-game-word="${displayKey}"]`)
  if (!el) return null
  return { rect: el.getBoundingClientRect(), el }
}

// Returns true if a project card LATER than `currentDisplayKey` in
// PROJECT_NAMES is the topmost element painted at any point along Capoo's
// body — i.e. the next/upcoming card has stacked far enough to overlap his
// sprite. Brushing a previous card's tagline sliver while jumping high does
// NOT count as a smoosh.
function isNextCardTouchingCapoo(
  currentDisplayKey: string,
  capooX: number,
  capooTopY: number,
  capooBottomY: number,
): boolean {
  const currentIdx = PROJECT_NAMES.indexOf(currentDisplayKey)
  if (currentIdx < 0) return false
  const samples = [capooTopY + 2, (capooTopY + capooBottomY) / 2, capooBottomY - 2]
  for (const y of samples) {
    if (capooX < 0 || capooX > window.innerWidth || y < 0 || y > window.innerHeight) continue
    const stack = document.elementsFromPoint(capooX, y)
    for (const el of stack) {
      if (!(el instanceof HTMLElement)) continue
      if (el.closest('[data-game-ui]')) continue
      const cardEl = el.closest('[data-project-card]') as HTMLElement | null
      if (!cardEl) continue
      const cardKey = cardEl.dataset.projectCard || ''
      const display = PROJECT_KEY_TO_DISPLAY[cardKey] || cardKey
      const cardIdx = PROJECT_NAMES.indexOf(display)
      // Only count it if a LATER project's card is on top here.
      if (cardIdx > currentIdx) return true
      break
    }
  }
  return false
}


function getFlagRects(): FlagRect[] {
  const out: FlagRect[] = []
  const els = document.querySelectorAll<HTMLElement>('[data-card-flag]')
  els.forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width <= 0 || r.height <= 0) return
    out.push({
      el,
      key: el.dataset.cardFlag || '',
      top: r.top,
      bottom: r.bottom,
      left: r.left,
      right: r.right,
    })
  })
  return out
}

function getWordRects(): WordRect[] {
  const out: WordRect[] = []
  const els = document.querySelectorAll<HTMLElement>('[data-game-word]')
  els.forEach((el) => {
    const r = el.getBoundingClientRect()
    // Skip elements not visible (clipped out, opacity 0, etc.)
    if (r.width <= 0 || r.height <= 0) return
    out.push({
      el,
      key: el.dataset.gameWord || '',
      top: r.top,
      bottom: r.bottom,
      left: r.left,
      right: r.right,
    })
  })
  return out
}

// Check if a single word-platform is currently occluded by another card.
// Returns true when the topmost real element at the platform's center is not
// the word itself (and isn't an ancestor/descendant of it).
function isWordCovered(w: WordRect): boolean {
  const cx = (w.left + w.right) / 2
  const cy = (w.top + w.bottom) / 2
  if (cx < 0 || cx > window.innerWidth || cy < 0 || cy > window.innerHeight) return false
  const stack = document.elementsFromPoint(cx, cy)
  for (const el of stack) {
    if (!(el instanceof HTMLElement)) continue
    if (el.closest('[data-game-ui]')) continue
    if (el === w.el || w.el.contains(el) || el.contains(w.el)) return false
    // Found a real element that isn't related to our word → covered
    return true
  }
  return false
}

export function ProjectsGame({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const phaseRef = useRef<Phase>('intro')
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const capooXRef = useRef(0)
  const capooYRef = useRef(40)
  const capooVyRef = useRef(0)
  const moveLeftRef = useRef(false)
  const moveRightRef = useRef(false)
  const facingRef = useRef<1 | -1>(1) // 1 = right (default), -1 = left
  const lastGroundedAtRef = useRef(0) // perf timestamp of last frame standing on a word
  const jumpBufferedUntilRef = useRef(0) // jump press is queued until this perf time
  const jumpHeldRef = useRef(false)
  const restartRef = useRef<(() => void) | null>(null)
  const currentCardIdxRef = useRef(0)
  const teleportingRef = useRef(false)
  const scrollAnimRef = useRef<{ from: number; to: number; startedAt: number; duration: number } | null>(null)

  const onWordElRef = useRef<HTMLElement | null>(null)
  const onWordRectRef = useRef<WordRect | null>(null)
  const reachedCardRef = useRef<string | null>(null)
  const reachedFlagsRef = useRef<Set<string>>(new Set())
  const [reachedFlagsTick, setReachedFlagsTick] = useState(0)

  const scrollFromRef = useRef(0) // initial scroll position (where the rail starts) — used by restart
  const railTopRef = useRef(0) // absolute document Y of the projects-rail top
  const setupDoneRef = useRef(false)

  const lastFrameRef = useRef<number | null>(null)
  const capooRef = useRef<HTMLDivElement>(null)

  const setPhaseSync = useCallback((p: Phase) => {
    const wasAlive = phaseRef.current === 'playing' || phaseRef.current === 'starting'
    const becomingDead = p === 'dead-top' || p === 'dead-bottom' || p === 'dead-squish'
    phaseRef.current = p
    setPhase(p)
    // Halt any in-flight auto-scroll the instant the game ends so we stop
    // fighting the user's touch scroll.
    if (becomingDead || p === 'won') {
      scrollAnimRef.current = null
    }
  }, [])

  // Setup
  useEffect(() => {
    // Mark game active so CSS can widen the gap between words
    document.documentElement.classList.add('capoo-game')

    // Clear any flag-reached classes left over from a previous game session
    // (flags live in FlipSafari cards which don't unmount with the game)
    document.querySelectorAll('.flag-reached').forEach(el => el.classList.remove('flag-reached'))
    reachedFlagsRef.current.clear()

    const railEl = document.getElementById('projects-rail')
    if (!railEl) {
      setPhaseSync('dead-top')
      return
    }
    const railTop = railEl.getBoundingClientRect().top + window.scrollY

    scrollFromRef.current = railTop
    railTopRef.current = railTop
    capooXRef.current = window.innerWidth * 0.35
    capooYRef.current = 40
    capooVyRef.current = 0
    currentCardIdxRef.current = 0
    reachedCardRef.current = PROJECT_NAMES[0]
    setupDoneRef.current = true
    window.scrollTo(0, scrollFromRef.current)

    // After layout settles, place Capoo directly on Kiwix's first word
    const placeId = window.setTimeout(() => {
      const first = findFirstWordRectForCard(PROJECT_NAMES[0])
      if (first) {
        const r = first.rect
        capooXRef.current = (r.left + r.right) / 2
        capooYRef.current = r.top - CAPOO_H
      }
    }, 50)

    return () => {
      clearTimeout(placeId)
      document.documentElement.classList.remove('capoo-game')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Input — arrow keys for movement, space/up/click to jump
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExit(); return }
      // R restarts from any phase (including dead/won)
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        restartRef.current?.()
        return
      }
      if (phaseRef.current !== 'playing') return
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        moveLeftRef.current = true
        facingRef.current = -1
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        moveRightRef.current = true
        facingRef.current = 1
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        if (e.repeat) return
        // Buffer the jump press; consumed by the game loop when grounded (or via coyote time)
        jumpBufferedUntilRef.current = performance.now() + JUMP_BUFFER_MS
        jumpHeldRef.current = true
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeftRef.current = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRightRef.current = false
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        jumpHeldRef.current = false
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest('[data-game-ui]')) return
      if (phaseRef.current !== 'playing') return
      jumpBufferedUntilRef.current = performance.now() + JUMP_BUFFER_MS
      jumpHeldRef.current = true
    }
    const onPointerUp = () => { jumpHeldRef.current = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [onExit])

  // Block native page wheel scroll while playing so the desktop user can't fight
  // the auto-scroll. Touchmove is intentionally NOT blocked — preventing it on
  // iOS leaves the page in a stuck scroll state even after the listener is gone.
  // On mobile, manual swipes during play will get overridden by the next
  // auto-scroll frame anyway.
  useEffect(() => {
    const prevent = (e: Event) => {
      const p = phaseRef.current
      if (p === 'dead-top' || p === 'dead-bottom' || p === 'dead-squish' || p === 'won') return
      e.preventDefault()
    }
    window.addEventListener('wheel', prevent, { passive: false })
    return () => {
      window.removeEventListener('wheel', prevent)
    }
  }, [])

  // Lock the page scroll (via body overflow) while the intro modal is up so
  // the user can't scroll the page behind it. This is the iOS-safe way to
  // block scroll — overflow:hidden doesn't have the touchmove-preventDefault
  // gotcha that leaves Safari in a stuck state after release.
  useEffect(() => {
    if (phase !== 'intro') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [phase])

  // Game loop
  useEffect(() => {
    let raf: number
    const step = (t: number) => {
      const last = lastFrameRef.current
      lastFrameRef.current = t
      const dtMs = last === null ? 16 : Math.min(48, t - last)
      const dt = dtMs / 1000

      // Run per-card scroll animation, if any is active (started on flag-touch).
      // Halt it the moment the player dies / wins so we stop programmatically
      // scrolling the page while the user is trying to scroll out manually.
      if (scrollAnimRef.current) {
        const p = phaseRef.current
        if (p === 'dead-top' || p === 'dead-bottom' || p === 'dead-squish' || p === 'won') {
          scrollAnimRef.current = null
        } else {
          const s = scrollAnimRef.current
          const progress = Math.min((t - s.startedAt) / s.duration, 1)
          const eased = easeInOutSine(progress)
          const y = s.from + (s.to - s.from) * eased
          window.scrollTo(0, y)
          if (progress >= 1) scrollAnimRef.current = null
        }
      }

      if (phaseRef.current === 'playing' && teleportingRef.current) {
        // While teleporting between cards, lock Capoo directly on top of the
        // new card's first word — the scroll animation is moving the page
        // underneath him.
        const targetDisplay = PROJECT_NAMES[currentCardIdxRef.current]
        const first = findFirstWordRectForCard(targetDisplay)
        if (first) {
          const r = first.rect
          capooXRef.current = (r.left + r.right) / 2
          capooYRef.current = r.top - CAPOO_H
          capooVyRef.current = 0
        }
        if (capooRef.current) {
          const flip = facingRef.current === -1 ? -1 : 1
          capooRef.current.style.transform = `translate3d(${capooXRef.current - CAPOO_W / 2}px, ${capooYRef.current}px, 0) scaleX(${flip})`
        }
        raf = requestAnimationFrame(step)
        return
      }

      if (phaseRef.current === 'playing') {
        // Horizontal movement
        let dx = 0
        if (moveLeftRef.current) dx -= MOVE_SPEED * dt
        if (moveRightRef.current) dx += MOVE_SPEED * dt
        capooXRef.current = Math.max(20, Math.min(window.innerWidth - 20, capooXRef.current + dx))

        // Coyote-time jump: consume any buffered jump if Capoo was grounded recently
        if (
          jumpBufferedUntilRef.current >= t &&
          t - lastGroundedAtRef.current <= COYOTE_MS
        ) {
          capooVyRef.current = JUMP_VY
          jumpBufferedUntilRef.current = 0
          // Move lastGroundedAt into the past so this jump can't re-trigger
          lastGroundedAtRef.current = 0
        }

        // Variable jump height: if jump key released while still rising, cut velocity
        if (!jumpHeldRef.current && capooVyRef.current < JUMP_CUT_VY) {
          capooVyRef.current = JUMP_CUT_VY
        }

        // Vertical physics
        const prevY = capooYRef.current
        capooVyRef.current += GRAVITY * dt
        let newY = capooYRef.current + capooVyRef.current * dt

        // Only consider words from the card Capoo is currently playing —
        // each card is its own isolated level.
        const currentDisplayKey = PROJECT_NAMES[currentCardIdxRef.current]
        const words = getWordRects().filter(w => w.key === currentDisplayKey)
        let landedRect: WordRect | null = null
        let landedEl: HTMLElement | null = null

        // Sort words top-down so capoo lands on the topmost word he crosses
        const sorted = words.slice().sort((a, b) => a.top - b.top)
        if (capooVyRef.current >= 0) {
          for (const w of sorted) {
            // Horizontal overlap check — Capoo's center must be within the word
            if (capooXRef.current < w.left + 1 || capooXRef.current > w.right - 1) continue
            const prevFeet = prevY + CAPOO_H
            const newFeet = newY + CAPOO_H
            if (prevFeet <= w.top + LAND_TOLERANCE && newFeet >= w.top - 2) {
              // Verify the platform is actually visible at Capoo's landing point —
              // otherwise we'd be standing on a word from a card buried under another.
              if (isWordCovered(w)) continue
              newY = w.top - CAPOO_H
              capooVyRef.current = 0
              landedRect = w
              landedEl = w.el
              reachedCardRef.current = w.key
              break
            }
          }
        }
        onWordRectRef.current = landedRect
        onWordElRef.current = landedEl
        if (landedRect) lastGroundedAtRef.current = t

        capooYRef.current = newY

        // Flag detection — touch the current card's flag to advance to the next card
        if (!teleportingRef.current) {
          const flags = getFlagRects().filter(f => f.key === currentDisplayKey)
          const capooLeft = capooXRef.current - CAPOO_W / 2
          const capooRight = capooXRef.current + CAPOO_W / 2
          const capooTop = capooYRef.current
          const capooBottom = capooYRef.current + CAPOO_H
          for (const f of flags) {
            if (capooRight < f.left || capooLeft > f.right) continue
            if (capooBottom < f.top || capooTop > f.bottom) continue
            if (!reachedFlagsRef.current.has(f.key)) {
              reachedFlagsRef.current.add(f.key)
              f.el.classList.add('flag-reached')
              setReachedFlagsTick(n => n + 1)
              if (f.key === FINAL_PROJECT_KEY) {
                setPhaseSync('won')
              } else {
                advanceToNextCard()
              }
            }
            break
          }
        }

        // Death: pushed off the top of the viewport
        if (capooYRef.current + CAPOO_H < 0) {
          setPhaseSync('dead-top')
        }

        // Death: fell below the current card's bottom edge — each card is
        // an isolated level, there's nothing beneath it.
        const currentCardEl = findCardElByDisplayName(currentDisplayKey)
        if (currentCardEl) {
          const cardBottom = currentCardEl.getBoundingClientRect().bottom
          if (capooYRef.current > cardBottom - 4) {
            setPhaseSync('dead-bottom')
          }
        } else if (capooYRef.current > window.innerHeight + 40) {
          // Fallback if the card element can't be found
          setPhaseSync('dead-bottom')
        }

        // Death: race is over — the next card has stacked far enough to overlap
        // Capoo's sprite. (Only checked once the flag for this card isn't reached.)
        if (
          phaseRef.current === 'playing' &&
          !reachedFlagsRef.current.has(currentDisplayKey) &&
          isNextCardTouchingCapoo(
            currentDisplayKey,
            capooXRef.current,
            capooYRef.current,
            capooYRef.current + CAPOO_H,
          )
        ) {
          setPhaseSync('dead-squish')
        }

        // Commit transforms (apply horizontal flip based on facing direction)
        if (capooRef.current) {
          const flip = facingRef.current === -1 ? -1 : 1
          capooRef.current.style.transform = `translate3d(${capooXRef.current - CAPOO_W / 2}px, ${capooYRef.current}px, 0) scaleX(${flip})`
        }
      }

      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [setPhaseSync])

  // Convert a card index to its corresponding scroll-Y position.
  // Card N's "view" is at railTop + N * scrollPerCard, matching the rail's
  // natural per-card spacing so framer-motion places the cards as expected.
  const scrollYForCard = useCallback((idx: number) => {
    return railTopRef.current + idx * getScrollPerCard()
  }, [])

  // Start the per-card race: scroll smoothly from this card's view to the next
  // card's view over CARD_TIME_MS. As the page scrolls, the next card animates
  // into the stack on top of the current one — that's the time pressure.
  const startCardRace = useCallback((idx: number) => {
    const fromScrollY = scrollYForCard(idx)
    const toScrollY = scrollYForCard(idx + 1)
    scrollAnimRef.current = {
      from: fromScrollY,
      to: toScrollY,
      startedAt: performance.now(),
      duration: CARD_TIME_MS,
    }
  }, [scrollYForCard])

  // Teleport Capoo to the next card and snap-scroll the page to that card's view.
  const advanceToNextCard = useCallback(() => {
    const nextIdx = currentCardIdxRef.current + 1
    if (nextIdx >= PROJECT_NAMES.length) return
    currentCardIdxRef.current = nextIdx
    const nextDisplay = PROJECT_NAMES[nextIdx]
    reachedCardRef.current = nextDisplay
    teleportingRef.current = true
    capooVyRef.current = 0
    facingRef.current = 1

    const targetScrollY = scrollYForCard(nextIdx)
    const teleportDuration = 600
    scrollAnimRef.current = {
      from: window.scrollY,
      to: targetScrollY,
      startedAt: performance.now(),
      duration: teleportDuration,
    }

    // After the snap-scroll completes, hand control back to physics and start
    // the race timer for the new card.
    window.setTimeout(() => {
      teleportingRef.current = false
      startCardRace(nextIdx)
    }, teleportDuration + 80)
  }, [scrollYForCard, startCardRace])

  const restart = useCallback(() => {
    window.scrollTo(0, scrollFromRef.current)
    currentCardIdxRef.current = 0
    reachedCardRef.current = PROJECT_NAMES[0]
    capooYRef.current = 40
    capooVyRef.current = 0
    onWordElRef.current = null
    onWordRectRef.current = null
    lastFrameRef.current = null
    facingRef.current = 1
    lastGroundedAtRef.current = 0
    jumpBufferedUntilRef.current = 0
    jumpHeldRef.current = false
    teleportingRef.current = false
    scrollAnimRef.current = null
    // Clear all flag-reached markers
    reachedFlagsRef.current.clear()
    document.querySelectorAll('.flag-reached').forEach(el => el.classList.remove('flag-reached'))
    setReachedFlagsTick(n => n + 1)
    // Position Capoo directly on top of the first card's first word
    setTimeout(() => {
      const first = findFirstWordRectForCard(PROJECT_NAMES[0])
      if (first) {
        const r = first.rect
        capooXRef.current = (r.left + r.right) / 2
        capooYRef.current = r.top - CAPOO_H
      } else {
        capooXRef.current = window.innerWidth * 0.35
      }
    }, 50)
    setPhaseSync('starting')
    setTimeout(() => {
      setPhaseSync('playing')
      startCardRace(0)
    }, START_DELAY_MS)
  }, [setPhaseSync, startCardRace])

  // Keep a ref pointing at the latest restart so the input handler (which only
  // closes over the initial value) can call the current one.
  useEffect(() => { restartRef.current = restart }, [restart])

  // Start the race from the intro screen
  const beginPlay = useCallback(() => {
    // Re-place Capoo on Kiwix's first word in case layout shifted
    const first = findFirstWordRectForCard(PROJECT_NAMES[0])
    if (first) {
      const r = first.rect
      capooXRef.current = (r.left + r.right) / 2
      capooYRef.current = r.top - CAPOO_H
    }
    capooVyRef.current = 0
    setPhaseSync('playing')
    startCardRace(0)
  }, [setPhaseSync, startCardRace])

  return (
    <>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* HUD: flag progress counter (kept so the user sees their progress) */}
        {phase !== 'intro' && (
          <div
            data-game-ui
            className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-medium pointer-events-none whitespace-nowrap"
            style={{
              color: '#0671A4',
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(6, 113, 164, 0.2)',
              backdropFilter: 'blur(4px)',
            }}
            key={reachedFlagsTick}
          >
            Flags {reachedFlagsRef.current.size} / {PROJECT_NAMES.length}
          </div>
        )}

        {/* Exit button (hidden during intro since the intro modal has its own Exit) */}
        {phase !== 'intro' && (
          <button
            data-game-ui
            onClick={(e) => { e.stopPropagation(); onExit() }}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium pointer-events-auto"
            style={{
              color: '#0671A4',
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(6, 113, 164, 0.25)',
              backdropFilter: 'blur(6px)',
              cursor: 'pointer',
            }}
          >
            Exit
          </button>
        )}

        {/* Intro modal — shown immediately when the user opens the game */}
        {phase === 'intro' && (
          <div
            data-game-ui
            className="absolute inset-0 flex items-center justify-center pointer-events-auto px-4"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onExit() }}
          >
            <div
              className="relative rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
              style={{
                background: 'rgba(239, 243, 248, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(6, 113, 164, 0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header — title + subtitle on the left, close on the right */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div>
                  <h3 className="font-normal" style={{ color: '#0671A4', fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}>
                    Project platformer
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(6, 113, 164, 0.5)' }}>
                    Race through every project to Experience
                  </p>
                </div>
                <button
                  onClick={onExit}
                  className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                  style={{ color: '#0671A4' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 113, 164, 0.1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  aria-label="Exit"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-5 pb-5 pt-3">
                <p className="text-sm mb-4" style={{ color: 'rgba(6, 113, 164, 0.85)' }}>
                  Hop across the words on each project card and touch the orange ⚑ flag before the next card stacks on top of you.
                </p>
                <div
                  className="rounded-xl py-3 px-4 mb-5 mx-auto"
                  style={{
                    background: '#F4F4F4',
                    border: '1px solid rgba(6, 113, 164, 0.15)',
                    width: 'fit-content',
                  }}
                >
                  <div
                    className="grid items-center gap-x-3 gap-y-2 text-sm"
                    style={{ gridTemplateColumns: 'auto 1fr', color: 'rgba(6, 113, 164, 0.85)' }}
                  >
                    {isMobile ? (
                      <>
                        <div className="flex items-center gap-1 justify-end">
                          <kbd className="capoo-key">◀</kbd>
                          <kbd className="capoo-key">▶</kbd>
                        </div>
                        <span>tap arrows to move</span>

                        <div className="flex items-center gap-1 justify-end">
                          <kbd className="capoo-key">▲</kbd>
                        </div>
                        <span>tap to jump (hold for higher)</span>

                        <div className="flex items-center gap-1 justify-end">
                          <kbd className="capoo-key">Exit</kbd>
                        </div>
                        <span>top-right button</span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 justify-end">
                          <kbd className="capoo-key">←</kbd>
                          <kbd className="capoo-key">→</kbd>
                        </div>
                        <span>move</span>

                        <div className="flex items-center gap-1 justify-end">
                          <kbd className="capoo-key">Space</kbd>
                          <span className="text-[11px] opacity-60">/</span>
                          <kbd className="capoo-key">↑</kbd>
                        </div>
                        <span>jump (hold for higher)</span>

                        <div className="flex items-center gap-1 justify-end">
                          <kbd className="capoo-key">R</kbd>
                        </div>
                        <span>restart</span>

                        <div className="flex items-center gap-1 justify-end">
                          <kbd className="capoo-key">Esc</kbd>
                        </div>
                        <span>exit</span>
                      </>
                    )}
                  </div>
                </div>
                <RippleButton
                  onClick={(e) => { e.stopPropagation(); beginPlay() }}
                  className="w-full px-6 py-2.5 rounded-full text-sm font-medium text-white cursor-pointer"
                  rippleColor="#38BDF8"
                  style={{
                    backgroundColor: '#0671A4',
                    border: '2px solid transparent',
                    boxShadow: '0 2px 8px rgba(6, 113, 164, 0.18)',
                    transition: 'background-color 0.3s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#055a84' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0671A4' }}
                >
                  Start
                </RippleButton>
              </div>
            </div>
          </div>
        )}

        {/* Mobile touch controls — only visible during play on small viewports */}
        {isMobile && phase !== 'intro' && (
          <div
            data-game-ui
            className="absolute inset-x-0 flex items-center justify-between pointer-events-none px-4"
            style={{
              bottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
            }}
          >
            <div className="flex gap-3 pointer-events-auto">
              <button
                aria-label="Move left"
                onPointerDown={(e) => { e.preventDefault(); moveLeftRef.current = true; facingRef.current = -1 }}
                onPointerUp={() => { moveLeftRef.current = false }}
                onPointerCancel={() => { moveLeftRef.current = false }}
                onPointerLeave={() => { moveLeftRef.current = false }}
                className="flex items-center justify-center rounded-full select-none"
                style={{
                  width: 52,
                  height: 52,
                  background: 'rgba(255,255,255,0.92)',
                  border: '1.5px solid rgba(6, 113, 164, 0.35)',
                  color: '#0671A4',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                  touchAction: 'none',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                aria-label="Move right"
                onPointerDown={(e) => { e.preventDefault(); moveRightRef.current = true; facingRef.current = 1 }}
                onPointerUp={() => { moveRightRef.current = false }}
                onPointerCancel={() => { moveRightRef.current = false }}
                onPointerLeave={() => { moveRightRef.current = false }}
                className="flex items-center justify-center rounded-full select-none"
                style={{
                  width: 52,
                  height: 52,
                  background: 'rgba(255,255,255,0.92)',
                  border: '1.5px solid rgba(6, 113, 164, 0.35)',
                  color: '#0671A4',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                  touchAction: 'none',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
            <button
              aria-label="Jump"
              onPointerDown={(e) => {
                e.preventDefault()
                jumpBufferedUntilRef.current = performance.now() + JUMP_BUFFER_MS
                jumpHeldRef.current = true
              }}
              onPointerUp={() => { jumpHeldRef.current = false }}
              onPointerCancel={() => { jumpHeldRef.current = false }}
              className="flex items-center justify-center rounded-full select-none pointer-events-auto"
              style={{
                width: 52,
                height: 52,
                background: '#0671A4',
                border: '1.5px solid #055a84',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(6, 113, 164, 0.35)',
                touchAction: 'none',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Capoo (hidden during the intro screen so it doesn't peek out of the corner) */}
        <div
          ref={capooRef}
          className="absolute"
          style={{
            top: 0,
            left: 0,
            width: CAPOO_W,
            height: CAPOO_H,
            willChange: 'transform',
            transform: `translate3d(${capooXRef.current - CAPOO_W / 2}px, ${capooYRef.current}px, 0)`,
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

        {/* End modal */}
        {(phase === 'dead-top' || phase === 'dead-bottom' || phase === 'dead-squish' || phase === 'won') && (
          <div
            data-game-ui
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
            style={{
              background: 'rgba(228, 239, 245, 0.92)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div className="text-3xl font-normal mb-2 text-center px-6" style={{ color: '#0671A4' }}>
              {phase === 'won'
                ? 'You made it!'
                : phase === 'dead-squish'
                  ? 'Smooshed by the next card'
                  : phase === 'dead-top'
                    ? 'Squished off the top'
                    : 'Off the bottom'}
            </div>
            <div className="text-sm mb-5 text-center px-6 max-w-md" style={{ color: 'rgba(6, 113, 164, 0.75)' }}>
              {phase === 'won'
                ? 'You hopped through every project all the way to Experience.'
                : phase === 'dead-squish'
                  ? `The next card squished you on ${reachedCardRef.current}. Reach the flag faster next time.`
                  : reachedCardRef.current
                    ? `You made it to ${reachedCardRef.current}.`
                    : 'Land on a platform, fall through the gaps — use ← → to find an opening.'}
            </div>
            <div className="flex gap-3">
              <RippleButton
                onClick={(e) => { e.stopPropagation(); restart() }}
                className="px-5 py-2 rounded-full text-sm font-medium text-white cursor-pointer"
                rippleColor="#38BDF8"
                style={{
                  backgroundColor: '#0671A4',
                  border: '2px solid transparent',
                  boxShadow: '0 2px 8px rgba(6, 113, 164, 0.12)',
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#055a84' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0671A4' }}
              >
                <span className="inline-flex items-center gap-1.5 retry-btn">
                  <svg className="retry-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <polyline points="3 3 3 9 9 9" />
                  </svg>
                  {phase === 'won' ? 'Play Again' : 'Try Again'}
                </span>
              </RippleButton>
              <RippleButton
                onClick={(e) => { e.stopPropagation(); onExit() }}
                className="px-5 py-2 rounded-full text-sm font-normal cursor-pointer"
                rippleColor="#38BDF8"
                style={{
                  color: '#0671A4',
                  backgroundColor: 'transparent',
                  border: '2px solid rgba(6, 113, 164, 0.3)',
                  transition: 'background-color 0.3s, border-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(6, 113, 164, 0.06)'
                  e.currentTarget.style.borderColor = '#0671A4'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(6, 113, 164, 0.3)'
                }}
              >
                Exit
              </RippleButton>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
