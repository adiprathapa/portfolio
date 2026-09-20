import { useEffect, useRef, useState } from 'react'
import { DESKTOP_BP } from '../lib/theme'

/** Subscribes to a media query and re-renders when it flips. */
export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? initial : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const update = () => setMatches(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [query])

  return matches
}

const DESKTOP_QUERY = `(min-width: ${DESKTOP_BP}px)`

export function useIsDesktop(initial = true) {
  return useMediaQuery(DESKTOP_QUERY, initial)
}

export function useIsMobile(initial = false) {
  return !useMediaQuery(DESKTOP_QUERY, !initial)
}

/**
 * Whether the device has a real hover-capable pointer, as a ref. Event
 * handlers read `.current` without forcing a re-render on every pointer change.
 */
export function useCanHoverRef() {
  const canHover = useRef(false)

  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => { canHover.current = mql.matches }
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  return canHover
}

/** True while the browser tab is in the foreground. */
export function useTabVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden)

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return visible
}
