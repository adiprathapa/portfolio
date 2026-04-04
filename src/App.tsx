import { Navbar } from './components/Navbar'
import { GradientText } from './components/ui/gradient-text'
import { HorizontalScrollSection } from './components/HorizontalScrollSection'
import { Projects } from './components/Projects'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <HorizontalScrollSection />
        <div className="-mt-[50px]" style={{ background: 'var(--color-surface, #EFF3F8)', paddingTop: 385 }}>
          <Projects />
        </div>
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
