import { useState, useEffect } from 'react'

const SECTIONS = ['about', 'projects', 'experience', 'education', 'open-source', 'contact'] as const

export function useActiveSection() {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    // Navbar sits at the top of the viewport. We check which section the
    // navbar overlaps by comparing section bounding rects to a probe point
    // slightly below the top of the viewport (to account for the navbar
    // height + some margin).
    const PROBE_OFFSET = 96 // px from top of viewport

    // On desktop "about" lives inside the horizontal-scroll sticky container,
    // so its getBoundingClientRect doesn't move until the sticky context ends.
    // Detect it via scroll position instead. On mobile it flows normally and
    // is found by the regular probe loop below.
    const isDesktop = () => window.innerWidth >= 1024
    const aboutStart = () => window.innerHeight * 1.1
    const projectsRegionStart = () => {
      // Projects region begins at projects-intro (which sits above the
      // sticky projects section in document flow).
      const intro = document.getElementById('projects-intro')
      if (intro) return intro.getBoundingClientRect().top + window.scrollY
      const projects = document.getElementById('projects')
      return projects
        ? projects.getBoundingClientRect().top + window.scrollY
        : window.innerHeight * 3.5
    }

    const handleScroll = () => {
      const y = window.scrollY
      const projectsStart = projectsRegionStart()

      // Check "about" via scroll position (horizontal scroll section, desktop only)
      if (isDesktop() && y >= aboutStart() && y < projectsStart - PROBE_OFFSET) {
        setActive('about')
        return
      }

      // For normal sections, find which one contains the probe point
      let found: string | null = null
      for (const id of SECTIONS) {
        if (id === 'about' && isDesktop()) continue
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= PROBE_OFFSET && rect.bottom > PROBE_OFFSET) {
          found = id
        }
      }

      // Treat projects-intro as part of "projects" so the navbar reflects
      // the section once the user scrolls to the intro (before the sticky
      // projects section enters the viewport).
      if (!found) {
        const intro = document.getElementById('projects-intro')
        if (intro) {
          const rect = intro.getBoundingClientRect()
          if (rect.top <= PROBE_OFFSET && rect.bottom > PROBE_OFFSET) {
            found = 'projects'
          }
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
