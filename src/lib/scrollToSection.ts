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

function experienceTopInsideViewport() {
  const cardH = projectCardHeight()

  if (window.innerWidth < 1024) {
    const stickyTop = rem(4)
    const stickyPaddingTop = rem(0.75)
    const gap = clamp(rem(1.5), window.innerHeight * 0.04, rem(2.5))
    const experienceDelay = clamp(rem(12), window.innerHeight * 0.26, rem(14))
    const experienceHold = clamp(rem(5), window.innerHeight * 0.12, rem(7))
    return stickyTop + stickyPaddingTop + cardH + gap + experienceDelay + experienceHold
  }

  const stackShift = Math.max(0, (window.innerHeight - cardH) / 2 - 96)
  const gap = clamp(rem(2), window.innerHeight * 0.04, rem(3))
  return (window.innerHeight - cardH) / 2 - stackShift + cardH + gap
}

export function sectionScrollTop(href: string) {
  const offset = navOffset()

  if (href === '#about') {
    return window.innerHeight
  }

  if (href === '#projects') {
    const intro = document.getElementById('projects-intro')
    const container = projectsContainer()
    return documentTop(intro ?? container ?? document.body) - offset
  }

  if (href === '#experience') {
    const container = projectsContainer()
    if (container) {
      return documentTop(container) + container.offsetHeight - window.innerHeight + experienceTopInsideViewport() - offset
    }
  }

  if (href === '#contact') {
    const contact = document.getElementById('contact')
    const content = contact?.firstElementChild
    if (content) {
      return documentTop(content) - offset
    }
    if (contact) {
      return documentTop(contact) - offset
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
