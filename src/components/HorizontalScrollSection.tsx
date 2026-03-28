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

  const translateX = useTransform(scrollYProgress, [0, 1], ['0%', '-50%'])

  return (
    <div ref={outerRef} style={{ height: '200vh', position: 'relative' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          className="flex w-[200vw] h-screen"
          style={{ x: translateX }}
        >
          <div className="w-screen h-screen shrink-0">
            <Hero />
          </div>
          <div className="w-screen h-screen shrink-0">
            <About scrollProgress={scrollYProgress} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
