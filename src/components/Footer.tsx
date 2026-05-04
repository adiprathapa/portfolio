import { scrollToSection } from '../lib/scrollToSection'
import { useEffect, useRef, type MouseEvent } from 'react'

const RESUME_PAGE_URL = '/resume.html'

const footerLinks = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
]

const resourceLinks = [
  { label: 'Resume', href: RESUME_PAGE_URL },
  { label: 'Cal', href: '/calendar.html' },
]

export function Footer() {
  const wordRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wordRef.current
    if (!el) return

    const applyCanvasMask = async () => {
      await document.fonts.ready
      const canvas = document.createElement('canvas')
      const w = 1200
      const h = 740
      const scale = 2
      canvas.width = w * scale
      canvas.height = h * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(scale, scale)
      ctx.font = '600 620px "Poppins"'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = 'white'
      ctx.fillText('\u0906\u0926\u093F', w / 2, 690)
      const url = `url(${canvas.toDataURL('image/png')})`
      el.style.webkitMaskImage = url
      el.style.maskImage = url
      el.style.opacity = '1'
    }

    applyCanvasMask()
  }, [])

  const handleFooterLinkClick = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      scrollToSection(href)
    }
  }

  return (
    <footer className="video-footer">
      <div className="video-footer__inner">
        <div
          ref={wordRef}
          className="video-footer__word"
          aria-label="आदि"
          style={{ opacity: 0, transition: 'opacity 0.4s ease' }}
        >
          <video
            className="video-footer__media"
            src="/footer-letters.mp4"
            poster="/footer-letters-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>

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
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>

            <div>
              <h4>Contact</h4>
              <a href="mailto:aprathapa01@gmail.com">Email</a>
              <a href="https://linkedin.com/in/adiprathapa" target="_blank" rel="noopener noreferrer">LinkedIn</a>
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
            &#x0906;&#x0926;&#x093F;
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
