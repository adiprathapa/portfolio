import { useState, useEffect, useRef } from 'react'

export function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const downDelta = useRef(0)
  const upDelta = useRef(0)
  const scrolledAt = useRef<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const sectionEnd = window.innerHeight * 0.96
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

      if (delta > 0) {
        // Scrolling down
        upDelta.current = 0
        if (currentY > sectionEnd && containerized) {
          downDelta.current += delta
          if (downDelta.current > 80) {
            setHidden(true)
          }
        }
      } else if (delta < 0) {
        // Scrolling up — accumulate delta, show after 10px of upward travel
        downDelta.current = 0
        upDelta.current -= delta // delta is negative
        if (upDelta.current > 10 || currentY <= threshold) {
          setHidden(false)
        }
      }

      lastScrollY.current = currentY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return { scrolled, hidden }
}
