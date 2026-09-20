import { useEffect, useState, type RefObject } from 'react'

/** Element size from a ResizeObserver, also refreshed on window resize. */
export function useElementSize<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => setSize({ width: el.offsetWidth, height: el.offsetHeight })
    update()

    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [ref])

  return size
}
