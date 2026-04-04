import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  maxWidth?: 'container' | 'text'
  style?: React.CSSProperties
}

const widthClasses = {
  container: 'max-w-7xl',
  text: 'max-w-3xl',
}

export function Section({ children, className = '', id, maxWidth = 'container', style }: SectionProps) {
  return (
    <section id={id} className={`py-16 px-4 md:py-20 md:px-6 lg:py-24 ${className}`} style={style}>
      <motion.div
        className={`mx-auto ${widthClasses[maxWidth]} w-full`}
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {children}
      </motion.div>
    </section>
  )
}
