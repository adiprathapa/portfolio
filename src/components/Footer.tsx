import { type MouseEvent } from 'react'
import { scrollToSection } from '../lib/scrollToSection'
import { warmCalendarPage, warmDocument } from '../lib/prefetch'
import { announceHomeSectionNavigation, goToHomeSection } from '../lib/homeSectionNavigation'
import { resourceLinks, sectionLinks, SITE } from '../data/site'

export function Footer({ page = 'home' }: { page?: 'home' | 'projects' } = {}) {
  const isHome = page === 'home'

  const handleSectionClick = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith('#')) return
    e.preventDefault()
    if (!isHome) {
      goToHomeSection(href)
      return
    }
    announceHomeSectionNavigation(href)
    scrollToSection(href)
  }

  return (
    <footer className="video-footer">
      <div className="video-footer__inner">
        <div className="video-footer__content">
          <div className="video-footer__columns">
            <nav aria-label="Footer navigation">
              <h3>Explore</h3>
              {sectionLinks.map((link) => (
                <a key={link.href} href={isHome ? link.href : `/${link.href}`} onClick={handleSectionClick(link.href)}>
                  {link.label}
                </a>
              ))}
            </nav>

            <nav aria-label="Resources">
              <h3>Resources</h3>
              {resourceLinks.map((link) => {
                const warm = link.href === SITE.calendar ? warmCalendarPage : () => warmDocument(link.href)
                return (
                  <a key={link.href} href={link.href} onMouseEnter={warm} onFocus={warm} onTouchStart={warm}>
                    {link.label}
                  </a>
                )
              })}
            </nav>

            <div>
              <h3>Contact</h3>
              <a href={`mailto:${SITE.email}`}>Email</a>
              <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href={SITE.github} target="_blank" rel="me noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>

        <div className="video-footer__bottom">
          <a href="/#top" className="video-footer__bottom-logo">{SITE.name}</a>
          <span>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
