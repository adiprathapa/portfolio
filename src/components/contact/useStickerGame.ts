import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { stickersByRound } from '../../data/stickers'
import { posthog } from '../../lib/analytics'

/** A click this far from the target (as a fraction of the lid diagonal) scores 0. */
const MISS_RADIUS = 0.3
/** Mobile has no Next button, so a scored round advances itself. */
const MOBILE_ADVANCE_MS = 850

const ACCURACY_MESSAGES: [number, string][] = [
  [95, 'Perfect!'], [80, 'Great!'], [60, 'Good!'], [40, 'Not bad'], [20, 'Close-ish'],
]
const FINAL_MESSAGES: [number, string][] = [
  [90, 'Sticker Master'], [70, 'Great Memory'], [50, 'Not Bad'], [30, 'Keep Practicing'],
]

const pick = (table: [number, string][], value: number, fallback: string) =>
  table.find(([threshold]) => value >= threshold)?.[1] ?? fallback

export const accuracyMessage = (accuracy: number) => pick(ACCURACY_MESSAGES, accuracy, 'Way off!')
export const finalMessage = (average: number) => pick(FINAL_MESSAGES, average, 'Try Again?')

export interface Placement { x: number; y: number }

/**
 * "Where did this sticker go?" — each round the player clicks the lid and is
 * scored on how close they landed to the sticker's real position.
 */
export function useStickerGame(isLg: boolean, lidRef: React.RefObject<HTMLDivElement | null>) {
  const [active, setActive] = useState(false)
  const [round, setRound] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [placements, setPlacements] = useState<Placement[]>([])
  const [lastClick, setLastClick] = useState<Placement | null>(null)
  const [roundAccuracy, setRoundAccuracy] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const targetRefs = useRef<(HTMLDivElement | null)[]>([])

  const rounds = useMemo(
    () => stickersByRound.map((s) => ({ ...s, style: s.position(isLg) })),
    [isLg],
  )

  const start = useCallback(() => {
    setActive(true)
    setRound(0)
    setScores([])
    setPlacements([])
    setLastClick(null)
    setRoundAccuracy(null)
    setFinished(false)
  }, [])

  const exit = useCallback(() => {
    setActive(false)
    setFinished(false)
  }, [])

  const placeAt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!active || finished || roundAccuracy !== null) return
    const lid = lidRef.current
    const target = targetRefs.current[round]
    if (!lid || !target) return

    const lidRect = lid.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const clickX = e.clientX - lidRect.left
    const clickY = e.clientY - lidRect.top
    const targetX = targetRect.left + targetRect.width / 2 - lidRect.left
    const targetY = targetRect.top + targetRect.height / 2 - lidRect.top

    const distance = Math.hypot(clickX - targetX, clickY - targetY)
    const lidDiagonal = Math.hypot(lidRect.width, lidRect.height)
    const accuracy = Math.max(0, Math.round((1 - distance / (lidDiagonal * MISS_RADIUS)) * 100))
    const placement = { x: (clickX / lidRect.width) * 100, y: (clickY / lidRect.height) * 100 }

    setLastClick(placement)
    setPlacements((prev) => [...prev, placement])
    setRoundAccuracy(accuracy)
    setScores((prev) => [...prev, accuracy])
    posthog?.capture('sticker_game_placed', { sticker: rounds[round].gameName, accuracy })
  }, [active, finished, lidRef, round, roundAccuracy, rounds])

  const nextRound = useCallback(() => {
    // Read `scores` from the closure rather than a setScores updater: React
    // runs updaters twice in StrictMode, which would double-advance the round.
    if (round + 1 >= rounds.length) {
      setFinished(true)
      const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      posthog?.capture('sticker_game_finished', { average_accuracy: average, rounds: scores.length })
    } else {
      setRound((r) => r + 1)
    }
    setLastClick(null)
    setRoundAccuracy(null)
  }, [round, rounds.length, scores])

  useEffect(() => {
    if (isLg || roundAccuracy === null || finished) return
    const id = window.setTimeout(nextRound, MOBILE_ADVANCE_MS)
    return () => window.clearTimeout(id)
  }, [isLg, roundAccuracy, finished, nextRound])

  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  return {
    active, round, rounds, scores, placements, lastClick, roundAccuracy, finished, averageScore,
    targetRefs, start, exit, placeAt, nextRound,
    isLastRound: round + 1 >= rounds.length,
  }
}
