import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './ui/button'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  links: { label: string; href: string }[]
}

export function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1000] bg-white flex flex-col"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* Close button */}
          <div className="flex justify-end p-6">
            <button onClick={onClose} aria-label="Close menu" className="p-2">
              <svg className="w-6 h-6 text-heading" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col items-center justify-center flex-1 gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (link.href === '#resume') {
                    e.preventDefault()
                    onClose()
                    return
                  }

                  if (link.href === '#about') {
                    e.preventDefault()
                    window.scrollTo({ top: window.innerHeight * 1.3, behavior: 'smooth' })
                  }
                  onClose()
                }}
                className="text-2xl font-heading font-semibold text-heading hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button variant="primary" href="#contact" onClick={onClose} className="mt-4">
              Let's talk
            </Button>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
