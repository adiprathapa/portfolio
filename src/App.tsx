import { lazy, Suspense, useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from './components/Navbar'
import { HorizontalScrollSection } from './components/HorizontalScrollSection'
import { ProjectsIntro } from './components/ProjectsIntro'
import { Projects } from './components/Projects'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { scrollToSection } from './lib/scrollToSection'

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
  '/logo-kiwix.png', '/logo-tauron.png', '/logo-helicity.png',
  '/logo-zamsizing.png', '/logo-galatea.png', '/logo-hrt.png', '/logo-partcl.png',
  '/kiwixbg.webp', '/tauronbg.webp', '/helicitybg.webp',
  '/zamsizingbg.webp', '/macroplace-bg.webp', '/galateabg.webp',
  '/pexels-andrewshelley-8454632.webp', '/pexels-dichupdi-35168139.webp',
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
    // Delay to let React render the target elements
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
    <>
      <Analytics />
      <Navbar />
      <main style={{ background: '#f4f4f4' }}>
        <HorizontalScrollSection />
        <div className="relative" style={{ background: '#E4EFF5' }}>
          <ProjectsIntro />
          <div className="mx-auto max-w-7xl px-6 pt-2 pb-4 lg:pt-4 lg:pb-6 flex justify-center">
            <button
              type="button"
              onClick={(e) => { setProjectsGameActive(true); e.currentTarget.blur() }}
              className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full cursor-pointer"
              style={{
                color: '#0671A4',
                background: 'rgba(6, 113, 164, 0.08)',
                border: '1px solid rgba(6, 113, 164, 0.2)',
                transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6, 113, 164, 0.15)'; e.currentTarget.style.borderColor = 'rgba(6, 113, 164, 0.45)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(6, 113, 164, 0.08)'; e.currentTarget.style.borderColor = 'rgba(6, 113, 164, 0.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14" />
                <path d="M19 12l-7 7-7-7" />
              </svg>
              Platformer
            </button>
          </div>
          <div className="mt-2 lg:mt-0">
            <Projects />
          </div>
        </div>
        {projectsGameActive && (
          <Suspense fallback={null}>
            <ProjectsGame onExit={() => setProjectsGameActive(false)} />
          </Suspense>
        )}
        <div className="contact-footer-handoff relative z-[1]" style={{ background: '#f4f4f4' }}>
          <div aria-hidden style={{ height: 'var(--contact-mobile-pt, 0px)', background: '#f4f4f4' }} />
          <div className="contact-footer-surface">
            <Contact />
            <Footer />
          </div>
        </div>
      </main>
    </>
  )
}

export default App
