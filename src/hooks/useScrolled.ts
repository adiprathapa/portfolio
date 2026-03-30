import { useState, useEffect, useRef } from 'react'

export function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      // Containerize after the full horizontal scroll + card animation section ends (500vh element, fully past at 400vh scroll)
      const sectionEnd = window.innerHeight * 4
      setScrolled(currentY > sectionEnd + threshold)
      setHidden(currentY > lastScrollY.current && currentY > sectionEnd + 315)
      lastScrollY.current = currentY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return { scrolled, hidden }
}
