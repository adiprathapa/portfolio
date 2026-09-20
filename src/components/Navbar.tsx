import { useEffect, useRef, useState } from 'react'
import { useScrolled } from '../hooks/useScrolled'
import { useActiveSection } from '../hooks/useActiveSection'
import { RippleButton } from './ui/ripple-button'
import { ArrowIcon } from './ui/icons'
import { MobileMenu } from './MobileMenu'
import { posthog } from '../lib/analytics'
import { scrollToSection, sectionScrollTop } from '../lib/scrollToSection'
import { warmCalendarPage } from '../lib/prefetch'
import { sectionLinks, SITE } from '../data/site'
import { COLOR, DESKTOP_BP, SHADOW } from '../lib/theme'
import {
  announceHomeSectionNavigation,
  goToHomeSection,
  HOME_SECTION_NAVIGATION_EVENT,
} from '../lib/homeSectionNavigation'

const DEFAULT_NAVBAR_HEIGHT = 64
/** How long the smooth-scroll must be quiet before we call it settled. */
const SCROLL_SETTLE_MS = 160
const BAR_TRANSITION = ['background-color', 'backdrop-filter', 'box-shadow', 'border-bottom']
  .map((prop) => `${prop} 500ms cubic-bezier(0.4,0,0.2,1)`)
  .join(', ')

/**
 * Keeps the bar visible through a nav click's smooth-scroll, then releases it
 * once the user's own scrolling has moved about a navbar height.
 */
function useNavPin(navbarRef: React.RefObject<HTMLDivElement | null>) {
  const [pinned, setPinned] = useState(false)
  const phase = useRef<'idle' | 'traveling' | 'settled'>('idle')
  const releaseFrom = useRef<number | null>(null)
  const settleTimer = useRef<number | null>(null)

  const clearSettleTimer = () => {
    if (settleTimer.current === null) return
    window.clearTimeout(settleTimer.current)
    settleTimer.current = null
  }

  useEffect(() => {
    const navbarHeight = () => navbarRef.current?.offsetHeight ?? DEFAULT_NAVBAR_HEIGHT

    const onScroll = () => {
      if (window.innerWidth < DESKTOP_BP) return

      if (phase.current === 'traveling') {
        clearSettleTimer()
        settleTimer.current = window.setTimeout(() => {
          phase.current = 'settled'
          releaseFrom.current = window.scrollY
          settleTimer.current = null
        }, SCROLL_SETTLE_MS)
        return
      }

      const from = releaseFrom.current
      if (phase.current !== 'settled' || from === null) return
      if (Math.abs(window.scrollY - from) < navbarHeight()) return
      phase.current = 'idle'
      releaseFrom.current = null
      setPinned(false)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearSettleTimer()
    }
  }, [navbarRef])

  /** Called on a nav click; `targetTop` is where the page is about to land. */
  const pin = (targetTop?: number | null) => {
    const height = navbarRef.current?.offsetHeight ?? DEFAULT_NAVBAR_HEIGHT
    const worthPinning = typeof targetTop !== 'number' || Math.abs(targetTop - window.scrollY) >= height
    const shouldPin = window.innerWidth >= DESKTOP_BP && worthPinning
    setPinned(shouldPin)
    clearSettleTimer()
    phase.current = shouldPin ? 'traveling' : 'idle'
    releaseFrom.current = null
  }

  return { pinned, pin }
}

/** On mobile the bar stops being sticky once About has scrolled past. */
function usePastAboutOnMobile(enabled: boolean) {
  const [past, setPast] = useState(false)

  useEffect(() => {
    const update = () => {
      if (!enabled || window.innerWidth >= DESKTOP_BP) {
        setPast(false)
        return
      }
      const intro = document.getElementById('projects-intro')
      const aboutEnd = intro
        ? intro.getBoundingClientRect().top + window.scrollY
        : window.innerHeight * 1.9
      setPast(window.scrollY >= aboutEnd - DEFAULT_NAVBAR_HEIGHT)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    // iOS fires resize when the URL bar collapses; only width changes matter.
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
  }, [enabled])

  return past
}

export function Navbar({ page = 'home' }: { page?: 'home' | 'projects' } = {}) {
  const isHome = page === 'home'
  // Off the homepage there is no hero to scroll past, so the bar reacts at once.
  const { scrolled, hidden } = useScrolled(50, { startAt: isHome ? 0.96 : 0 })
  const homeActiveSection = useActiveSection(isHome)
  const activeSection = isHome ? homeActiveSection : 'projects'

  const [menuOpen, setMenuOpen] = useState(false)
  const [ctaHovered, setCtaHovered] = useState(false)
  const navbarRef = useRef<HTMLDivElement>(null)

  const { pinned, pin } = useNavPin(navbarRef)
  const pastAboutMobile = usePastAboutOnMobile(isHome)
  const showSocialActions = scrolled || activeSection !== null

  useEffect(() => {
    const onHomeSectionNavigation = (event: Event) => {
      const href = (event as CustomEvent<string>).detail
      if (!href?.startsWith('#')) return
      pin(sectionScrollTop(href))
    }
    window.addEventListener(HOME_SECTION_NAVIGATION_EVENT, onHomeSectionNavigation)
    return () => window.removeEventListener(HOME_SECTION_NAVIGATION_EVENT, onHomeSectionNavigation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    posthog?.capture('nav_link_clicked', { section: href.replace('#', ''), from_page: page })
    if (!href.startsWith('#')) return
    e.preventDefault()
    if (!isHome) {
      goToHomeSection(href)
      return
    }
    announceHomeSectionNavigation(href)
    scrollToSection(href)
  }

  const barHidden = (hidden && !pinned) || (pastAboutMobile && !menuOpen)
  const glassy = scrolled || menuOpen

  return (
    <>
      <div
        ref={navbarRef}
        data-navbar
        className="fixed left-0 right-0 top-0 z-[1001] transition-all duration-500"
        style={{ transform: barHidden ? 'translateY(-100%)' : 'translateY(0)' }}
      >
        <header
          className="w-full pt-[env(safe-area-inset-top)]"
          style={{
            backgroundColor: glassy ? 'rgba(255,255,255,0.8)' : 'transparent',
            backdropFilter: glassy ? 'blur(16px)' : 'blur(0px)',
            WebkitBackdropFilter: glassy ? 'blur(16px)' : 'blur(0px)',
            boxShadow: scrolled ? '0 1px 0 rgba(0, 0, 0, 0.06)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid transparent',
            transition: BAR_TRANSITION,
          }}
        >
          <div className="mx-auto flex h-16 items-center justify-between px-6" style={{ gap: '1.75rem', maxWidth: '82rem' }}>
            <a
              href="/#top"
              className="whitespace-nowrap font-heading text-lg font-semibold text-primary"
              onClick={() => {
                announceHomeSectionNavigation('#top')
                window.location.href = '/#top'
              }}
            >
              {SITE.name}
            </a>

            {/* Tighter spacing from 1024–1280 so links, CTA and avatar fit one line. */}
            <nav className="hidden items-center gap-1 lg:flex xl:gap-6">
              {sectionLinks.map((link) => {
                const isActive = activeSection === link.href.slice(1)
                return (
                  <a
                    key={link.href}
                    href={isHome ? link.href : `/${link.href}`}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`relative whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[15px] font-medium transition-all duration-300 xl:px-4 xl:text-base ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-heading hover:text-primary/70'
                    }`}
                  >
                    {link.label}
                  </a>
                )
              })}
            </nav>

            <div className="hidden items-center lg:flex" style={{ gap: '0.85rem' }}>
              <RippleButton
                className="px-4 py-1.5 text-base!"
                rippleColor={COLOR.accent}
                style={{
                  backgroundColor: COLOR.primary,
                  color: COLOR.white,
                  border: '2px solid transparent',
                  boxShadow: SHADOW.button,
                  transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                }}
                onMouseEnter={(e) => {
                  warmCalendarPage()
                  setCtaHovered(true)
                  e.currentTarget.style.backgroundColor = COLOR.primaryHover
                }}
                onFocus={warmCalendarPage}
                onTouchStart={warmCalendarPage}
                onMouseLeave={(e) => {
                  setCtaHovered(false)
                  e.currentTarget.style.backgroundColor = COLOR.primary
                }}
                onClick={() => {
                  posthog?.capture('lets_talk_clicked')
                  window.location.href = SITE.calendar
                }}
              >
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <span>Let's talk</span>
                  <ArrowIcon hovered={ctaHovered} />
                </span>
              </RippleButton>

              <a
                href={`${SITE.linkedin}/`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="group inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition-colors duration-200"
                style={{
                  opacity: showSocialActions ? 1 : 0,
                  transform: showSocialActions ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.98)',
                  pointerEvents: showSocialActions ? 'auto' : 'none',
                  border: '0.75px solid transparent',
                  transition: 'opacity 240ms ease, transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLOR.primary }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
              >
                <img
                  src="/headshot.webp"
                  alt={SITE.name}
                  className="h-full w-full object-cover transition-[filter] duration-200 group-hover:brightness-75"
                  style={{ objectPosition: 'center 28%' }}
                />
              </a>
            </div>

            <button
              className="relative flex h-10 w-10 items-center justify-center lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {[
                { transform: menuOpen ? 'rotate(45deg)' : 'translateY(-6px)' },
                { opacity: menuOpen ? 0 : 1 },
                { transform: menuOpen ? 'rotate(-45deg)' : 'translateY(6px)' },
              ].map((style, i) => (
                <span
                  key={i}
                  className="absolute block h-0.5 w-6 bg-heading transition-all duration-300 ease-in-out"
                  style={style}
                />
              ))}
            </button>
          </div>
        </header>
      </div>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={sectionLinks}
        onSectionLink={isHome ? undefined : goToHomeSection}
      />
    </>
  )
}
