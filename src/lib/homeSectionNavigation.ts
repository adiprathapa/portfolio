export const HOME_SECTION_NAVIGATION_EVENT = 'home-section-navigation'
export const PENDING_HOME_SECTION_KEY = 'pending-home-section'

export function announceHomeSectionNavigation(href: string) {
  window.dispatchEvent(
    new CustomEvent<string>(HOME_SECTION_NAVIGATION_EVENT, {
      detail: href,
    }),
  )
}

/**
 * From another page, go to a homepage section. The homepage reads the stored
 * hash on load and jumps with the same offsets as in-page nav, which a plain
 * /#section anchor jump would not.
 */
export function goToHomeSection(hash: string) {
  try {
    sessionStorage.setItem(PENDING_HOME_SECTION_KEY, hash)
    window.location.href = '/'
  } catch {
    window.location.href = `/${hash}`
  }
}
