import { useCallback, useEffect, useMemo, useState } from 'react'

/** Copies of the entry list laid end to end, so the rail never runs out. */
const REPEAT = 7

/**
 * Track position for a rail that loops forever. The list is repeated `REPEAT`
 * times and the index silently jumps back toward the middle lane whenever it
 * drifts to either end, so the visible transform is always continuous.
 */
export function useInfiniteCarousel(count: number) {
  const baseOffset = count * Math.floor(REPEAT / 2)
  const [visualIdx, setVisualIdx] = useState(baseOffset)
  const [skipTransition, setSkipTransition] = useState(false)

  const lanes = useMemo(() => Array.from({ length: REPEAT }, (_, lane) => lane), [])

  const withoutTransition = useCallback((update: () => void) => {
    setSkipTransition(true)
    update()
    requestAnimationFrame(() => requestAnimationFrame(() => setSkipTransition(false)))
  }, [])

  useEffect(() => {
    if (count === 0) return
    const min = count
    const max = count * (REPEAT - 1)
    if (visualIdx > min && visualIdx < max) return
    withoutTransition(() => setVisualIdx((prev) => prev + (visualIdx <= min ? count * 2 : -count * 2)))
  }, [count, visualIdx, withoutTransition])

  const step = useCallback((delta: number) => setVisualIdx((prev) => prev + delta), [])

  /** Moves to whichever copy of `realIdx` is closest to where the rail sits. */
  const glideTo = useCallback((realIdx: number) => {
    setVisualIdx((current) => {
      if (count === 0) return current
      return lanes
        .map((lane) => realIdx + count * lane)
        .reduce((best, candidate) =>
          Math.abs(candidate - current) < Math.abs(best - current) ? candidate : best,
        baseOffset + realIdx)
    })
  }, [baseOffset, count, lanes])

  /** Direct jump with no animation, for tab switches. */
  const snapTo = useCallback((realIdx: number) => {
    withoutTransition(() => setVisualIdx(baseOffset + realIdx))
  }, [baseOffset, withoutTransition])

  return { visualIdx, skipTransition, repeat: REPEAT, step, glideTo, snapTo }
}
