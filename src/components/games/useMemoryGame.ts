import { useCallback, useEffect, useRef, useState } from 'react'
import { buildDeck, type MemoryCard } from './deck'

const MATCH_REVEAL_MS = 500
const MISMATCH_REVEAL_MS = 800

/**
 * The flip-and-match state machine shared by the modal grid and the conveyor
 * board: two flips per move, matched pairs stay face up, the clock starts on
 * the first flip and the board locks while a mismatched pair is showing.
 */
export function useMemoryGame(initialPairs?: number) {
  const [cards, setCards] = useState<MemoryCard[]>(() => (initialPairs ? buildDeck(initialPairs) : []))
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const locked = useRef(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const deal = useCallback((pairs: number) => {
    clearTimers()
    setCards(buildDeck(pairs))
    setFlipped(new Set())
    setMatched(new Set())
    setSelected([])
    setMoves(0)
    setStartTime(null)
    setElapsed(0)
    setGameOver(false)
    locked.current = false
  }, [clearTimers])

  useEffect(() => clearTimers, [clearTimers])

  useEffect(() => {
    if (!startTime || gameOver) return
    const id = setInterval(() => setElapsed(Date.now() - startTime), 200)
    return () => clearInterval(id)
  }, [startTime, gameOver])

  useEffect(() => {
    if (cards.length > 0 && matched.size === cards.length) setGameOver(true)
  }, [matched, cards.length])

  const flip = useCallback((id: number) => {
    if (locked.current || flipped.has(id) || matched.has(id)) return
    if (!startTime) setStartTime(Date.now())

    const next = [...selected, id]
    setFlipped((prev) => new Set([...prev, id]))
    setSelected(next)
    if (next.length < 2) return

    setMoves((m) => m + 1)
    locked.current = true
    const [firstId, secondId] = next
    const isMatch = cards.find((c) => c.id === firstId)?.pairIndex === cards.find((c) => c.id === secondId)?.pairIndex

    const settle = () => {
      if (isMatch) {
        setMatched((prev) => new Set([...prev, firstId, secondId]))
      } else {
        setFlipped((prev) => {
          const remaining = new Set(prev)
          remaining.delete(firstId)
          remaining.delete(secondId)
          return remaining
        })
      }
      setSelected([])
      locked.current = false
    }

    timers.current.push(setTimeout(settle, isMatch ? MATCH_REVEAL_MS : MISMATCH_REVEAL_MS))
  }, [cards, flipped, matched, selected, startTime])

  const isFaceUp = useCallback((id: number) => flipped.has(id) || matched.has(id), [flipped, matched])

  return {
    cards,
    matched,
    moves,
    elapsed,
    gameOver,
    deal,
    flip,
    isFaceUp,
    isMatched: useCallback((id: number) => matched.has(id), [matched]),
  }
}
