/** Runs `fn` when the browser is idle, falling back to a short timeout. */
function onIdle(fn: () => void, timeoutMs: number, options?: IdleRequestOptions) {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(fn, options)
    return () => { if (typeof cancelIdleCallback === 'function') cancelIdleCallback(id) }
  }
  const id = setTimeout(fn, timeoutMs)
  return () => clearTimeout(id)
}

export { onIdle }

interface WarmOptions {
  /** Called after each image settles, successfully or not. */
  onSettled?: (src: string) => void
  /** Delay before the first request, to stay out of the way of first paint. */
  startDelayMs?: number
  /** Fallback spacing when requestIdleCallback is unavailable. */
  gapMs?: number
}

/**
 * Fetches images one at a time on idle so warming below-fold media never
 * competes with whatever the user is currently looking at. Returns a cancel
 * function; calling it stops the chain and drops pending callbacks.
 */
export function warmImages(srcs: string[], { onSettled, startDelayMs = 0, gapMs = 50 }: WarmOptions = {}) {
  let cancelled = false
  let cancelPending: (() => void) | null = null
  let index = 0

  const loadNext = () => {
    if (cancelled || index >= srcs.length) return
    const src = srcs[index++]
    const img = new Image()
    const settle = () => {
      if (cancelled) return
      onSettled?.(src)
      cancelPending = onIdle(loadNext, gapMs)
    }
    img.onload = settle
    img.onerror = settle
    img.src = src
  }

  const start = () => { cancelPending = onIdle(loadNext, gapMs) }
  const startTimer = startDelayMs > 0 ? setTimeout(start, startDelayMs) : (start(), null)

  return () => {
    cancelled = true
    if (startTimer !== null) clearTimeout(startTimer)
    cancelPending?.()
  }
}
