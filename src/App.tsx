import { useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { HorizontalScrollSection } from './components/HorizontalScrollSection'
import { Projects } from './components/Projects'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

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
  useEffect(() => {
    // Start preloading after initial render
    preloadAssets()

    const hash = window.location.hash
    if (!hash) return
    // Delay to let React render the target elements
    setTimeout(() => {
      if (hash === '#about') {
        window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' })
      } else if (hash === '#experience') {
        const projectsContainer = document.getElementById('projects')?.parentElement
        if (projectsContainer) {
          const containerBottom = projectsContainer.offsetTop + projectsContainer.offsetHeight
          window.scrollTo({ top: containerBottom - window.innerHeight, behavior: 'smooth' })
        }
      } else {
        const el = document.querySelector(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 500)
  }, [])

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--color-surface, #EFF3F8)' }}>
        <HorizontalScrollSection />
        <div className="relative lg:mt-[331px]" style={{ background: 'var(--color-surface, #EFF3F8)' }}>
          <Projects />
        </div>
        <div style={{ background: 'linear-gradient(135deg, #0671A4 0%, #38BDF8 100%)' }}>
          <Contact />
          <Footer />
        </div>
      </main>
    </>
  )
}

export default App
