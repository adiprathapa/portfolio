import type { MouseEvent } from 'react'
import { goToHomeSection } from '../../lib/homeSectionNavigation'

const PRIMARY = '#0671A4'
const HEADING = '#111827'
const MUTED = '#7A7D72'

function goToHomeProjects(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  goToHomeSection('#projects')
}

/** Stripe-style section bar for the all-projects page. */
export function ProjectsIndexSubnav() {
  return (
    <nav aria-label="Projects" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <a href="/#projects" onClick={goToHomeProjects} className="font-medium transition-opacity hover:opacity-70" style={{ color: PRIMARY, fontSize: 'clamp(1rem, 0.4vw + 0.85rem, 1.25rem)' }}>
        Projects
      </a>
      <ul className="flex items-center gap-6 font-medium" style={{ fontSize: 'clamp(0.95rem, 0.3vw + 0.85rem, 1.0625rem)' }}>
        <li>
          <a href="/#projects" onClick={goToHomeProjects} className="transition-opacity hover:opacity-70" style={{ color: PRIMARY }}>
            Overview
          </a>
        </li>
        <li>
          <a href="/projects/" aria-current="page" style={{ color: HEADING }}>
            All projects
          </a>
        </li>
      </ul>
    </nav>
  )
}

export function ProjectBreadcrumb({ title, backHref }: { title: string; backHref: string }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 font-medium" style={{ fontSize: 'clamp(0.95rem, 0.3vw + 0.85rem, 1.0625rem)' }}>
        <li>
          <a href="/#projects" onClick={goToHomeProjects} className="transition-opacity hover:opacity-70" style={{ color: PRIMARY }}>
            Projects
          </a>
        </li>
        <li aria-hidden="true" style={{ color: MUTED }}>/</li>
        <li>
          <a href={backHref} className="transition-opacity hover:opacity-70" style={{ color: PRIMARY }}>
            All projects
          </a>
        </li>
        <li aria-hidden="true" style={{ color: MUTED }}>/</li>
        <li aria-current="page" style={{ color: HEADING }}>
          {title}
        </li>
      </ol>
    </nav>
  )
}
