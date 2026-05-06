import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Hero } from './Hero'
import { About } from './About'

export function HorizontalScrollSection() {
  const outerRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 1024
  )

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  })

  const translateX = useTransform(scrollYProgress, [0, 1], ['0%', '-50%'])

  if (!isDesktop) {
    return (
      <>
        <Hero />
        <About />
      </>
    )
  }

  return (
    <div ref={outerRef} className="relative lg:z-20" style={{ height: '200vh' }}>
      <div className="sticky top-0 h-screen" style={{ overflowX: 'clip', overflowY: 'visible' }}>
        <motion.div
          className="flex h-screen"
          style={{ x: translateX, width: '200%', willChange: 'transform' }}
        >
          <div className="h-screen shrink-0" style={{ width: '50%' }}>
            <Hero />
          </div>
          <div className="h-screen shrink-0" style={{ width: '50%' }}>
            <About />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
