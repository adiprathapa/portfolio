import { useState, useEffect } from 'react'

const SECTIONS = ['about', 'projects', 'experience', 'contact'] as const

export function useActiveSection() {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    // Navbar sits at the top of the viewport. We check which section the
    // navbar overlaps by comparing section bounding rects to a probe point
    // slightly below the top of the viewport (to account for the navbar
    // height + some margin).
    const PROBE_OFFSET = 80 // px from top of viewport

    // "about" lives inside the horizontal-scroll sticky container, so its
    // getBoundingClientRect doesn't move until the sticky context ends.
    // Detect it via scroll position instead: the horizontal slide occupies
    // the first 40% of the 500vh container (= 2×vh of scroll).
    const aboutStart = () => window.innerHeight * 1.6
    const aboutEnd = () => {
      // About section ends where "projects" begins (fall back to 4×vh)
      const projects = document.getElementById('projects')
      return projects
        ? projects.getBoundingClientRect().top + window.scrollY
        : window.innerHeight * 4
    }

    const handleScroll = () => {
      const y = window.scrollY

      // Check "about" via scroll position (horizontal scroll section)
      if (y >= aboutStart() && y < aboutEnd()) {
        setActive('about')
        return
      }

      // For normal sections, find which one contains the probe point
      let found: string | null = null
      for (const id of SECTIONS) {
        if (id === 'about') continue
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= PROBE_OFFSET && rect.bottom > PROBE_OFFSET) {
          found = id
        }
      }

      setActive(found)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // set initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return active
}
