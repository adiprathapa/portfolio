import { useState } from 'react'
import { useScrolled } from '../hooks/useScrolled'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [pinned, setPinned] = useState(false)

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setPinned(true)
    setTimeout(() => setPinned(false), 500)

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
          transform: hidden && !pinned ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        <header
          className={`w-full transition-all duration-500 ${
            scrolled
              ? 'bg-white/60 backdrop-blur-[16px] shadow-sm rounded-full'
              : 'bg-transparent'
          }`}
        >
          <div className="flex items-center justify-between px-10 h-16">
            {/* Logo */}
            <a href="/" className="font-heading font-semibold text-lg text-primary">
              &#x0906;&#x0926;&#x093F;
            </a>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="relative text-base font-medium text-heading hover:text-primary transition-colors after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:block">
              <Button variant="primary" href="#contact" className="text-sm py-2.5 px-5" onClick={handleNavClick}>
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
