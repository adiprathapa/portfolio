import type { ReactNode } from 'react'
import { MotionConfig } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

/** Layout for pages other than the homepage: shared navbar and footer in cross-page mode. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <Analytics />
      <Navbar page="projects" />
      <main className="min-h-screen pt-24 pb-28 lg:pt-28" style={{ background: '#E4EFF5' }}>
        {children}
      </main>
      <Footer page="projects" />
    </MotionConfig>
  )
}
