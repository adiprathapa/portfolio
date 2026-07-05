import { scrollToSection } from '../lib/scrollToSection'
import { type MouseEvent } from 'react'
import { warmCalendarPage, warmResumePage } from '../lib/prefetch'
import { announceHomeSectionNavigation } from '../lib/homeSectionNavigation'

const RESUME_PAGE_URL = '/resume.html'

const footerLinks = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Open Source', href: '#open-source' },
  { label: 'Contact', href: '#contact' },
]

const resourceLinks = [
  { label: 'Resume', href: RESUME_PAGE_URL },
  { label: 'Calendar', href: '/calendar.html' },
]

export function Footer() {
  const handleFooterLinkClick = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      announceHomeSectionNavigation(href)
      scrollToSection(href)
    }
  }

  return (
    <footer className="video-footer">
      <div className="video-footer__inner">
        {/*
        <div
          ref={wordRef}
          className={`video-footer__word${videoPlaying ? ' video-footer__word--video-playing' : ''}`}
          aria-label="Adi Prathapa"
          style={{ visibility: !maskReady ? 'hidden' : 'visible' }}
          onPointerEnter={() => {
            if (isDesktop) setVideoReady(true)
          }}
        >
          <video
            className="video-footer__media"
            src={videoReady ? '/footer-letters.mp4' : undefined}
            autoPlay
            muted
            loop
            playsInline
            preload={videoReady ? 'metadata' : 'none'}
            onPlaying={() => setVideoPlaying(true)}
            onError={() => setVideoPlaying(false)}
          />
          {isDesktop && (
            <canvas
              ref={paintCanvasRef}
              className="video-footer__paint"
              aria-hidden
            />
          )}
        </div>
        */}

        <div className="video-footer__content">
          <div className="video-footer__columns">
            <nav aria-label="Footer navigation">
              <h4>Explore</h4>
              {footerLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={handleFooterLinkClick(link.href)}>
                  {link.label}
                </a>
              ))}
            </nav>

            <nav aria-label="Resources">
              <h4>Resources</h4>
              {resourceLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onMouseEnter={link.href === RESUME_PAGE_URL ? warmResumePage : warmCalendarPage}
                  onFocus={link.href === RESUME_PAGE_URL ? warmResumePage : warmCalendarPage}
                  onTouchStart={link.href === RESUME_PAGE_URL ? warmResumePage : warmCalendarPage}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div>
              <h4>Contact</h4>
              <a href="mailto:aprathapa01@gmail.com">Email</a>
              <a href="https://www.linkedin.com/in/adi-prathapa" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://github.com/adiprathapa" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>

        <div className="video-footer__bottom">
          <a
            href="/#top"
            className="video-footer__bottom-logo"
            aria-label="Back to hero"
          >
            Adi Prathapa
          </a>
          <span>&copy; {new Date().getFullYear()} Adi Prathapa. All rights reserved.</span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
