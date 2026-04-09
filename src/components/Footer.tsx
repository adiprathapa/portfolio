const RESUME_PAGE_URL = '/resume.html'

const footerLinks = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com', icon: 'github-icon' },
  { label: 'X / Twitter', href: 'https://x.com', icon: 'x-icon' },
  { label: 'Bluesky', href: 'https://bsky.app', icon: 'bluesky-icon' },
  { label: 'Discord', href: 'https://discord.com', icon: 'discord-icon' },
]

const resourceLinks = [
  { label: 'Resume', href: RESUME_PAGE_URL },
  { label: 'Blog', href: '#' },
  { label: 'Uses', href: '#' },
]

function SocialIcon({ icon, className = '' }: { icon: string; className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} aria-hidden="true">
      <use href={`/icons.svg#${icon}`} />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="bg-dark text-muted">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3">
              <span className="font-heading font-bold text-2xl text-primary">&#x0906;&#x0926;&#x093F;</span>
            </div>
            <p className="text-sm leading-relaxed">
              Crafting thoughtful digital experiences.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              {socialLinks.map((link) => (
                <li key={link.icon}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <SocialIcon icon={link.icon} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-footer-border mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
          <p>&copy; {new Date().getFullYear()} Adi Prathapa</p>
          <p>Built with React &amp; Tailwind</p>
        </div>
      </div>
    </footer>
  )
}
