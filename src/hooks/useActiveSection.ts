import { useState, useEffect } from 'react'

const OBSERVED_SECTIONS = ['projects', 'experience', 'contact']

export function useActiveSection() {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    // About is inside the horizontal scroll section and always in the DOM,
    // so IntersectionObserver fires too early. Track it via scroll position
    // instead — the horizontal slide finishes at 40% of the 500vh container
    // (= 2 * viewportHeight scroll).
    const aboutThreshold = () => window.innerHeight * 1.6

    const handleScroll = () => {
      const y = window.scrollY
      if (y >= aboutThreshold() && y < window.innerHeight * 4) {
        setActive('about')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    OBSERVED_SECTIONS.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(id)
          }
        },
        { rootMargin: '-40% 0px -55% 0px' },
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observers.forEach((o) => o.disconnect())
    }
  }, [])

  return active
}
