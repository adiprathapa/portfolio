import { useState, useEffect, useRef } from 'react'
import { useScrolled } from '../hooks/useScrolled'
import { useActiveSection } from '../hooks/useActiveSection'
import { Button } from './ui/button'
import { RippleButton } from './ui/ripple-button'
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
  const [ctaHovered, setCtaHovered] = useState(false)
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

    if (href === '#about') {
      e.preventDefault()
      window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' })
    }
  }

  return (
    <>
      <div data-navbar className="fixed top-0 left-0 right-0 z-[999] transition-all duration-500"
        style={{
          transform: (hidden && !pinned) || forceHidden ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        <header
          className="w-full"
          style={{
            backgroundColor: scrolled ? 'rgba(255,255,255,0.8)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
            WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
            boxShadow: scrolled ? '0 1px 0 rgba(0, 0, 0, 0.06)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid transparent',
            transition: 'background-color 500ms cubic-bezier(0.4,0,0.2,1), backdrop-filter 500ms cubic-bezier(0.4,0,0.2,1), box-shadow 500ms cubic-bezier(0.4,0,0.2,1), border-bottom 500ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div
            className="flex items-center justify-between h-16 max-w-7xl mx-auto px-6"
            style={{ gap: '2rem' }}
          >
            {/* Logo */}
            <a href="/" className="font-heading font-semibold text-lg text-primary">
              &#x0906;&#x0926;&#x093F;
            </a>

            {/* Desktop nav */}
            <nav
              className="hidden lg:flex items-center"
              style={{ gap: '2rem' }}
            >
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.slice(1)
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`relative text-base font-medium rounded-xl px-4 py-1.5 transition-all duration-300 ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-heading hover:text-primary/70'
                    }`}
                  >
                    {link.label}
                  </a>
                )
              })}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:block">
              <RippleButton
                className="px-4 py-1.5 !text-base"
                rippleColor="#38BDF8"
                style={{
                  backgroundColor: '#0671A4',
                  color: '#FFFFFF',
                  border: '2px solid transparent',
                  boxShadow: '0 2px 8px rgba(6, 113, 164, 0.12)',
                  transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  setCtaHovered(true)
                  e.currentTarget.style.backgroundColor = '#055a84'
                }}
                onMouseLeave={(e) => {
                  setCtaHovered(false)
                  e.currentTarget.style.backgroundColor = '#0671A4'
                }}
                onClick={(e) => {
                  handleNavClick(e as any, '#contact')
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>Let's talk</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {ctaHovered ? (
                      <>
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </>
                    ) : (
                      <path d="M8 5l7 7-7 7" />
                    )}
                  </svg>
                </span>
              </RippleButton>
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
