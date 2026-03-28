import { motion, useTransform, useMotionValueEvent, type MotionValue } from 'framer-motion'
import { useState } from 'react'
import { GradientText } from './ui/gradient-text'

interface AboutProps {
  scrollProgress?: MotionValue<number>
}

export function About({ scrollProgress }: AboutProps) {
  const [visible, setVisible] = useState(!scrollProgress)

  if (scrollProgress) {
    useMotionValueEvent(scrollProgress, 'change', (v) => {
      if (v > 0.4 && !visible) setVisible(true)
    })
  }

  return (
    <section id="about" className="relative h-full flex items-center px-4 md:px-6" style={{ background: 'var(--color-surface, #EFF3F8)' }}>
      <motion.div
        className="mx-auto max-w-7xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <GradientText as="h2" className="text-3xl md:text-4xl font-bold mb-6">
              About me
            </GradientText>
            <p className="text-body text-lg leading-relaxed mb-4">
              I'm a Computer Science student at Cornell minoring in AI, originally
              from Nebraska. I am really interested in building and working with full stack web
              apps and experimenting with ML models.
            </p>
            <p className="text-body text-lg leading-relaxed mb-4">
              Lately I've been diving deep into web3, stablecoins, and IPFS, the idea of
              programmable money and decentralized finance is something I enjoy working with and learning about. I'm always looking for ways to connect what I'm learning in AI
              with applications outside of the classroom.
            </p>
            <p className="text-body text-lg leading-relaxed">
              Outside of code, I'm an Eagle Scout who still loves getting outdoors,
              camping, hiking, that kind of thing. When I'm not on a trail, you'll
              probably find me gaming, tinkering with some new tech, or catching up
              on anime and shows.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
