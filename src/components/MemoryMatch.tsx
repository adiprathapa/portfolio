import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RippleButton } from './ui/ripple-button'

export interface TechCard {
  id: number
  name: string
  icon: string
  colorIcon: string
  pairIndex: number
}

export const TECH_POOL = [
  { name: 'React', icon: '/icons/react-0671A4.svg', colorIcon: '/icons/react.svg' },
  { name: 'Python', icon: '/icons/python-0671A4.svg', colorIcon: '/icons/python.svg' },
  { name: 'TypeScript', icon: '/icons/typescript-0671A4.svg', colorIcon: '/icons/typescript.svg' },
  { name: 'PyTorch', icon: '/icons/pytorch-0671A4.svg', colorIcon: '/icons/pytorch.svg' },
  { name: 'Node.js', icon: '/icons/nodedotjs-0671A4.svg', colorIcon: '/icons/nodedotjs.svg' },
  { name: 'Java', icon: '/icons/openjdk-0671A4.svg', colorIcon: '/icons/openjdk.svg' },
  { name: 'Docker', icon: '/icons/docker-0671A4.svg', colorIcon: '/icons/docker.svg' },
  { name: 'PostgreSQL', icon: '/icons/postgresql-0671A4.svg', colorIcon: '/icons/postgresql.svg' },
  { name: 'Vue.js', icon: '/icons/vuedotjs-0671A4.svg', colorIcon: '/icons/vuedotjs.svg' },
  { name: 'Git', icon: '/icons/git-0671A4.svg', colorIcon: '/icons/git.svg' },
  { name: 'MongoDB', icon: '/icons/mongodb-0671A4.svg', colorIcon: '/icons/mongodb.svg' },
  { name: 'TensorFlow', icon: '/icons/tensorflow-0671A4.svg', colorIcon: '/icons/tensorflow.svg' },
  { name: 'JavaScript', icon: '/icons/javascript-0671A4.svg', colorIcon: '/icons/javascript.svg' },
  { name: 'FastAPI', icon: '/icons/fastapi-0671A4.svg', colorIcon: '/icons/fastapi.svg' },
  { name: 'HTML5', icon: '/icons/html5-0671A4.svg', colorIcon: '/icons/html5.svg' },
  { name: 'CSS3', icon: '/icons/css-0671A4.svg', colorIcon: '/icons/css.svg' },
  { name: 'Flask', icon: '/icons/flask-0671A4.svg', colorIcon: '/icons/flask.svg' },
  { name: 'GitHub', icon: '/icons/github-0671A4.svg', colorIcon: '/icons/github.svg' },
  { name: 'Supabase', icon: '/icons/supabase-0671A4.svg', colorIcon: '/icons/supabase.svg' },
  { name: 'Redis', icon: '/icons/redis-0671A4.svg', colorIcon: '/icons/redis.svg' },
  { name: 'pandas', icon: '/icons/pandas-0671A4.svg', colorIcon: '/icons/pandas.svg' },
  { name: 'NumPy', icon: '/icons/numpy-0671A4.svg', colorIcon: '/icons/numpy.svg' },
  { name: 'D3.js', icon: '/icons/d3-0671A4.svg', colorIcon: '/icons/d3.svg' },
  { name: 'scikit-learn', icon: '/icons/scikitlearn-0671A4.svg', colorIcon: '/icons/scikitlearn.svg' },
  { name: 'Express', icon: '/icons/express-0671A4.svg', colorIcon: '/icons/express.svg' },
  { name: 'Vercel', icon: '/icons/vercel-0671A4.svg', colorIcon: '/icons/vercel.svg' },
  { name: 'IPFS', icon: '/icons/ipfs-0671A4.svg', colorIcon: '/icons/ipfs.svg' },
  { name: 'Gemini API', icon: '/icons/googlegemini-0671A4.svg', colorIcon: '/icons/googlegemini.svg' },
  { name: 'Ollama', icon: '/icons/ollama-0671A4.svg', colorIcon: '/icons/ollama.svg' },
  { name: 'CUDA', icon: '/icons/nvidia-0671A4.svg', colorIcon: '/icons/nvidia.svg' },
  { name: 'Clerk', icon: '/icons/clerk-0671A4.svg', colorIcon: '/icons/clerk.svg' },
  { name: 'Leaflet', icon: '/icons/leaflet-0671A4.svg', colorIcon: '/icons/leaflet.svg' },
  { name: 'PostHog', icon: '/icons/posthog-0671A4.svg', colorIcon: '/icons/posthog.svg' },
  { name: 'Hugging Face', icon: '/icons/huggingface-0671A4.svg', colorIcon: '/icons/huggingface.svg' },
  { name: 'Plotly', icon: '/icons/plotly-0671A4.svg', colorIcon: '/icons/plotly.svg' },
  { name: 'Apache', icon: '/icons/apache-0671A4.svg', colorIcon: '/icons/apache.svg' },
  { name: 'NetworkX', icon: '/networkx.png', colorIcon: '/networkx.png' },
  { name: 'Google ADK', icon: '/icons/google-0671A4.svg', colorIcon: '/icons/google.svg' },
  { name: 'Confluence', icon: '/icons/confluence-0671A4.svg', colorIcon: '/icons/confluence.svg' },
  { name: 'CodeMirror', icon: '/icons/codemirror-0671A4.svg', colorIcon: '/icons/codemirror.svg' },
  { name: 'YAML', icon: '/icons/yaml-0671A4.svg', colorIcon: '/icons/yaml.svg' },
  { name: 'GitHub Actions', icon: '/icons/githubactions-0671A4.svg', colorIcon: '/icons/githubactions.svg' },
  { name: 'Claude API', icon: '/claude.svg', colorIcon: '/claude.svg' },
  { name: 'Mistral AI', icon: '/icons/mistralai-0671A4.svg', colorIcon: '/icons/mistralai.svg' },
  { name: 'Palantir', icon: '/icons/palantir-0671A4.svg', colorIcon: '/icons/palantir.svg' },
  { name: 'MediaPipe', icon: '/icons/mediapipe-0671A4.svg', colorIcon: '/icons/mediapipe.svg' },
  { name: 'ElevenLabs', icon: '/icons/elevenlabs-0671A4.svg', colorIcon: '/icons/elevenlabs.svg' },
  { name: 'Matplotlib', icon: '/matplotlib-mark.svg', colorIcon: '/matplotlib-rainbow.svg' },
]

interface Difficulty {
  label: string
  pairs: number
  cols: number
  description: string
  conveyor?: boolean
}

const DIFFICULTIES: Difficulty[] = [
  { label: 'Easy', pairs: 8, cols: 4, description: '16 cards (4×4)' },
  { label: 'Medium', pairs: 12, cols: 6, description: '24 cards (6×4)' },
  { label: 'Hard', pairs: 18, cols: 6, description: '36 cards (6×6)' },
  { label: 'Very Hard', pairs: TECH_POOL.length, cols: 0, description: 'Moving conveyor', conveyor: true },
]

const CARD_BACKGROUND = '#f4f4f4'

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildDeck(pairCount: number): TechCard[] {
  const picked = shuffle(TECH_POOL).slice(0, pairCount)
  const cards: TechCard[] = []
  picked.forEach((tech, pairIndex) => {
    cards.push({ id: pairIndex * 2, name: tech.name, icon: tech.icon, colorIcon: tech.colorIcon, pairIndex })
    cards.push({ id: pairIndex * 2 + 1, name: tech.name, icon: tech.icon, colorIcon: tech.colorIcon, pairIndex })
  })
  return shuffle(cards)
}

export function formatTime(ms: number) {
  const secs = Math.floor(ms / 1000)
  const mins = Math.floor(secs / 60)
  const s = secs % 60
  return `${mins}:${s.toString().padStart(2, '0')}`
}

export function FlipCard({
  card, isFlipped, isMatched, onFlip, small, sizeClass,
}: {
  card: TechCard; isFlipped: boolean; isMatched: boolean; onFlip: () => void; small?: boolean; sizeClass?: string
}) {
  const defaultSizeClass = small ? 'w-[72px] h-[72px] md:w-[80px] md:h-[80px]' : 'aspect-square'
  return (
    <div
      className={`cursor-pointer shrink-0 ${sizeClass ?? defaultSizeClass}`}
      style={{ perspective: 600, overflow: 'visible' }}
      onClick={onFlip}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d', overflow: 'visible', willChange: 'transform' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.3, 1] }}
      >
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden', background: CARD_BACKGROUND, border: '1.5px solid rgba(6, 113, 164, 0.3)' }}
        >
          <span className="text-2xl font-bold select-none" style={{ color: 'rgba(6, 113, 164, 0.25)' }}>?</span>
        </div>
        <div
          className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-1 p-1.5"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: CARD_BACKGROUND,
            border: '1.5px solid rgba(6, 113, 164, 0.3)',
            opacity: isMatched ? 0.5 : 1,
          }}
        >
          <img
            src={card.colorIcon}
            alt={card.name}
            className={`object-contain ${small ? 'w-6 h-6' : 'w-8 h-8 md:w-10 md:h-10'}`}
            draggable={false}
          />
          <span className={`font-medium text-center leading-tight truncate w-full ${small ? 'text-[8px]' : 'text-[10px] md:text-xs'}`} style={{ color: '#0671A4' }}>
            {card.name}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

const CONVEYOR_CSS = `
@keyframes conveyor-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes conveyor-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
`

export function MemoryMatch({ onClose, onConveyorGame }: { onClose: () => void; onConveyorGame?: () => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [cards, setCards] = useState<TechCard[]>([])
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [conveyorPaused, setConveyorPaused] = useState(false)
  const [gridCardSize, setGridCardSize] = useState(80)
  const modalRef = useRef<HTMLDivElement>(null)
  const lockRef = useRef(false)

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff)
    setCards(buildDeck(diff.pairs))
    setFlipped(new Set())
    setMatched(new Set())
    setSelected([])
    setMoves(0)
    setStartTime(null)
    setElapsed(0)
    setGameOver(false)
    setConveyorPaused(false)
    lockRef.current = false
  }

  useEffect(() => {
    if (!startTime || gameOver) return
    const id = setInterval(() => setElapsed(Date.now() - startTime), 200)
    return () => clearInterval(id)
  }, [startTime, gameOver])

  useEffect(() => {
    if (cards.length > 0 && matched.size === cards.length) {
      setGameOver(true)
    }
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isConveyor = difficulty?.conveyor
  const row1 = cards.slice(0, Math.ceil(cards.length / 2))
  const row2 = cards.slice(Math.ceil(cards.length / 2))
  const gridGap = 10

  const modalWidth = !difficulty
    ? 'w-[min(95vw,400px)]'
    : isConveyor
      ? 'w-[min(95vw,800px)]'
      : difficulty.cols === 6
        ? 'w-[min(95vw,680px)]'
        : 'w-[min(95vw,520px)]'

  useEffect(() => {
    if (!difficulty || difficulty.conveyor || gameOver) return

    const computeCardSize = () => {
      const modal = modalRef.current
      if (!modal) return

      const rows = Math.ceil(cards.length / difficulty.cols)
      const modalRect = modal.getBoundingClientRect()
      const horizontalPadding = 40
      const verticalPadding = 20
      const headerHeight = modal.querySelector<HTMLElement>('[data-match-header]')?.offsetHeight ?? 72
      const maxUsableHeight = Math.min(window.innerHeight - 32, window.innerHeight * 0.9)
      const availableWidth = modalRect.width - horizontalPadding
      const availableHeight = maxUsableHeight - headerHeight - verticalPadding
      const widthFit = (availableWidth - gridGap * (difficulty.cols - 1)) / difficulty.cols
      const heightFit = (availableHeight - gridGap * (rows - 1)) / rows
      const idealSize = difficulty.cols === 4 ? 104 : 96
      const nextSize = Math.max(44, Math.floor(Math.min(widthFit, heightFit, idealSize)))

      setGridCardSize(nextSize)
    }

    computeCardSize()
    window.addEventListener('resize', computeCardSize)
    const ro = new ResizeObserver(computeCardSize)
    if (modalRef.current) ro.observe(modalRef.current)
    return () => {
      window.removeEventListener('resize', computeCardSize)
      ro.disconnect()
    }
  }, [cards.length, difficulty, gameOver])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', background: 'rgba(0, 0, 0, 0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {isConveyor && <style>{CONVEYOR_CSS}</style>}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.3, 1] }}
        className={`relative rounded-2xl shadow-2xl overflow-hidden ${modalWidth}`}
        style={{ background: 'rgba(239, 243, 248, 0.95)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(6, 113, 164, 0.3)', maxHeight: 'calc(100dvh - 32px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div data-match-header className="flex items-center justify-between px-5 pt-4 pb-2">
          <div>
            <h3 className="text-lg font-normal" style={{ color: '#0671A4' }}>Matching Game</h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(6, 113, 164, 0.5)' }}>
              {difficulty ? `${difficulty.label} · ${difficulty.description}` : 'Match the tech stack pairs'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {difficulty && (
              <div className="text-xs font-mono" style={{ color: 'rgba(6, 113, 164, 0.5)' }}>
                {formatTime(elapsed)} &middot; {moves} {moves === 1 ? 'move' : 'moves'}
                {isConveyor && ` · ${matched.size / 2}/${cards.length / 2}`}
              </div>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
              style={{ color: '#0671A4' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 113, 164, 0.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Difficulty Selection */}
        {!difficulty && (
          <div className="px-5 pb-6 pt-3">
            <div className="grid grid-cols-2 gap-2.5">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.label}
                  onClick={() => diff.conveyor && onConveyorGame ? onConveyorGame() : startGame(diff)}
                  className="flex flex-col items-center gap-1 px-4 py-4 rounded-xl cursor-pointer"
                  style={{
                    background: CARD_BACKGROUND,
                    border: '1.5px solid rgba(6, 113, 164, 0.3)',
                    transition: 'border-color 0.2s ease, background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(6, 113, 164, 0.5)'
                    e.currentTarget.style.background = '#eef3f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(6, 113, 164, 0.3)'
                    e.currentTarget.style.background = CARD_BACKGROUND
                  }}
                >
                  <span className="text-sm font-normal" style={{ color: '#0671A4' }}>{diff.label}</span>
                  <span className="text-xs font-normal" style={{ color: 'rgba(6, 113, 164, 0.5)' }}>{diff.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid mode */}
        {difficulty && !isConveyor && !gameOver && (
          <div className="px-5 pb-5 pt-2">
            <div
              className="grid justify-center"
              style={{
                gap: gridGap,
                gridTemplateColumns: `repeat(${difficulty.cols}, ${gridCardSize}px)`,
                '--match-card-size': `${gridCardSize}px`,
              } as React.CSSProperties}
            >
              {cards.map((card) => (
                <FlipCard
                  key={card.id}
                  card={card}
                  isFlipped={flipped.has(card.id) || matched.has(card.id)}
                  isMatched={matched.has(card.id)}
                  onFlip={() => handleFlip(card.id)}
                  small={gridCardSize < 82}
                  sizeClass="w-[var(--match-card-size)] h-[var(--match-card-size)]"
                />
              ))}
            </div>
          </div>
        )}

        {/* Conveyor mode */}
        {isConveyor && !gameOver && (
          <div
            className="px-5 pb-5 pt-2 space-y-2.5"
            onMouseEnter={() => setConveyorPaused(true)}
            onMouseLeave={() => setConveyorPaused(false)}
          >
            {/* Row 1 — scrolls left */}
            <div style={{ clipPath: 'inset(-8px 0 -8px 0 round 12px)' }}>
              <div
                className="flex gap-2.5"
                style={{
                  width: 'max-content',
                  animation: 'conveyor-left 50s linear infinite',
                  animationPlayState: conveyorPaused ? 'paused' : 'running',
                }}
              >
                {[...row1, ...row1].map((card, i) => (
                  <FlipCard
                    key={`r1-${i}`}
                    card={card}
                    isFlipped={flipped.has(card.id) || matched.has(card.id)}
                    isMatched={matched.has(card.id)}
                    onFlip={() => handleFlip(card.id)}
                    small
                  />
                ))}
              </div>
            </div>
            {/* Row 2 — scrolls right */}
            <div style={{ clipPath: 'inset(-8px 0 -8px 0 round 12px)' }}>
              <div
                className="flex gap-2.5"
                style={{
                  width: 'max-content',
                  animation: 'conveyor-right 55s linear infinite',
                  animationPlayState: conveyorPaused ? 'paused' : 'running',
                }}
              >
                {[...row2, ...row2].map((card, i) => (
                  <FlipCard
                    key={`r2-${i}`}
                    card={card}
                    isFlipped={flipped.has(card.id) || matched.has(card.id)}
                    isMatched={matched.has(card.id)}
                    onFlip={() => handleFlip(card.id)}
                    small
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Over */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <p className="text-2xl font-normal mb-1" style={{ color: '#0671A4' }}>Nice!</p>
              <p className="text-sm mb-5" style={{ color: 'rgba(6, 113, 164, 0.5)' }}>
                {difficulty?.label} &middot; {formatTime(elapsed)} &middot; {moves} moves
              </p>
              <div className="flex gap-3">
                <RippleButton
                  onClick={() => startGame(difficulty!)}
                  className="px-5 py-2 rounded-full text-sm font-medium text-white"
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
                  onClick={() => setDifficulty(null)}
                  className="px-5 py-2 rounded-full text-sm font-normal"
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
                  Change Difficulty
                </RippleButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
