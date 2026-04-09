import { useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { GradientText } from './components/ui/gradient-text'
import { HorizontalScrollSection } from './components/HorizontalScrollSection'
import { Projects } from './components/Projects'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

function App() {
  useEffect(() => {
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
      <main>
        <HorizontalScrollSection />
        <div className="-mt-[50px]" style={{ background: 'var(--color-surface, #EFF3F8)', paddingTop: 385 }}>
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
