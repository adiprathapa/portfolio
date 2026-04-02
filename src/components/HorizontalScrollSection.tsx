import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Hero } from './Hero'
import { About } from './About'

export function HorizontalScrollSection() {
  const outerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  })

  // First 40% of scroll (160vh of 400vh) drives the horizontal slide
  const translateX = useTransform(scrollYProgress, [0, 0.4], ['0%', '-50%'])

  // Remaining 60% (240vh) drives the card animation
  const cardProgress = useTransform(scrollYProgress, [0.4, 1], [0, 1])

  return (
    <div ref={outerRef} style={{ height: '350vh', position: 'relative' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          className="flex w-[200vw] h-screen"
          style={{ x: translateX }}
        >
          <div className="w-screen h-screen shrink-0">
            <Hero />
          </div>
          <div className="w-screen h-screen shrink-0">
            <About cardProgress={cardProgress} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
