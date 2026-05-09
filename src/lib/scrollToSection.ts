type ScrollBehaviorOption = ScrollBehavior | undefined

function documentTop(el: Element) {
  return el.getBoundingClientRect().top + window.scrollY
}

function navOffset() {
  return window.innerWidth < 1024 ? 84 : 76
}

function scrollToTop(top: number, behavior: ScrollBehaviorOption = 'smooth') {
  window.scrollTo({
    top: Math.max(0, Math.round(top)),
    behavior,
  })
}

function projectsContainer() {
  return document.getElementById('projects')?.parentElement ?? null
}

function rem(value: number) {
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return value * rootFontSize
}

function clamp(min: number, preferred: number, max: number) {
  return Math.min(Math.max(preferred, min), max)
}

function projectCardHeight() {
  const stack = document.querySelector<HTMLElement>('#projects > div')
  return stack?.offsetHeight || (window.innerWidth < 1024 ? clamp(320, window.innerHeight * 0.45, 420) : 500)
}

function experienceHeight() {
  return document.getElementById('experience')?.offsetHeight ?? 550
}

function experienceTopInsideViewport() {
  const cardH = projectCardHeight()

  if (window.innerWidth < 1024) {
    const stickyTop = rem(4)
    const stickyPaddingTop = rem(0.75)
    const gap = 96
    const expOverflow = Math.max(
      0,
      stickyPaddingTop + cardH + gap + experienceHeight() - window.innerHeight
    )
    return stickyTop + stickyPaddingTop + cardH + gap - expOverflow + 20
  }

  const stackShift = Math.max(0, (window.innerHeight - cardH) / 2 - 96)
  const gap = clamp(rem(2), window.innerHeight * 0.04, rem(3))
  return (window.innerHeight - cardH) / 2 - stackShift + cardH + gap - 335
}

export function sectionScrollTop(href: string) {
  const offset = navOffset()

  if (href === '#about') {
    if (window.innerWidth < 1024) {
      const about = document.getElementById('about')
      if (about) return documentTop(about) - offset
    }
    return window.innerHeight
  }

  if (href === '#projects') {
    const intro = document.getElementById('projects-intro')
    const container = projectsContainer()
    const nudge = window.innerWidth < 1024 ? 20 : 14
    return documentTop(intro ?? container ?? document.body) - offset + nudge
  }

  if (href === '#experience') {
    const container = projectsContainer()
    if (container) {
      const mobileNudge = window.innerWidth < 1024 ? 50 : 0
      return documentTop(container) + container.offsetHeight - window.innerHeight + experienceTopInsideViewport() - offset - 50 + mobileNudge
    }
  }

  if (href === '#education') {
    const education = document.getElementById('education')
    if (education) {
      const nudge = window.innerWidth < 1024 ? 80 : 120
      return documentTop(education) + nudge
    }
  }

  if (href === '#contact') {
    const contact = document.getElementById('contact')
    const content = contact?.firstElementChild
    if (content) {
      return documentTop(content) - offset - 40
    }
    if (contact) {
      return documentTop(contact) - offset - 40
    }
  }

  if (href.startsWith('#')) {
    const el = document.querySelector(href)
    if (el) {
      return documentTop(el) - offset
    }
  }

  return null
}

export function scrollToSection(href: string, behavior: ScrollBehaviorOption = 'smooth') {
  const top = sectionScrollTop(href)
  if (top !== null) {
    scrollToTop(top, behavior)
  }
}
