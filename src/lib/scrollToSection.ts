export function scrollToSection(href: string) {
  if (href === '#about') {
    window.scrollTo({ top: window.innerHeight + 80, behavior: 'smooth' })
  } else if (href === '#projects') {
    const intro = document.getElementById('projects-intro')
    if (intro) {
      const absTop = intro.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top: absTop, behavior: 'smooth' })
    }
  } else if (href === '#experience') {
    const container = document.getElementById('projects')?.parentElement
    if (container) {
      const absTop = container.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: absTop + container.offsetHeight - window.innerHeight * 0.65, behavior: 'smooth' })
    }
  } else if (href.startsWith('#')) {
    const el = document.querySelector(href)
    if (el) {
      const absTop = el.getBoundingClientRect().top + window.scrollY - 64
      window.scrollTo({ top: absTop, behavior: 'smooth' })
    }
  }
}
