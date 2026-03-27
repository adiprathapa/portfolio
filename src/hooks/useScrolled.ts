import { useState, useEffect, useRef } from 'react'

export function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > threshold)
      setHidden(currentY > lastScrollY.current && currentY > 1800)
      lastScrollY.current = currentY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return { scrolled, hidden }
}
