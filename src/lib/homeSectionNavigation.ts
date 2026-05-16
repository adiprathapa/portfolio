export const HOME_SECTION_NAVIGATION_EVENT = 'home-section-navigation'

export function announceHomeSectionNavigation(href: string) {
  window.dispatchEvent(
    new CustomEvent<string>(HOME_SECTION_NAVIGATION_EVENT, {
      detail: href,
    }),
  )
}
