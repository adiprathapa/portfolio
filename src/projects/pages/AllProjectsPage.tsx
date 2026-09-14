import { useEffect, useMemo, useState } from 'react'
import { projects } from '../../data/projects'
import { posthog } from '../../lib/analytics'
import { FilterMenu } from '../components/FilterMenu'
import { ProjectGridCard } from '../components/ProjectGridCard'
import { ProjectsIndexSubnav } from '../components/ProjectsSubnav'
import {
  FILTER_KEYS,
  FILTER_LABELS,
  FILTER_OPTIONS,
  activeFilterCount,
  applyFilters,
  optionLabel,
  serializeFilters,
  sortProjects,
  type FilterKey,
} from '../lib/filters'
import { useProjectFilters } from '../hooks/useProjectFilters'

const ICON = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

const FILTER_ICONS: Record<FilterKey, React.ReactNode> = {
  type: <svg {...ICON}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></svg>,
  domain: <svg {...ICON}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" /></svg>,
  tech: <svg {...ICON}><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></svg>,
  year: <svg {...ICON}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
}

const SORTED = sortProjects(projects)

export function AllProjectsPage() {
  const { filters, toggle, clear } = useProjectFilters()
  const [openMenu, setOpenMenu] = useState<FilterKey | null>(null)
  const visible = useMemo(() => applyFilters(SORTED, filters), [filters])
  const active = activeFilterCount(filters)

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search)
    posthog?.capture('projects_page_viewed', { page: 'index', active_filters: initial.toString() })
  }, [])

  const handleToggle = (key: FilterKey, value: string) => {
    const checked = !filters[key].includes(value)
    toggle(key, value)
    posthog?.capture('projects_filter_changed', { filter: key, value, checked })
  }

  const handleClear = () => {
    clear()
    posthog?.capture('projects_filters_cleared', { active_filters: serializeFilters(filters) })
  }

  return (
    <div className="mx-auto max-w-7xl px-6">
      <ProjectsIndexSubnav />

      <header className="mt-10 max-w-3xl lg:mt-16">
        <h1 className="gradient-text font-normal" style={{ fontSize: 'clamp(2.25rem, 3vw + 1rem, 3.75rem)', lineHeight: 1.1 }}>
          All projects
        </h1>
        <p className="mt-4 leading-relaxed" style={{ color: '#4B5563', fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}>
          Startup work, solo builds, hackathon projects, challenge entries, research, and open source contributions.
          Filter by type, domain, tech, or year, and open any project for the full write-up.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-3 md:flex md:flex-wrap lg:mt-10">
        {FILTER_KEYS.map((key) => (
          <FilterMenu
            key={key}
            label={FILTER_LABELS[key]}
            icon={FILTER_ICONS[key]}
            options={FILTER_OPTIONS[key]}
            selected={filters[key]}
            open={openMenu === key}
            onOpenChange={(open) => setOpenMenu((current) => (open ? key : current === key ? null : current))}
            onToggle={(value) => handleToggle(key, value)}
            searchable={key === 'tech'}
          />
        ))}
      </div>

      <div className="mt-6 flex min-h-9 flex-wrap items-center gap-x-3 gap-y-2">
        <p aria-live="polite" className="font-medium" style={{ color: '#4B5563' }}>
          Showing {visible.length} of {projects.length} projects
        </p>
        {FILTER_KEYS.flatMap((key) =>
          filters[key].map((value) => (
            <button
              key={`${key}-${value}`}
              type="button"
              onClick={() => handleToggle(key, value)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors hover:bg-[rgba(6,113,164,0.14)]"
              style={{ background: 'rgba(6, 113, 164, 0.08)', color: '#0671A4', border: '1px solid rgba(6, 113, 164, 0.15)' }}
              aria-label={`Remove ${FILTER_LABELS[key]} filter ${optionLabel(key, value)}`}
            >
              {optionLabel(key, value)}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )),
        )}
        {active > 0 && (
          <button type="button" onClick={handleClear} className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70" style={{ color: '#0671A4' }}>
            Clear filters
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
          {visible.map((project, i) => (
            <li key={project.slug}>
              <ProjectGridCard project={project} position={i + 1} source="index" eager={i < 2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl px-6 py-16 text-center" style={{ background: '#F4F4F4', border: '1.5px solid rgba(6, 113, 164, 0.3)' }}>
          <p className="font-medium" style={{ color: '#111827', fontSize: '1.125rem' }}>No projects match those filters.</p>
          <button
            type="button"
            onClick={handleClear}
            className="mt-5 inline-flex rounded-xl px-5 py-2.5 font-medium"
            style={{ backgroundColor: '#0671A4', color: '#FFFFFF' }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
