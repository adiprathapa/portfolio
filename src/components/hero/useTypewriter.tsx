import { useEffect, useRef, useState } from 'react'
import type { Greeting } from '../../data/greetings'

const TYPING_MS = 120
const DELETING_MS = 60
const HOLD_MS = 2000
/** After a hover ends, finish the current word faster before moving on. */
const RESUME_SPEEDUP = 0.5
const RESUME_HOLD_MS = 300
const RESUME_WINDOW_MS = 600

/**
 * Cycles through the greetings a character at a time. While `paused` (the
 * language tooltip is open) it retypes the current greeting in full and holds
 * it, then picks up where it left off once the pointer leaves.
 */
export function useTypewriter(items: Greeting[], paused: boolean) {
  const [index, setIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [holding, setHolding] = useState(false)
  const [resuming, setResuming] = useState(false)
  const wasPaused = useRef(false)
  const wasDeletingWhenPaused = useRef(false)

  useEffect(() => {
    if (paused) {
      wasPaused.current = true
      if (isDeleting) {
        wasDeletingWhenPaused.current = true
        setIsDeleting(false)
      }
      return
    }
    if (!wasPaused.current) return
    wasPaused.current = false

    if (wasDeletingWhenPaused.current) {
      wasDeletingWhenPaused.current = false
      setHolding(false)
      setIsDeleting(true)
      return
    }
    setResuming(true)
    const t = setTimeout(() => setResuming(false), RESUME_WINDOW_MS)
    return () => clearTimeout(t)
    // `isDeleting` is read but must not restart this effect: only the pause
    // edge matters, and depending on it would re-trigger mid-deletion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  useEffect(() => {
    // Frozen: fully retyped while the tooltip is open.
    if (paused && holding) return

    if (holding) {
      const t = setTimeout(() => {
        setHolding(false)
        setIsDeleting(true)
      }, resuming ? RESUME_HOLD_MS : HOLD_MS)
      return () => clearTimeout(t)
    }

    const fullText = items[index].text
    const speed = (isDeleting ? DELETING_MS : TYPING_MS) * (resuming ? RESUME_SPEEDUP : 1)

    const timeout = setTimeout(() => {
      if (isDeleting) {
        const next = displayText.slice(0, -1)
        setDisplayText(next)
        if (next.length === 0) {
          setIsDeleting(false)
          setIndex((prev) => (prev + 1) % items.length)
        }
        return
      }
      const next = fullText.slice(0, displayText.length + 1)
      setDisplayText(next)
      if (next.length === fullText.length) setHolding(true)
    }, speed)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, index, items, paused, holding, resuming])

  return { displayText, current: items[index] }
}

/** Splits the typed-so-far text along the greeting's word boundaries. */
export function renderSegments(text: string, segments: string[]) {
  let consumed = 0
  return segments.map((segment, i) => {
    const start = consumed
    consumed += segment.length
    if (start >= text.length) return null
    return <span key={i} data-word-index={i}>{text.slice(start, Math.min(consumed, text.length))}</span>
  })
}
