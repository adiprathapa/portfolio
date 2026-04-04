import { Navbar } from './components/Navbar'
import { GradientText } from './components/ui/gradient-text'
import { HorizontalScrollSection } from './components/HorizontalScrollSection'
import { Projects } from './components/Projects'
import { Experience } from './components/Experience'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <HorizontalScrollSection />
        <div className="pt-[200px]" style={{ background: 'var(--color-surface, #EFF3F8)' }}>
          <Projects />
        </div>
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
