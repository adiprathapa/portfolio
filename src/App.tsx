import { useEffect, useState, useCallback } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from './components/Navbar'
import { HorizontalScrollSection } from './components/HorizontalScrollSection'
import { ProjectsIntro } from './components/ProjectsIntro'
import { Projects } from './components/Projects'
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
  const [projectsMargin, setProjectsMargin] = useState('calc(1900px - 100dvh)')

  const measureAbout = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setProjectsMargin('0px')
      return
    }
    const about = document.getElementById('about')
    if (!about) {
      setProjectsMargin('0px')
      return
    }
    const aboutRect = about.getBoundingClientRect()
    const measuredBottom = Array.from(about.querySelectorAll<HTMLElement>('*')).reduce((bottom, el) => {
      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden') return bottom
      return Math.max(bottom, el.getBoundingClientRect().bottom - aboutRect.top)
    }, 0)
    const visualBottom = measuredBottom || about.scrollHeight
    const afterAboutGap = Math.min(Math.max(window.innerHeight * 0.1, 64), 96)
    const margin = Math.max(0, visualBottom + afterAboutGap - window.innerHeight)
    setProjectsMargin(`${Math.round(margin)}px`)
  }, [])

  useEffect(() => {
    // Measure after first render + fonts loaded
    const raf = requestAnimationFrame(() => {
      measureAbout()
      // Re-measure once fonts finish loading
      document.fonts?.ready?.then(measureAbout)
    })
    // iOS Safari fires resize when the URL bar collapses during scroll, which
    // would re-run this and cause layout jerks. Only react to width changes.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      measureAbout()
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [measureAbout])

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
        <div className="relative" style={{ marginTop: projectsMargin, background: '#E4EFF5' }}>
          <ProjectsIntro />
          <div className="mt-6 lg:mt-0">
            <Projects />
          </div>
        </div>
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
