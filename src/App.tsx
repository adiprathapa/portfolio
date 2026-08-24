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
import { announceHomeSectionNavigation } from './lib/homeSectionNavigation'

const ProjectsGame = lazy(() =>
  import('./components/ProjectsGame').then((module) => ({ default: module.ProjectsGame })),
)

// Preload only lightweight below-fold images after the first interaction window.
// Large videos are intentionally left on demand so they do not compete with the
// hero/horizontal-scroll experience.
const PRELOAD_IMAGES = [
  // About / Experience section
  '/nell.webp', '/cornell.svg', '/mnhs.webp', '/mnhs-removebg-preview.png',
  '/pexels-pinamon-17647329.webp', '/bowers.webp', '/mines-bg.webp', '/unl-bg.webp',
  '/cornell-data-strategy.webp', '/c2s2.webp', '/cas.webp',
  // Project logos & backgrounds
  '/logo-tauron.png', '/logo-helicity.png',
  '/logo-apature.png', '/logo-hrt.png', '/logo-partcl.png',
  '/tauronbg.webp', '/helicitybg.webp',
  '/verdictbg.webp', '/macroplace-bg.webp',
  '/pexels-andrewshelley-8454632.webp',
]

function preloadAssets() {
  let i = 0
  function loadNext() {
    if (i < PRELOAD_IMAGES.length) {
      const img = new Image()
      img.src = PRELOAD_IMAGES[i++]
      img.onload = img.onerror = () => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadNext)
        } else {
          setTimeout(loadNext, 50)
        }
      }
    }
  }
  const start = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadNext)
    } else {
      setTimeout(loadNext, 50)
    }
  }
  setTimeout(start, 2500)
}

function App() {
  const [projectsGameActive, setProjectsGameActive] = useState(false)

  useEffect(() => {
    // Start preloading after initial render
    preloadAssets()

    const pendingHomeSection = sessionStorage.getItem('pending-home-section')
    if (pendingHomeSection) {
      sessionStorage.removeItem('pending-home-section')
      window.history.replaceState(null, '', pendingHomeSection)
    }

    const hash = pendingHomeSection || window.location.hash
    if (!hash) return

    if (pendingHomeSection) {
      const settleCrossPageArrival = async () => {
        await document.fonts.ready
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            announceHomeSectionNavigation(hash)
            jumpToSection(hash)
            window.setTimeout(() => jumpToSection(hash), 350)
          })
        })
      }

      settleCrossPageArrival()
      return
    }

    // Delay normal hash restores to let React render the target elements.
    setTimeout(() => {
      scrollToSection(hash)
    }, 500)
  }, [])

  useEffect(() => {
    const lockHorizontalScroll = () => {
      if (window.scrollX !== 0) {
        window.scrollTo(0, window.scrollY)
      }
    }

    window.addEventListener('scroll', lockHorizontalScroll, { passive: true })
    return () => window.removeEventListener('scroll', lockHorizontalScroll)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <Analytics />
      <Navbar />
      <main style={{ background: '#f4f4f4' }}>
        <HorizontalScrollSection />
        <div className="relative" style={{ background: '#E4EFF5' }}>
          <ProjectsIntro />
          <div className="mt-2 lg:mt-0">
            <Projects onPlatformer={() => setProjectsGameActive(true)} platformerActive={projectsGameActive} />
          </div>
        </div>
        {projectsGameActive && (
          <Suspense fallback={null}>
            <ProjectsGame onExit={() => setProjectsGameActive(false)} />
          </Suspense>
        )}
        <OpenSource />
        <div className="contact-footer-handoff relative z-[1]" style={{ background: '#f4f4f4' }}>
          <div aria-hidden style={{ height: 'var(--contact-mobile-pt, 0px)', background: '#f4f4f4' }} />
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
