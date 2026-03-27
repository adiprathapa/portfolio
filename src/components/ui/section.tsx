import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  maxWidth?: 'container' | 'text'
}

const widthClasses = {
  container: 'max-w-7xl',
  text: 'max-w-3xl',
}

export function Section({ children, className = '', id, maxWidth = 'container' }: SectionProps) {
  return (
    <section id={id} className={`py-16 px-4 md:py-20 md:px-6 lg:py-24 ${className}`}>
      <motion.div
        className={`mx-auto ${widthClasses[maxWidth]}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </section>
  )
}
