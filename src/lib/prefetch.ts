const warmedLinks = new Set<string>()

function appendLink(rel: string, href: string, extras: Record<string, string> = {}) {
  const key = `${rel}:${href}`
  if (warmedLinks.has(key)) return

  warmedLinks.add(key)
  const link = document.createElement('link')
  link.rel = rel
  link.href = href
  Object.entries(extras).forEach(([name, value]) => link.setAttribute(name, value))
  document.head.appendChild(link)
}

function prefetchDocument(href: string) {
  appendLink('prefetch', href, { as: 'document' })
}

function preconnect(origin: string) {
  appendLink('preconnect', origin, { crossorigin: 'anonymous' })
}

export function warmResumePage() {
  prefetchDocument('/resume.html')
  preconnect('https://cdnjs.cloudflare.com')
  preconnect('https://amethyst-high-ostrich-443.mypinata.cloud')
}

export function warmCalendarPage() {
  prefetchDocument('/calendar.html')
  preconnect('https://app.cal.com')
  preconnect('https://cal.com')
}
