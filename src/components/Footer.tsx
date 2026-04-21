import { scrollToSection } from '../lib/scrollToSection'
import { usePostHog } from '@posthog/react'

const RESUME_PAGE_URL = '/resume.html'

const footerLinks = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

const resourceLinks = [
  { label: 'Resume', href: RESUME_PAGE_URL },
  { label: 'Cal', href: '/calendar.html' },
]

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/adiprathapa',
    icon: (
      <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24" fill="white">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/adiprathapa',
    icon: (
      <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24" fill="white">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:aprathapa01@gmail.com',
    icon: (
      <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
  },
]

export function Footer() {
  const posthog = usePostHog()
  return (
    <footer className="text-muted pt-0" style={{ padding: '0 12px 12px 12px' }}>
      <div
        className="mx-auto px-6 py-8 lg:px-14 lg:py-16"
        style={{
          background: '#1a1a1a',
          borderRadius: 24,
        }}
      >
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Brand */}
          <div className="col-span-3 lg:col-span-1">
            <div className="mb-2 lg:mb-3">
              <a href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="font-heading font-bold hover:opacity-80 transition-opacity cursor-pointer text-lg lg:text-2xl" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>&#x0906;&#x0926;&#x093F;</a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-normal mb-2 lg:mb-4 text-sm lg:text-lg" style={{ color: 'var(--color-primary)' }}>Links</h4>
            <ul className="space-y-1.5 lg:space-y-2.5 text-sm lg:text-lg">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (link.href.startsWith('#')) {
                        e.preventDefault()
                        scrollToSection(link.href)
                      }
                    }}
                    className="hover:opacity-80 transition-opacity"
                    style={{ color: '#FFFFFF' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-normal mb-2 lg:mb-4 text-sm lg:text-lg" style={{ color: 'var(--color-primary)' }}>Connect</h4>
            <ul className="space-y-1.5 lg:space-y-2.5 text-sm lg:text-lg">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 lg:gap-2 hover:opacity-80 transition-opacity"
                    style={{ color: '#FFFFFF' }}
                    onClick={() => posthog?.capture('footer_social_link_clicked', { platform: link.label.toLowerCase(), location: 'footer' })}
                  >
                    {link.icon}
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-normal mb-2 lg:mb-4 text-sm lg:text-lg" style={{ color: 'var(--color-primary)' }}>Resources</h4>
            <ul className="space-y-1.5 lg:space-y-2.5 text-sm lg:text-lg">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:opacity-80 transition-opacity" style={{ color: '#FFFFFF' }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 lg:mt-14 pt-4 lg:pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm lg:text-lg"
          style={{ borderTop: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF' }}
        >
          <p>&copy; {new Date().getFullYear()} Adi Prathapa</p>
        </div>
      </div>
    </footer>
  )
}
