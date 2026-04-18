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
        <>
          {/* Blurred backdrop */}
          <motion.div
            className="fixed inset-0 z-[998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
            }}
          />

          {/* Menu container */}
          <motion.div
            className="fixed left-3 right-3 z-[999] rounded-xl overflow-hidden"
            style={{
              top: 72,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <nav className="flex flex-col py-3 px-6">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    if (link.href === '#about') {
                      e.preventDefault()
                      window.scrollTo({ top: window.innerHeight * 1.3, behavior: 'smooth' })
                    }
                    onClose()
                  }}
                  className="text-base font-medium hover:text-primary transition-colors py-2.5"
                  style={{
                    color: 'var(--color-heading, #111827)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 pb-2">
                <Button variant="primary" href="/calendar.html" onClick={onClose} className="w-full text-base!">
                  Let's talk
                </Button>
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
