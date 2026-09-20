import type { ReactNode } from 'react'
import { posthog } from '../../lib/analytics'
import { CalendarIcon, GithubIcon, LinkedInIcon, MailIcon } from './icons'
import { SITE } from '../../data/site'

interface SocialLink {
  platform: string
  href: string
  label: string
  icon: ReactNode
  /** `rel` beyond the shared noopener/noreferrer, e.g. rel="me". */
  rel?: string
  external?: boolean
}

const LINKS: SocialLink[] = [
  { platform: 'github', href: SITE.github, label: 'GitHub profile', icon: <GithubIcon className="h-5 w-5" />, rel: 'me', external: true },
  { platform: 'linkedin', href: SITE.linkedin, label: 'LinkedIn profile', icon: <LinkedInIcon className="h-5 w-5" />, external: true },
  { platform: 'email', href: `mailto:${SITE.email}`, label: 'Email Adi', icon: <MailIcon className="h-5 w-5" /> },
  { platform: 'calendar', href: SITE.calendar, label: 'Book a call', icon: <CalendarIcon className="h-5 w-5" /> },
]

const IDLE = 'rgba(255,255,255,0.15)'
const HOVER = 'rgba(255,255,255,0.25)'

/** Row of translucent circular icon links over a dark surface. */
export function SocialLinks({ location, className = '' }: { location: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-5 lg:justify-start ${className}`}>
      {LINKS.map((link) => (
        <a
          key={link.platform}
          href={link.href}
          {...(link.external ? { target: '_blank', rel: [link.rel, 'noopener', 'noreferrer'].filter(Boolean).join(' ') } : {})}
          aria-label={link.label}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors"
          style={{ background: IDLE }}
          onMouseEnter={(e) => { e.currentTarget.style.background = HOVER }}
          onMouseLeave={(e) => { e.currentTarget.style.background = IDLE }}
          onClick={() => posthog?.capture('social_link_clicked', { platform: link.platform, location })}
        >
          {link.icon}
        </a>
      ))}
    </div>
  )
}
