import type { ReactNode } from 'react'
import type { MemoryCard } from './deck'
import { FlipCard } from './FlipCard'

/**
 * Two belts of cards scrolling in opposite directions. Each row is doubled so
 * the CSS translate loop is seamless.
 */
export const CONVEYOR_KEYFRAMES = `
@keyframes conveyor-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes conveyor-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
`

interface ConveyorRowsProps {
  cards: MemoryCard[]
  paused: boolean
  isFaceUp: (id: number) => boolean
  isMatched: (id: number) => boolean
  onFlip: (id: number) => void
  /** Seconds for one full pass of each row. */
  durations: [number, number]
  gapClass: string
  rowWrapper: (children: ReactNode, index: number) => ReactNode
  small?: boolean
  cardSizeClass?: string
}

export function ConveyorRows({
  cards, paused, isFaceUp, isMatched, onFlip, durations, gapClass, rowWrapper, small, cardSizeClass,
}: ConveyorRowsProps) {
  const half = Math.ceil(cards.length / 2)
  const rows = [cards.slice(0, half), cards.slice(half)]

  return (
    <>
      {rows.map((row, i) =>
        rowWrapper(
          <div
            className={`flex ${gapClass}`}
            style={{
              width: 'max-content',
              animation: `${i === 0 ? 'conveyor-left' : 'conveyor-right'} ${durations[i]}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            {[...row, ...row].map((card, j) => (
              <FlipCard
                key={`r${i}-${j}`}
                card={card}
                faceUp={isFaceUp(card.id)}
                matched={isMatched(card.id)}
                onFlip={() => onFlip(card.id)}
                small={small}
                sizeClass={cardSizeClass}
              />
            ))}
          </div>,
          i,
        ),
      )}
    </>
  )
}
