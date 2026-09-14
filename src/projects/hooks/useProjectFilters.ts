import { useCallback, useEffect, useState } from 'react'
import { EMPTY_FILTERS, orderValues, parseFilters, serializeFilters, type FilterKey, type Filters } from '../lib/filters'

/** Last filter query on the all-projects page, so detail pages can link back to it. */
export const LAST_QUERY_KEY = 'projects-last-query'

export function readLastProjectsQuery() {
  try {
    return sessionStorage.getItem(LAST_QUERY_KEY) ?? ''
  } catch {
    return ''
  }
}

export function useProjectFilters() {
  const [filters, setFilters] = useState<Filters>(() => parseFilters(window.location.search))

  // Keep the URL shareable without adding history entries per checkbox.
  useEffect(() => {
    const query = serializeFilters(filters)
    window.history.replaceState(null, '', `${window.location.pathname}${query}`)
    try {
      sessionStorage.setItem(LAST_QUERY_KEY, query)
    } catch {
      // Storage can be unavailable (private mode); the URL still carries the filters.
    }
  }, [filters])

  const toggle = useCallback((key: FilterKey, value: string) => {
    setFilters((current) => {
      const values = current[key].includes(value)
        ? current[key].filter((v) => v !== value)
        : [...current[key], value]
      return { ...current, [key]: orderValues(key, values) }
    })
  }, [])

  const clear = useCallback(() => setFilters(EMPTY_FILTERS), [])

  return { filters, toggle, clear }
}
