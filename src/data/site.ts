/** Site-wide identity and navigation, shared by the navbar, footer and contact. */

export const SITE = {
  name: 'Adi Prathapa',
  email: 'aprathapa01@gmail.com',
  github: 'https://github.com/adiprathapa',
  githubUser: 'adiprathapa',
  linkedin: 'https://www.linkedin.com/in/adi-prathapa',
  calendar: '/calendar.html',
  privacy: '/privacy.html',
  allProjects: '/projects/',
} as const

export interface NavLink {
  label: string
  href: string
}

/** Homepage sections, in page order. */
export const sectionLinks: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Open Source', href: '#open-source' },
  { label: 'Contact', href: '#contact' },
]

export const resourceLinks: NavLink[] = [
  { label: 'All projects', href: SITE.allProjects },
  { label: 'Calendar', href: SITE.calendar },
  { label: 'Privacy', href: SITE.privacy },
]
