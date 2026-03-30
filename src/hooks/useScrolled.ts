import { useState, useEffect, useRef } from 'react'

export function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const downDelta = useRef(0)
  const scrolledAt = useRef<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const sectionEnd = window.innerHeight * 4
      const isScrolled = currentY > sectionEnd + threshold
      setScrolled(isScrolled)

      // Track when containerize started so we can let the animation finish
      if (isScrolled && scrolledAt.current === null) {
        scrolledAt.current = Date.now()
      } else if (!isScrolled) {
        scrolledAt.current = null
      }

      const delta = currentY - lastScrollY.current
      const containerized = scrolledAt.current !== null && Date.now() - scrolledAt.current > 600

      if (delta > 0 && currentY > sectionEnd && containerized) {
        // Scrolling down — accumulate delta, hide after 80px of downward travel
        downDelta.current += delta
        if (downDelta.current > 80) {
          setHidden(true)
        }
      } else if (delta < 0) {
        // Scrolling up — show immediately
        downDelta.current = 0
        setHidden(false)
      }

      lastScrollY.current = currentY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return { scrolled, hidden }
}
