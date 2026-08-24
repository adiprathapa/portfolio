import { scrollToSection } from '../lib/scrollToSection'
import { type MouseEvent } from 'react'
import { warmCalendarPage } from '../lib/prefetch'
import { announceHomeSectionNavigation } from '../lib/homeSectionNavigation'

const footerLinks = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Open Source', href: '#open-source' },
  { label: 'Contact', href: '#contact' },
]

const resourceLinks = [
  { label: 'Calendar', href: '/calendar.html' },
  { label: 'Privacy', href: '/privacy.html' },
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
              <h3>Explore</h3>
              {footerLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={handleFooterLinkClick(link.href)}>
                  {link.label}
                </a>
              ))}
            </nav>

            <nav aria-label="Resources">
              <h3>Resources</h3>
              {resourceLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onMouseEnter={warmCalendarPage}
                  onFocus={warmCalendarPage}
                  onTouchStart={warmCalendarPage}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div>
              <h3>Contact</h3>
              <a href="mailto:aprathapa01@gmail.com">Email</a>
              <a href="https://www.linkedin.com/in/adi-prathapa" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://github.com/adiprathapa" target="_blank" rel="me noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>

        <div className="video-footer__bottom">
          <a
            href="/#top"
            className="video-footer__bottom-logo"
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
