import { useState, useEffect, useRef } from 'react'

export function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      // Don't activate navbar styling until past the horizontal scroll section (200vh)
      const horizontalSectionEnd = window.innerHeight
      setScrolled(currentY > horizontalSectionEnd + threshold)
      setHidden(currentY > lastScrollY.current && currentY > horizontalSectionEnd + 630)
      lastScrollY.current = currentY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return { scrolled, hidden }
}
