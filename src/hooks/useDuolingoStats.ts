import { useEffect, useState } from 'react'

export interface DuolingoStats {
  updatedAt: string
  streak: number
  streakEnd: string | null
  courses: Record<string, number>
}

const STALE_AFTER_MS = 2 * 24 * 60 * 60 * 1000

let request: Promise<DuolingoStats | null> | null = null

function loadStats() {
  request ??= fetch('/duolingo-stats.json')
    .then((response) => (response.ok ? (response.json() as Promise<DuolingoStats>) : null))
    .catch(() => null)
  return request
}

export function duolingoLabel(stats: DuolingoStats, course?: string) {
  const parts: string[] = []
  const streakIsCurrent = stats.streakEnd && Date.now() - new Date(`${stats.streakEnd}T00:00:00Z`).getTime() < STALE_AFTER_MS
  if (stats.streak > 0 && streakIsCurrent) parts.push(`🔥 ${stats.streak.toLocaleString()} day streak`)
  const xp = course ? stats.courses[course] : undefined
  if (xp) parts.push(`${xp.toLocaleString()} XP`)
  return parts.length ? parts.join(' · ') : null
}

export function useDuolingoStats() {
  const [stats, setStats] = useState<DuolingoStats | null>(null)

  useEffect(() => {
    let active = true
    loadStats().then((result) => {
      if (active) setStats(result)
    })
    return () => {
      active = false
    }
  }, [])

  return stats
}
