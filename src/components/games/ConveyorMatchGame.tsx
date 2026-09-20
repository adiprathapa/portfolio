import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PillButton } from '../ui/pill-button'
import { useCanHoverRef } from '../../hooks/useMediaQuery'
import { COLOR, PRIMARY, TEXT } from '../../lib/theme'
import { formatClock } from '../../lib/time'
import { DECK_POOL } from './deck'
import { CONVEYOR_KEYFRAMES, ConveyorRows } from './ConveyorRows'
import { useMemoryGame } from './useMemoryGame'

/** The full-width board the projects marquee flips over to reveal. */
export function ConveyorMatchGame({ onClose }: { onClose: () => void }) {
  const game = useMemoryGame(DECK_POOL.length)
  const [paused, setPaused] = useState(false)
  const canHover = useCanHoverRef()

  useEffect(() => { if (game.gameOver) setPaused(false) }, [game.gameOver])

  const restart = () => {
    game.deal(DECK_POOL.length)
    setPaused(false)
  }

  const summary = `${formatClock(game.elapsed)} · ${game.moves} ${game.moves === 1 ? 'move' : 'moves'} · ${game.matched.size / 2}/${game.cards.length / 2}`

  return (
    <div className="flex h-full flex-col">
      <style>{CONVEYOR_KEYFRAMES}</style>

      <div className="mx-auto mb-2 flex max-w-7xl items-center gap-3 px-6">
        <span className="text-sm font-normal" style={{ color: COLOR.primary }}>Very Hard</span>
        <span className="font-mono text-xs" style={{ color: PRIMARY.a50 }}>{summary}</span>
      </div>

      {game.gameOver ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 md:py-20"
        >
          <p className="mb-1 font-normal" style={{ color: COLOR.primary, fontSize: TEXT.h2 }}>Nice!</p>
          <p className="mb-5 text-sm" style={{ color: PRIMARY.a50 }}>
            Very Hard &middot; {formatClock(game.elapsed)} &middot; {game.moves} moves
          </p>
          <div className="flex gap-3">
            <PillButton onClick={restart}>Play Again</PillButton>
            <PillButton variant="ghost" className="font-normal" onClick={onClose}>Exit</PillButton>
          </div>
        </motion.div>
      ) : (
        <div
          className="flex flex-1 flex-col justify-center space-y-2 md:space-y-3"
          onMouseEnter={() => { if (canHover.current) setPaused(true) }}
          onMouseLeave={() => { if (canHover.current) setPaused(false) }}
        >
          <ConveyorRows
            cards={game.cards}
            paused={paused}
            isFaceUp={game.isFaceUp}
            isMatched={game.isMatched}
            onFlip={game.flip}
            durations={[60, 65]}
            gapClass="gap-3 md:gap-4"
            cardSizeClass="w-[var(--conveyor-card-size)] h-[var(--conveyor-card-size)]"
            rowWrapper={(children, i) => <div key={i} className="conveyor-row-clip">{children}</div>}
          />
        </div>
      )}
    </div>
  )
}
