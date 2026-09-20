import { lazy, Suspense, useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from './components/Navbar'
import { HorizontalScrollSection } from './components/HorizontalScrollSection'
import { ProjectsIntro } from './components/ProjectsIntro'
import { Projects } from './components/Projects'
import { OpenSource } from './components/OpenSource'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { jumpToSection, scrollToSection } from './lib/scrollToSection'
import { announceHomeSectionNavigation, PENDING_HOME_SECTION_KEY } from './lib/homeSectionNavigation'
import { warmImages } from './lib/warmImages'
import { featuredProjects } from './data/projects'
import { SURFACE } from './lib/theme'

const ProjectsGame = lazy(() =>
  import('./components/ProjectsGame').then((module) => ({ default: module.ProjectsGame })),
)

/**
 * Lightweight below-fold images only. Large videos stay on demand so they do
 * not compete with the hero and horizontal-scroll experience.
 */
const PRELOAD_IMAGES = [
  '/nell.webp', '/cornell.svg', '/mnhs.webp', '/mnhs-removebg-preview.png',
  '/pexels-pinamon-17647329.webp', '/bowers.webp', '/mines-bg.webp', '/unl-bg.webp',
  '/cornell-data-strategy.webp', '/c2s2.webp', '/cas.webp',
  ...featuredProjects.flatMap((p) => [p.brand.bgImage, ...(p.logo?.marks.map((m) => m.src) ?? [])]),
].filter((src): src is string => !!src)

const PRELOAD_DELAY_MS = 2500

/**
 * Arriving from another page, the homepage restores the stored hash itself so
 * the jump uses the same offsets as in-page nav, which a plain anchor would not.
 */
function useHashArrival() {
  useEffect(() => {
    const pending = sessionStorage.getItem(PENDING_HOME_SECTION_KEY)
    if (pending) {
      sessionStorage.removeItem(PENDING_HOME_SECTION_KEY)
      window.history.replaceState(null, '', pending)
    }

    const hash = pending || window.location.hash
    if (!hash) return

    if (!pending) {
      // Give React a beat to render the target before a normal hash restore.
      const id = setTimeout(() => scrollToSection(hash), 500)
      return () => clearTimeout(id)
    }

    let cancelled = false
    let retry: number | undefined
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (cancelled) return
        announceHomeSectionNavigation(hash)
        jumpToSection(hash)
        // Late-loading media can shift the target, so land on it twice.
        retry = window.setTimeout(() => jumpToSection(hash), 350)
      }))
    })
    return () => {
      cancelled = true
      if (retry !== undefined) window.clearTimeout(retry)
    }
  }, [])
}

/** Sticky and full-bleed sections can leave a sliver of horizontal scroll. */
function useLockHorizontalScroll() {
  useEffect(() => {
    const lock = () => {
      if (window.scrollX !== 0) window.scrollTo(0, window.scrollY)
    }
    window.addEventListener('scroll', lock, { passive: true })
    return () => window.removeEventListener('scroll', lock)
  }, [])
}

function App() {
  const [platformerActive, setPlatformerActive] = useState(false)

  useEffect(() => warmImages(PRELOAD_IMAGES, { startDelayMs: PRELOAD_DELAY_MS }), [])
  useHashArrival()
  useLockHorizontalScroll()

  return (
    <MotionConfig reducedMotion="user">
      <Analytics />
      <Navbar />
      <main style={{ background: SURFACE.page }}>
        <HorizontalScrollSection />
        <div className="relative" style={{ background: SURFACE.tint }}>
          <ProjectsIntro />
          <div className="mt-2 lg:mt-0">
            <Projects onPlatformer={() => setPlatformerActive(true)} platformerActive={platformerActive} />
          </div>
        </div>
        {platformerActive && (
          <Suspense fallback={null}>
            <ProjectsGame onExit={() => setPlatformerActive(false)} />
          </Suspense>
        )}
        <OpenSource />
        <div className="contact-footer-handoff relative z-[1]" style={{ background: SURFACE.page }}>
          <div aria-hidden style={{ height: 'var(--contact-mobile-pt, 0px)', background: SURFACE.page }} />
          <div className="contact-footer-surface">
            <Contact />
            <Footer />
          </div>
        </div>
      </main>
    </MotionConfig>
  )
}

export default App
