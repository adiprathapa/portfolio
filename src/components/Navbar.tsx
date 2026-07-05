import { useState, useEffect, useRef } from 'react'
import { useScrolled } from '../hooks/useScrolled'
import { useActiveSection } from '../hooks/useActiveSection'
import { RippleButton } from './ui/ripple-button'
import { MobileMenu } from './MobileMenu'
import { usePostHog } from '@posthog/react'
import { scrollToSection, sectionScrollTop } from '../lib/scrollToSection'
import { warmCalendarPage, warmResumePage } from '../lib/prefetch'
import {
  announceHomeSectionNavigation,
  HOME_SECTION_NAVIGATION_EVENT,
} from '../lib/homeSectionNavigation'

const RESUME_PAGE_URL = '/resume.html'
const CALENDAR_PAGE_URL = '/calendar.html'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Open Source', href: '#open-source' },
  { label: 'Contact', href: '#contact' },
]

export function Navbar() {
  const posthog = usePostHog()
  const { scrolled, hidden } = useScrolled(50)
  const activeSection = useActiveSection()
  const showSocialActions =
    scrolled ||
    activeSection === 'about' ||
    activeSection === 'projects' ||
    activeSection === 'experience' ||
    activeSection === 'education' ||
    activeSection === 'open-source' ||
    activeSection === 'contact'
  const [menuOpen, setMenuOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [ctaHovered, setCtaHovered] = useState(false)
  const [forceHidden, setForceHidden] = useState(false)
  const [pastAboutMobile, setPastAboutMobile] = useState(false)
  const navbarRef = useRef<HTMLDivElement>(null)
  const navPinPhaseRef = useRef<'idle' | 'traveling' | 'settled'>('idle')
  const releaseFromScrollYRef = useRef<number | null>(null)
  const settleTimerRef = useRef<number | null>(null)

  const clearSettleTimer = () => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current)
      settleTimerRef.current = null
    }
  }

  const pinNavbarThroughNavScroll = (targetTop?: number | null) => {
    setForceHidden(false)
    const navbarHeight = navbarRef.current?.offsetHeight ?? 64
    const hasMeaningfulTravel =
      typeof targetTop !== 'number' || Math.abs(targetTop - window.scrollY) >= navbarHeight
    const shouldPin = window.innerWidth >= 1024 && hasMeaningfulTravel
    setPinned(shouldPin)
    clearSettleTimer()
    navPinPhaseRef.current = shouldPin ? 'traveling' : 'idle'
    releaseFromScrollYRef.current = null
  }

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

  // After a desktop nav click, keep the bar visible through the automatic
  // smooth-scroll. Once that motion settles, wait until the user's next scroll
  // moves about one navbar-height before returning to normal hide/show behavior.
  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth < 1024) return

      if (navPinPhaseRef.current === 'traveling') {
        clearSettleTimer()
        settleTimerRef.current = window.setTimeout(() => {
          navPinPhaseRef.current = 'settled'
          releaseFromScrollYRef.current = window.scrollY
          settleTimerRef.current = null
        }, 160)
        return
      }

      const releaseFrom = releaseFromScrollYRef.current
      if (navPinPhaseRef.current !== 'settled' || releaseFrom === null) return
      const navbarHeight = navbarRef.current?.offsetHeight ?? 64
      if (Math.abs(window.scrollY - releaseFrom) >= navbarHeight) {
        navPinPhaseRef.current = 'idle'
        releaseFromScrollYRef.current = null
        setPinned(false)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearSettleTimer()
    }
  }, [])

  useEffect(() => {
    const onHomeSectionNavigation = (event: Event) => {
      const href = (event as CustomEvent<string>).detail
      if (!href?.startsWith('#')) return
      pinNavbarThroughNavScroll(sectionScrollTop(href))
    }

    window.addEventListener(HOME_SECTION_NAVIGATION_EVENT, onHomeSectionNavigation)
    return () => window.removeEventListener(HOME_SECTION_NAVIGATION_EVENT, onHomeSectionNavigation)
  }, [])

  // On mobile, the navbar should drop sticky behavior past the About section.
  // We track whether we've scrolled past About (= top of projects-intro).
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) {
        setPastAboutMobile(false)
        return
      }
      const intro = document.getElementById('projects-intro')
      const aboutEnd = intro
        ? intro.getBoundingClientRect().top + window.scrollY
        : window.innerHeight * 1.9
      setPastAboutMobile(window.scrollY >= aboutEnd - 64)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      update()
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === RESUME_PAGE_URL) {
      posthog?.capture('resume_viewed')
      return
    }

    posthog?.capture('nav_link_clicked', { section: href.replace('#', '') })
    if (href.startsWith('#')) {
      announceHomeSectionNavigation(href)
      e.preventDefault()
      scrollToSection(href)
    }
  }

  return (
    <>
      <div ref={navbarRef} data-navbar className="fixed top-0 left-0 right-0 z-[1001] transition-all duration-500"
        style={{
          transform: (hidden && !pinned) || forceHidden || (pastAboutMobile && !menuOpen) ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        <header
          className="w-full pt-[env(safe-area-inset-top)]"
          style={{
            backgroundColor: scrolled || menuOpen ? 'rgba(255,255,255,0.8)' : 'transparent',
            backdropFilter: scrolled || menuOpen ? 'blur(16px)' : 'blur(0px)',
            WebkitBackdropFilter: scrolled || menuOpen ? 'blur(16px)' : 'blur(0px)',
            boxShadow: scrolled ? '0 1px 0 rgba(0, 0, 0, 0.06)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid transparent',
            transition: 'background-color 500ms cubic-bezier(0.4,0,0.2,1), backdrop-filter 500ms cubic-bezier(0.4,0,0.2,1), box-shadow 500ms cubic-bezier(0.4,0,0.2,1), border-bottom 500ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div
            className="flex items-center justify-between h-16 mx-auto px-6"
            style={{ gap: '1.75rem', maxWidth: '82rem' }}
          >
            {/* Logo */}
            <a
              href="/#top"
              className="font-heading font-semibold text-lg text-primary"
              style={{ marginLeft: '0' }}
              onClick={() => {
                announceHomeSectionNavigation('#top')
                window.location.href = '/#top'
              }}
            >
              Adi Prathapa
            </a>

            {/* Desktop nav */}
            <nav
              className="hidden lg:flex items-center"
              style={{ gap: '1.5rem' }}
            >
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.slice(1)
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    onMouseEnter={link.href === RESUME_PAGE_URL ? warmResumePage : undefined}
                    onFocus={link.href === RESUME_PAGE_URL ? warmResumePage : undefined}
                    onTouchStart={link.href === RESUME_PAGE_URL ? warmResumePage : undefined}
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

            {/* Desktop CTA + social */}
            <div className="hidden lg:flex items-center" style={{ gap: '0.85rem' }}>
              <RippleButton
                className="px-4 py-1.5 text-base!"
                rippleColor="#38BDF8"
                style={{
                  backgroundColor: '#0671A4',
                  color: '#FFFFFF',
                  border: '2px solid transparent',
                  boxShadow: '0 2px 8px rgba(6, 113, 164, 0.12)',
                  transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  warmCalendarPage()
                  setCtaHovered(true)
                  e.currentTarget.style.backgroundColor = '#055a84'
                }}
                onFocus={warmCalendarPage}
                onTouchStart={warmCalendarPage}
                onMouseLeave={(e) => {
                  setCtaHovered(false)
                  e.currentTarget.style.backgroundColor = '#0671A4'
                }}
                onClick={() => {
                  posthog?.capture('lets_talk_clicked')
                  window.location.href = CALENDAR_PAGE_URL
                }}
              >
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
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
              <a
                href="https://www.linkedin.com/in/adi-prathapa/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="group inline-flex items-center justify-center w-10 h-10 rounded-full overflow-hidden transition-colors duration-200"
                style={{
                  opacity: showSocialActions ? 1 : 0,
                  transform: showSocialActions ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.98)',
                  pointerEvents: showSocialActions ? 'auto' : 'none',
                  border: '0.75px solid transparent',
                  transition: 'opacity 240ms ease, transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0671A4'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <img
                  src="/headshot.webp"
                  alt="Adi Prathapa"
                  className="w-full h-full object-cover transition-[filter] duration-200 group-hover:brightness-75"
                  style={{ objectPosition: 'center 28%' }}
                />
              </a>
            </div>

            {/* Mobile hamburger / X toggle */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <span
                className="absolute block w-6 h-0.5 bg-heading transition-all duration-300 ease-in-out"
                style={{
                  transform: menuOpen ? 'rotate(45deg)' : 'translateY(-6px)',
                }}
              />
              <span
                className="absolute block w-6 h-0.5 bg-heading transition-all duration-300 ease-in-out"
                style={{
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                className="absolute block w-6 h-0.5 bg-heading transition-all duration-300 ease-in-out"
                style={{
                  transform: menuOpen ? 'rotate(-45deg)' : 'translateY(6px)',
                }}
              />
            </button>
          </div>
        </header>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} links={navLinks} />
    </>
  )
}
