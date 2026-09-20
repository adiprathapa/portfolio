import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseButton } from '../ui/close-button'
import { PillButton } from '../ui/pill-button'
import { COLOR, PRIMARY, SURFACE, TEXT } from '../../lib/theme'
import { formatClock } from '../../lib/time'
import { DECK_POOL } from './deck'
import { FlipCard } from './FlipCard'
import { CONVEYOR_KEYFRAMES, ConveyorRows } from './ConveyorRows'
import { useMemoryGame } from './useMemoryGame'

interface Difficulty {
  label: string
  pairs: number
  /** 0 for the conveyor board, which has no grid. */
  cols: number
  description: string
  conveyor?: boolean
}

const DIFFICULTIES: Difficulty[] = [
  { label: 'Easy', pairs: 8, cols: 4, description: '16 cards (4×4)' },
  { label: 'Medium', pairs: 12, cols: 6, description: '24 cards (6×4)' },
  { label: 'Hard', pairs: 18, cols: 6, description: '36 cards (6×6)' },
  { label: 'Very Hard', pairs: DECK_POOL.length, cols: 0, description: 'Moving conveyor', conveyor: true },
]

const GRID_GAP = 10

function modalWidthClass(difficulty: Difficulty | null) {
  if (!difficulty) return 'w-[min(95vw,400px)]'
  if (difficulty.conveyor) return 'w-[min(95vw,800px)]'
  return difficulty.cols === 6 ? 'w-[min(95vw,680px)]' : 'w-[min(95vw,520px)]'
}

/**
 * Fits the grid to whatever space the modal has, so a 6×6 board on a short
 * viewport shrinks its cards instead of overflowing.
 */
function useGridCardSize(
  modalRef: React.RefObject<HTMLDivElement | null>,
  difficulty: Difficulty | null,
  cardCount: number,
  gameOver: boolean,
) {
  const [size, setSize] = useState(80)

  useEffect(() => {
    if (!difficulty || difficulty.conveyor || gameOver) return

    const compute = () => {
      const modal = modalRef.current
      if (!modal) return
      const rows = Math.ceil(cardCount / difficulty.cols)
      const headerHeight = modal.querySelector<HTMLElement>('[data-match-header]')?.offsetHeight ?? 72
      const availableWidth = modal.getBoundingClientRect().width - 40
      const availableHeight = Math.min(window.innerHeight - 32, window.innerHeight * 0.9) - headerHeight - 20
      const widthFit = (availableWidth - GRID_GAP * (difficulty.cols - 1)) / difficulty.cols
      const heightFit = (availableHeight - GRID_GAP * (rows - 1)) / rows
      const ideal = difficulty.cols === 4 ? 104 : 96
      setSize(Math.max(44, Math.floor(Math.min(widthFit, heightFit, ideal))))
    }

    compute()
    window.addEventListener('resize', compute)
    const ro = new ResizeObserver(compute)
    if (modalRef.current) ro.observe(modalRef.current)
    return () => {
      window.removeEventListener('resize', compute)
      ro.disconnect()
    }
  }, [modalRef, cardCount, difficulty, gameOver])

  return size
}

export function MemoryMatch({ onClose, onConveyorGame }: { onClose: () => void; onConveyorGame?: () => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [conveyorPaused, setConveyorPaused] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const game = useMemoryGame()
  const gridCardSize = useGridCardSize(modalRef, difficulty, game.cards.length, game.gameOver)

  const start = (diff: Difficulty) => {
    setDifficulty(diff)
    setConveyorPaused(false)
    game.deal(diff.pairs)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isConveyor = !!difficulty?.conveyor

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
      {isConveyor && <style>{CONVEYOR_KEYFRAMES}</style>}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.3, 1] }}
        className={`relative overflow-hidden rounded-2xl shadow-2xl ${modalWidthClass(difficulty)}`}
        style={{
          background: 'rgba(239, 243, 248, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `1.5px solid ${PRIMARY.a30}`,
          maxHeight: 'calc(100dvh - 32px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div data-match-header className="flex items-center justify-between px-5 pb-2 pt-4">
          <div>
            <h3 className="font-normal" style={{ color: COLOR.primary, fontSize: TEXT.body }}>Matching Game</h3>
            <p className="mt-0.5 text-xs" style={{ color: PRIMARY.a50 }}>
              {difficulty ? `${difficulty.label} · ${difficulty.description}` : 'Match the tech stack pairs'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {difficulty && (
              <div className="font-mono text-xs" style={{ color: PRIMARY.a50 }}>
                {formatClock(game.elapsed)} &middot; {game.moves} {game.moves === 1 ? 'move' : 'moves'}
                {isConveyor && ` · ${game.matched.size / 2}/${game.cards.length / 2}`}
              </div>
            )}
            <CloseButton aria-label="Close game" onClick={onClose} />
          </div>
        </div>

        {!difficulty && (
          <div className="px-5 pb-6 pt-3">
            <div className="grid grid-cols-2 gap-2.5">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.label}
                  onClick={() => (diff.conveyor && onConveyorGame ? onConveyorGame() : start(diff))}
                  className="flex cursor-pointer flex-col items-center gap-1 rounded-xl px-4 py-4"
                  style={{
                    background: SURFACE.page,
                    border: `1.5px solid ${PRIMARY.a30}`,
                    transition: 'border-color 0.2s ease, background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = PRIMARY.a50
                    e.currentTarget.style.background = '#eef3f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = PRIMARY.a30
                    e.currentTarget.style.background = SURFACE.page
                  }}
                >
                  <span className="text-sm font-normal" style={{ color: COLOR.primary }}>{diff.label}</span>
                  <span className="text-xs font-normal" style={{ color: PRIMARY.a50 }}>{diff.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {difficulty && !isConveyor && !game.gameOver && (
          <div className="px-5 pb-5 pt-2">
            <div
              className="grid justify-center"
              style={{
                gap: GRID_GAP,
                gridTemplateColumns: `repeat(${difficulty.cols}, ${gridCardSize}px)`,
                '--match-card-size': `${gridCardSize}px`,
              } as React.CSSProperties}
            >
              {game.cards.map((card) => (
                <FlipCard
                  key={card.id}
                  card={card}
                  faceUp={game.isFaceUp(card.id)}
                  matched={game.isMatched(card.id)}
                  onFlip={() => game.flip(card.id)}
                  small={gridCardSize < 82}
                  sizeClass="w-[var(--match-card-size)] h-[var(--match-card-size)]"
                />
              ))}
            </div>
          </div>
        )}

        {isConveyor && !game.gameOver && (
          <div
            className="space-y-2.5 px-5 pb-5 pt-2"
            onMouseEnter={() => setConveyorPaused(true)}
            onMouseLeave={() => setConveyorPaused(false)}
          >
            <ConveyorRows
              cards={game.cards}
              paused={conveyorPaused}
              isFaceUp={game.isFaceUp}
              isMatched={game.isMatched}
              onFlip={game.flip}
              durations={[50, 55]}
              gapClass="gap-2.5"
              small
              rowWrapper={(children, i) => (
                <div key={i} style={{ clipPath: 'inset(-8px 0 -8px 0 round 12px)' }}>{children}</div>
              )}
            />
          </div>
        )}

        <AnimatePresence>
          {game.gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <p className="mb-1 font-normal" style={{ color: COLOR.primary, fontSize: TEXT.h2 }}>Nice!</p>
              <p className="mb-5 text-sm" style={{ color: PRIMARY.a50 }}>
                {difficulty?.label} &middot; {formatClock(game.elapsed)} &middot; {game.moves} moves
              </p>
              <div className="flex gap-3">
                <PillButton onClick={() => difficulty && start(difficulty)}>Play Again</PillButton>
                <PillButton variant="ghost" className="font-normal" onClick={() => setDifficulty(null)}>
                  Change Difficulty
                </PillButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
