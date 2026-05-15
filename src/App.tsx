import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from './components/Navbar'
import { HorizontalScrollSection } from './components/HorizontalScrollSection'
import { ProjectsIntro } from './components/ProjectsIntro'
import { Projects } from './components/Projects'
import { ProjectsGame } from './components/ProjectsGame'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { scrollToSection } from './lib/scrollToSection'

// Preload below-fold assets during idle time while user is on hero
const PRELOAD_IMAGES = [
  // About / Experience section
  '/nell.webp', '/cornell.svg', '/mnhs.webp', '/mnhs-removebg-preview.png',
  '/pexels-pinamon-17647329.jpg', '/bowers.jpg', '/mines-bg.jpg', '/unl-bg.jpg',
  '/cornell data strategy.png', '/c2s2.jpeg', '/cas.webp',
  // Project logos & backgrounds
  '/logo-kiwix.png', '/logo-tauron.png', '/logo-helicity.png',
  '/logo-zamsizing.png', '/logo-galatea.png', '/logo-hrt.png', '/logo-partcl.png',
  '/kiwixbg.png', '/tauronbg.jpg', '/helicitybg.jpg',
  '/zamsizingbg.jpg', '/macroplace-bg.jpg', '/galateabg.jpg',
  // Contact stickers & laptop
  '/macbook-lid.svg', '/appl.png',
  '/sticker-acsu2.png', '/sticker-acsu.png', '/sticker-tata.png', '/sticker-data.png',
  '/sticker-frog.png', '/sticker-c2s2.png', '/sticker-gemini.png', '/sticker-purple.png',
  '/sticker-nell.png', '/sticker-claude.png', '/sticker-tabs.png', '/sticker-tab.png',
  '/sticker-cu.png',
]

const PRELOAD_VIDEOS = [
  '/kiwix.mov', '/tauron.mov', '/helicity.mov', '/zam-copy.mp4', '/recording-1.mov',
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
    } else if (i - PRELOAD_IMAGES.length < PRELOAD_VIDEOS.length) {
      const vi = i - PRELOAD_IMAGES.length
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = PRELOAD_VIDEOS[vi]
      link.as = 'video'
      document.head.appendChild(link)
      i++
      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadNext)
      } else {
        setTimeout(loadNext, 50)
      }
    }
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadNext)
  } else {
    setTimeout(loadNext, 200)
  }
}

function App() {
  const [projectsGameActive, setProjectsGameActive] = useState(false)

  useEffect(() => {
    // Start preloading after initial render
    preloadAssets()

    const hash = window.location.hash
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
          <ProjectsGame onExit={() => setProjectsGameActive(false)} />
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
