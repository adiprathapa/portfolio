import { useState, useEffect, useRef } from 'react'
import { useScrolled } from '../hooks/useScrolled'
import { useActiveSection } from '../hooks/useActiveSection'
import { Button } from './ui/button'
import { MobileMenu } from './MobileMenu'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

export function Navbar() {
  const { scrolled, hidden } = useScrolled(50)
  const activeSection = useActiveSection()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [forceHidden, setForceHidden] = useState(false)
  const scrolledRef = useRef(scrolled)
  scrolledRef.current = scrolled

  // Clear forceHidden on any scroll-up
  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      if (window.scrollY < lastY) setForceHidden(false)
      lastY = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setPinned(true)
    setForceHidden(false)
    setTimeout(() => {
      setPinned(false)
      if (scrolledRef.current) setForceHidden(true)
    }, 2000)

    // About is inside the horizontal scroll section — native hash scroll
    // would scroll right instead of down. Scroll vertically to the point
    // where the horizontal translation has fully revealed the About panel.
    if (href === '#about') {
      e.preventDefault()
      window.scrollTo({ top: window.innerHeight * 1.8, behavior: 'smooth' })
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[999] flex justify-center transition-all duration-500"
        style={{
          padding: scrolled ? '0.75rem 2.5rem' : '0 2.5rem',
          transform: (hidden && !pinned) || forceHidden ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        <header
          className="w-full rounded-full"
          style={{
            maxWidth: scrolled ? '48rem' : '100%',
            backgroundColor: scrolled ? 'rgba(255,255,255,0.8)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
            WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
            boxShadow: scrolled ? '0 2px 8px rgba(6,113,164,0.15)' : '0 2px 8px rgba(6,113,164,0)',
            border: scrolled ? '1px solid rgba(6,113,164,0.15)' : '1px solid rgba(6,113,164,0)',
            transition: 'max-width 500ms cubic-bezier(0.4,0,0.2,1), background-color 500ms cubic-bezier(0.4,0,0.2,1), backdrop-filter 500ms cubic-bezier(0.4,0,0.2,1), box-shadow 500ms cubic-bezier(0.4,0,0.2,1), border 500ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div
            className="flex items-center justify-between h-16"
            style={{
              padding: scrolled ? '0 1.5rem' : '0 2.5rem',
              gap: scrolled ? '1.25rem' : '2rem',
              transition: 'padding 500ms cubic-bezier(0.4,0,0.2,1), gap 500ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {/* Logo */}
            <a href="/" className="font-heading font-semibold text-lg text-primary">
              &#x0906;&#x0926;&#x093F;
            </a>

            {/* Desktop nav */}
            <nav
              className="hidden lg:flex items-center"
              style={{
                gap: scrolled ? '1.25rem' : '2rem',
                transition: 'gap 500ms cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.slice(1)
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`relative text-base font-medium transition-colors after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:transition-transform after:duration-300 after:origin-left ${
                      isActive
                        ? 'text-primary after:scale-x-100'
                        : 'text-heading hover:text-primary/70 after:scale-x-0'
                    }`}
                  >
                    {link.label}
                  </a>
                )
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:block">
              <Button variant="primary" href="#contact" className="!text-base py-2.5 px-5" onClick={handleNavClick}>
                Let's talk
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <span className="block w-6 h-0.5 bg-heading" />
              <span className="block w-6 h-0.5 bg-heading" />
              <span className="block w-4 h-0.5 bg-heading" />
            </button>
          </div>
        </header>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} links={navLinks} />
    </>
  )
}
