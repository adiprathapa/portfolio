import { colorIconOf, tech } from '../../data/tech'
import { shuffle } from '../../lib/array'

export interface MemoryCard {
  id: number
  name: string
  icon: string
  colorIcon: string
  /** Cards with the same pairIndex match. */
  pairIndex: number
}

/** Every tech mark is eligible; the hardest difficulty uses the whole pool. */
export const DECK_POOL = tech.map((t) => ({
  name: t.shortName ?? t.name,
  icon: t.icon,
  colorIcon: colorIconOf(t),
}))

export function buildDeck(pairCount: number): MemoryCard[] {
  const picked = shuffle(DECK_POOL).slice(0, pairCount)
  const cards = picked.flatMap((item, pairIndex) => [
    { id: pairIndex * 2, ...item, pairIndex },
    { id: pairIndex * 2 + 1, ...item, pairIndex },
  ])
  return shuffle(cards)
}
