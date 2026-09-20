import type { Variants } from 'framer-motion'

/**
 * Entrance motion is currently disabled site-wide: the hero and About render
 * at their final position with no transition. The variants stay wired up so
 * the motion can be dialed back in from one place.
 */
const INSTANT = { duration: 0 }

export const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0, delayChildren: 0 } },
}

export const heroChild: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: INSTANT },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0 } },
}
