import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectMarquee } from './About'
import { GithubHeatmap } from './GithubHeatmap'
import { MemoryMatch, TECH_POOL, buildDeck, FlipCard, formatTime } from './MemoryMatch'
import type { TechCard } from './MemoryMatch'
import { RippleButton } from './ui/ripple-button'

const CONVEYOR_GAME_CSS = `
@keyframes cg-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes cg-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
`

function ConveyorMatchGame({ onClose }: { onClose: () => void }) {
  const [cards, setCards] = useState<TechCard[]>(() => buildDeck(TECH_POOL.length))
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const canHoverRef = useRef(false)
  const lockRef = useRef(false)

  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => { canHoverRef.current = mql.matches }
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!startTime || gameOver) return
    const id = setInterval(() => setElapsed(Date.now() - startTime), 200)
    return () => clearInterval(id)
  }, [startTime, gameOver])

  useEffect(() => {
    if (cards.length > 0 && matched.size === cards.length) setGameOver(true)
  }, [matched, cards.length])

  const handleFlip = useCallback((id: number) => {
    if (lockRef.current) return
    if (flipped.has(id) || matched.has(id)) return
    if (!startTime) setStartTime(Date.now())

    const newSelected = [...selected, id]
    setFlipped(prev => new Set([...prev, id]))
    setSelected(newSelected)

    if (newSelected.length === 2) {
      setMoves(m => m + 1)
      lockRef.current = true
      const [firstId, secondId] = newSelected
      const first = cards.find(c => c.id === firstId)!
      const second = cards.find(c => c.id === secondId)!

      if (first.pairIndex === second.pairIndex) {
        setTimeout(() => {
          setMatched(prev => new Set([...prev, firstId, secondId]))
          setSelected([])
          lockRef.current = false
        }, 500)
      } else {
        setTimeout(() => {
          setFlipped(prev => {
            const next = new Set(prev)
            next.delete(firstId)
            next.delete(secondId)
            return next
          })
          setSelected([])
          lockRef.current = false
        }, 800)
      }
    }
  }, [selected, flipped, matched, cards, startTime])

  const restart = () => {
    setCards(buildDeck(TECH_POOL.length))
    setFlipped(new Set())
    setMatched(new Set())
    setSelected([])
    setMoves(0)
    setStartTime(null)
    setElapsed(0)
    setGameOver(false)
    setPaused(false)
    lockRef.current = false
  }

  const row1 = cards.slice(0, Math.ceil(cards.length / 2))
  const row2 = cards.slice(Math.ceil(cards.length / 2))

  const cardSize = 'w-[var(--conveyor-card-size)] h-[var(--conveyor-card-size)]'

  return (
    <div className="h-full flex flex-col">
      <style>{CONVEYOR_GAME_CSS}</style>

      {/* Stats bar */}
      <div className="mx-auto max-w-7xl px-6 mb-2 flex items-center gap-3">
        <span className="text-sm font-normal" style={{ color: '#0671A4' }}>Very Hard</span>
        <span className="text-xs font-mono" style={{ color: 'rgba(6, 113, 164, 0.5)' }}>
          {formatTime(elapsed)} &middot; {moves} {moves === 1 ? 'move' : 'moves'} &middot; {matched.size / 2}/{cards.length / 2}
        </span>
      </div>

      {gameOver ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 md:py-20"
        >
          <p className="text-2xl font-normal mb-1" style={{ color: '#0671A4' }}>Nice!</p>
          <p className="text-sm mb-5" style={{ color: 'rgba(6, 113, 164, 0.5)' }}>
            Very Hard &middot; {formatTime(elapsed)} &middot; {moves} moves
          </p>
          <div className="flex gap-3">
            <RippleButton
              onClick={restart}
              className="px-5 py-2 rounded-full text-sm font-medium text-white cursor-pointer"
              rippleColor="#38BDF8"
              style={{
                backgroundColor: '#0671A4',
                border: '2px solid transparent',
                boxShadow: '0 2px 8px rgba(6, 113, 164, 0.12)',
                transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#055a84' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0671A4' }}
            >
              Play Again
            </RippleButton>
            <RippleButton
              onClick={onClose}
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
        </motion.div>
      ) : (
        <div
          className="flex-1 flex flex-col justify-center space-y-2 md:space-y-3"
          onMouseEnter={() => { if (canHoverRef.current) setPaused(true) }}
          onMouseLeave={() => { if (canHoverRef.current) setPaused(false) }}
        >
          {/* Row 1 — scrolls left */}
          <div className="overflow-hidden">
            <div
              className="flex gap-3 md:gap-4"
              style={{
                width: 'max-content',
                animation: 'cg-left 60s linear infinite',
                animationPlayState: paused ? 'paused' : 'running',
              }}
            >
              {[...row1, ...row1].map((card, i) => (
                <FlipCard
                  key={`r1-${i}`}
                  card={card}
                  isFlipped={flipped.has(card.id) || matched.has(card.id)}
                  isMatched={matched.has(card.id)}
                  onFlip={() => handleFlip(card.id)}
                  sizeClass={cardSize}
                />
              ))}
            </div>
          </div>
          {/* Row 2 — scrolls right */}
          <div className="overflow-hidden">
            <div
              className="flex gap-3 md:gap-4"
              style={{
                width: 'max-content',
                animation: 'cg-right 65s linear infinite',
                animationPlayState: paused ? 'paused' : 'running',
              }}
            >
              {[...row2, ...row2].map((card, i) => (
                <FlipCard
                  key={`r2-${i}`}
                  card={card}
                  isFlipped={flipped.has(card.id) || matched.has(card.id)}
                  isMatched={matched.has(card.id)}
                  onFlip={() => handleFlip(card.id)}
                  sizeClass={cardSize}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ProjectsIntro() {
  const [active, setActive] = useState(false)
  const [showMemoryGame, setShowMemoryGame] = useState(false)
  const [conveyorGameActive, setConveyorGameActive] = useState(false)
  const [conveyorGameKey, setConveyorGameKey] = useState(0)
  const [lockedHeight, setLockedHeight] = useState<number | undefined>(undefined)
  const [unlockHeightAfterReturn, setUnlockHeightAfterReturn] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const conveyorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleConveyorGame = () => {
    // Capture current height before switching
    if (conveyorRef.current) {
      setLockedHeight(conveyorRef.current.offsetHeight)
    }
    setUnlockHeightAfterReturn(false)
    setShowMemoryGame(false)
    setConveyorGameKey((key) => key + 1)
    setConveyorGameActive(true)
    setTimeout(() => {
      conveyorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const handleEndConveyorGame = () => {
    setConveyorGameActive(false)
    setUnlockHeightAfterReturn(true)
  }

  return (
    <section ref={ref} id="projects-intro" className="pt-6 pb-0 lg:pt-12" style={{ background: '#E4EFF5' }}>
      {/* Projects heading + description */}
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-2xl lg:text-3xl font-normal gradient-text">
          Projects
        </h2>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mt-2">
          <p className="text-black text-base lg:text-xl leading-relaxed max-w-4xl">
            I am a fullstack developer who mainly works in Python, Java, and for frontend
            in JavaScript and TypeScript. I have experience working with a variety of machine
            learning and data science libraries like PyTorch, TensorFlow, scikit-learn, pandas,
            and more. My projects range from fintech applications to machine learning focused
            projects to apps that combine both.
          </p>
          <motion.button
            layout
            transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
            onClick={() => { if (conveyorGameActive) { handleEndConveyorGame() } else { setShowMemoryGame(true) } }}
            className="shrink-0 self-center lg:self-auto flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full cursor-pointer"
            style={{
              color: '#0671A4',
              background: 'rgba(6, 113, 164, 0.08)',
              border: '1px solid rgba(6, 113, 164, 0.15)',
              transition: 'background 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 113, 164, 0.15)'; e.currentTarget.style.borderColor = 'rgba(6, 113, 164, 0.4)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(6, 113, 164, 0.08)'; e.currentTarget.style.borderColor = 'rgba(6, 113, 164, 0.15)' }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {conveyorGameActive ? (
                <motion.span
                  key="end-game"
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  End Game
                </motion.span>
              ) : (
                <motion.span
                  key="matching-game"
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="8" height="8" rx="1" />
                    <rect x="14" y="2" width="8" height="8" rx="1" />
                    <rect x="2" y="14" width="8" height="8" rx="1" />
                    <rect x="14" y="14" width="8" height="8" rx="1" />
                  </svg>
                  Matching
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showMemoryGame && (
          <MemoryMatch
            onClose={() => setShowMemoryGame(false)}
            onConveyorGame={handleConveyorGame}
          />
        )}
      </AnimatePresence>

      {/* Marquee conveyor / Conveyor game */}
      <div
        ref={conveyorRef}
        className="conveyor-flip-stage relative mt-6 lg:mt-10 -my-4 overflow-hidden"
        style={{ perspective: 1200, height: lockedHeight ? lockedHeight : undefined }}
      >
        <motion.div
          className="h-full"
          animate={{ rotateX: conveyorGameActive ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
          onAnimationComplete={() => {
            if (!conveyorGameActive && unlockHeightAfterReturn) {
              setLockedHeight(undefined)
              setUnlockHeightAfterReturn(false)
            }
          }}
        >
          <motion.div
            className="relative h-full"
            animate={{ opacity: conveyorGameActive ? 0 : 1 }}
            transition={{ duration: 0.08, delay: conveyorGameActive ? 0.26 : 0.26 }}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: conveyorGameActive ? 'none' : 'auto',
            }}
          >
            <div className="project-marquee">
              <ProjectMarquee active={active && !conveyorGameActive} />
            </div>
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-8 lg:w-32 z-10"
              style={{ background: 'linear-gradient(to right, #E4EFF5, transparent)' }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-8 lg:w-32 z-10"
              style={{ background: 'linear-gradient(to left, #E4EFF5, transparent)' }}
            />
          </motion.div>
          <motion.div
            className="absolute inset-0 h-full"
            animate={{ opacity: conveyorGameActive ? 1 : 0 }}
            transition={{ duration: 0.08, delay: conveyorGameActive ? 0.26 : 0.26 }}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              pointerEvents: conveyorGameActive ? 'auto' : 'none',
            }}
          >
            <div
              style={{
                height: '100%',
              }}
            >
              <ConveyorMatchGame key={conveyorGameKey} onClose={handleEndConveyorGame} />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* GitHub heatmap */}
      <div className="mt-4 lg:mt-8">
        <GithubHeatmap />
      </div>
    </section>
  )
}
