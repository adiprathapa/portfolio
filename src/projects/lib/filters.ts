import { DOMAIN_LABELS, TYPE_LABELS, projects, type Project, type ProjectDomain, type ProjectType } from '../../data/projects'
import { yearsCovered } from '../../data/format'

export type FilterKey = 'type' | 'domain' | 'tech' | 'year'
export type Filters = Record<FilterKey, string[]>

export const FILTER_KEYS: FilterKey[] = ['type', 'domain', 'tech', 'year']
export const EMPTY_FILTERS: Filters = { type: [], domain: [], tech: [], year: [] }

const CURRENT_YEAR = new Date().getFullYear()

export function techSlug(tech: string) {
  return tech
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function projectValues(project: Project, key: FilterKey): string[] {
  switch (key) {
    case 'type':
      return [project.type]
    case 'domain':
      return project.domains
    case 'tech':
      return project.tech.map(techSlug)
    case 'year':
      return yearsCovered(project.start, project.end, CURRENT_YEAR).map(String)
  }
}

export interface FilterOption {
  value: string
  label: string
  count: number
}

function countBy(key: FilterKey) {
  const counts = new Map<string, number>()
  for (const p of projects) {
    for (const v of new Set(projectValues(p, key))) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return counts
}

function buildOptions(key: FilterKey): FilterOption[] {
  const counts = countBy(key)
  if (key === 'type') {
    return (Object.keys(TYPE_LABELS) as ProjectType[])
      .filter((t) => counts.has(t))
      .map((t) => ({ value: t, label: TYPE_LABELS[t], count: counts.get(t) ?? 0 }))
  }
  if (key === 'domain') {
    return (Object.keys(DOMAIN_LABELS) as ProjectDomain[])
      .filter((d) => counts.has(d))
      .map((d) => ({ value: d, label: DOMAIN_LABELS[d], count: counts.get(d) ?? 0 }))
  }
  if (key === 'year') {
    return [...counts.keys()]
      .sort((a, b) => Number(b) - Number(a))
      .map((y) => ({ value: y, label: y, count: counts.get(y) ?? 0 }))
  }
  const labels = new Map<string, string>()
  for (const p of projects) for (const t of p.tech) if (!labels.has(techSlug(t))) labels.set(techSlug(t), t)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || (labels.get(a[0]) ?? '').localeCompare(labels.get(b[0]) ?? ''))
    .map(([value, count]) => ({ value, label: labels.get(value) ?? value, count }))
}

export const FILTER_OPTIONS: Record<FilterKey, FilterOption[]> = {
  type: buildOptions('type'),
  domain: buildOptions('domain'),
  tech: buildOptions('tech'),
  year: buildOptions('year'),
}

export const FILTER_LABELS: Record<FilterKey, string> = {
  type: 'Type',
  domain: 'Domain',
  tech: 'Tech',
  year: 'Year',
}

/** Keeps values in option order so shared URLs are stable. */
export function orderValues(key: FilterKey, values: string[]) {
  const order = FILTER_OPTIONS[key].map((o) => o.value)
  return [...new Set(values)].filter((v) => order.includes(v)).sort((a, b) => order.indexOf(a) - order.indexOf(b))
}

export function parseFilters(search: string): Filters {
  const params = new URLSearchParams(search)
  const filters: Filters = { type: [], domain: [], tech: [], year: [] }
  for (const key of FILTER_KEYS) {
    const raw = params.get(key)
    if (raw) filters[key] = orderValues(key, raw.split(','))
  }
  return filters
}

export function serializeFilters(filters: Filters) {
  const parts = FILTER_KEYS.filter((k) => filters[k].length).map((k) => `${k}=${filters[k].join(',')}`)
  return parts.length ? `?${parts.join('&')}` : ''
}

export function activeFilterCount(filters: Filters) {
  return FILTER_KEYS.reduce((n, k) => n + filters[k].length, 0)
}

/** OR within a filter, AND across filters. */
export function applyFilters(list: Project[], filters: Filters) {
  return list.filter((p) =>
    FILTER_KEYS.every((k) => filters[k].length === 0 || projectValues(p, k).some((v) => filters[k].includes(v))),
  )
}

/**
 * Homepage featured projects first (in their order), then other projects
 * newest first, then open source contributions newest first.
 */
export function sortProjects(list: Project[]) {
  const group = (p: Project) => (p.featured != null ? 0 : p.type === 'open-source' ? 2 : 1)
  const endKey = (p: Project) => (p.end === 'present' ? '9999-12' : p.end ?? p.start)
  return [...list].sort((a, b) =>
    group(a) - group(b) ||
    (a.featured ?? 0) - (b.featured ?? 0) ||
    endKey(b).localeCompare(endKey(a)) ||
    b.start.localeCompare(a.start),
  )
}

export function optionLabel(key: FilterKey, value: string) {
  return FILTER_OPTIONS[key].find((o) => o.value === value)?.label ?? value
}
