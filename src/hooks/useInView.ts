import { useEffect, useState, type RefObject } from 'react'

interface InViewOptions extends IntersectionObserverInit {
  /** Latch to true on the first intersection and stop observing. */
  once?: boolean
}

/** Tracks whether `ref`'s element intersects the viewport. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { once = false, ...observerInit }: InViewOptions = {},
) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (once) {
        if (!entry.isIntersecting) return
        setInView(true)
        observer.disconnect()
        return
      }
      setInView(entry.isIntersecting)
    }, observerInit)

    observer.observe(el)
    return () => observer.disconnect()
    // Options are passed as literals at the call sites, so spread them into
    // primitive deps rather than comparing a fresh object every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, once, observerInit.root, observerInit.rootMargin, String(observerInit.threshold)])

  return inView
}
