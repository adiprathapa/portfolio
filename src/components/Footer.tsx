import { scrollToSection } from '../lib/scrollToSection'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { warmCalendarPage, warmResumePage } from '../lib/prefetch'

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
  { label: 'Calendar', href: '/calendar.html' },
]

export function Footer() {
  const wordRef = useRef<HTMLDivElement>(null)
  const paintCanvasRef = useRef<HTMLCanvasElement>(null)
  const [maskReady, setMaskReady] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

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
      setMaskReady(true)
    }

    applyCanvasMask()
  }, [])

  useEffect(() => {
    const el = wordRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoReady(true)
          observer.disconnect()
        }
      },
      { rootMargin: '700px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isDesktop) return
    const wordEl = wordRef.current
    const canvas = paintCanvasRef.current
    if (!wordEl || !canvas) return

    const W = 1200
    const H = 780
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    let lastX: number | null = null
    let lastY: number | null = null
    let lastClientX: number | null = null
    let lastClientY: number | null = null

    const erase = (x: number, y: number, radius: number) => {
      ctx.globalCompositeOperation = 'destination-out'
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
      grad.addColorStop(0, 'rgba(0,0,0,1)')
      grad.addColorStop(0.55, 'rgba(0,0,0,0.5)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }

    const paintAtClient = (clientX: number, clientY: number) => {
      const rect = wordEl.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        lastX = null
        lastY = null
        return
      }
      const x = ((clientX - rect.left) / rect.width) * W
      const y = ((clientY - rect.top) / rect.height) * H
      const radius = 110

      if (lastX !== null && lastY !== null) {
        const dx = x - lastX
        const dy = y - lastY
        const dist = Math.hypot(dx, dy)
        const steps = Math.max(1, Math.ceil(dist / (radius * 0.3)))
        for (let i = 1; i <= steps; i++) {
          const t = i / steps
          erase(lastX + dx * t, lastY + dy * t, radius)
        }
      } else {
        erase(x, y, radius)
      }

      lastX = x
      lastY = y
    }

    const handlePointerMove = (e: PointerEvent) => {
      lastClientX = e.clientX
      lastClientY = e.clientY
      paintAtClient(e.clientX, e.clientY)
    }

    let scrollRaf = 0
    const handleScroll = () => {
      if (lastClientX === null || lastClientY === null) return
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        if (lastClientX !== null && lastClientY !== null) {
          paintAtClient(lastClientX, lastClientY)
        }
      })
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('scroll', handleScroll)
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
    }
  }, [isDesktop])

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
          style={{ visibility: maskReady ? 'visible' : 'hidden' }}
        >
          <video
            className="video-footer__media"
            src={videoReady ? '/footer-letters.mp4' : undefined}
            poster="/footer-letters-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload={videoReady ? 'metadata' : 'none'}
          />
          {isDesktop && (
            <canvas
              ref={paintCanvasRef}
              className="video-footer__paint"
              aria-hidden
            />
          )}
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
