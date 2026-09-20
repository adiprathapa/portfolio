import { motion } from 'framer-motion'
import type { MemoryCard } from './deck'
import { COLOR, PRIMARY, SURFACE } from '../../lib/theme'

interface FlipCardProps {
  card: MemoryCard
  faceUp: boolean
  matched: boolean
  onFlip: () => void
  /** Tighter typography for the conveyor rows. */
  small?: boolean
  sizeClass?: string
}

const FACE: React.CSSProperties = {
  backfaceVisibility: 'hidden',
  background: SURFACE.page,
  border: `1.5px solid ${PRIMARY.a30}`,
}

export function FlipCard({ card, faceUp, matched, onFlip, small, sizeClass }: FlipCardProps) {
  const defaultSize = small ? 'w-[72px] h-[72px] md:w-[80px] md:h-[80px]' : 'aspect-square'

  return (
    <div
      className={`shrink-0 cursor-pointer ${sizeClass ?? defaultSize}`}
      style={{ perspective: 600, overflow: 'visible' }}
      onClick={onFlip}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d', overflow: 'visible', willChange: 'transform' }}
        animate={{ rotateY: faceUp ? 180 : 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.3, 1] }}
      >
        <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={FACE}>
          <span className="select-none text-2xl font-bold" style={{ color: PRIMARY.a25 }}>?</span>
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl p-1.5"
          style={{ ...FACE, transform: 'rotateY(180deg)', opacity: matched ? 0.5 : 1 }}
        >
          <img
            src={card.colorIcon}
            alt={card.name}
            className={`object-contain ${small ? 'h-6 w-6' : 'h-8 w-8 md:h-10 md:w-10'}`}
            draggable={false}
          />
          <span
            className={`w-full truncate text-center font-medium leading-tight ${small ? 'text-[8px]' : 'text-[10px] md:text-xs'}`}
            style={{ color: COLOR.primary }}
          >
            {card.name}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
