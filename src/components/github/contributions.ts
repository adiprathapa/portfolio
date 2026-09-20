export interface CachedHeatmap {
  year: number
  updatedAt: string
  total: number
  weeks: number[][]
}

export const GITHUB_USER = 'adiprathapa'
export const HEATMAP_YEAR = new Date().getFullYear()
export const ROWS = 7
/** -1 marks a calendar pad cell: rendered blank and not playable. */
export const EMPTY_CELL = -1

const MS_PER_DAY = 86_400_000

function localIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * Blanks days after today and drops weeks that have not started, so the graph
 * ends at the current week even when the cached file covers the whole year.
 */
export function trimFutureDays(weeks: number[][]): number[][] {
  const now = new Date()
  const jan1 = new Date(HEATMAP_YEAR, 0, 1)
  const today = new Date(HEATMAP_YEAR, now.getMonth(), now.getDate())
  // Round rather than floor: a DST shift leaves the span an hour short of whole days.
  const todayIndex = jan1.getDay() + Math.round((today.getTime() - jan1.getTime()) / MS_PER_DAY)
  const lastWeek = Math.floor(todayIndex / 7)
  return weeks
    .slice(0, lastWeek + 1)
    .map((week, w) => week.map((level, d) => (w * 7 + d > todayIndex ? EMPTY_CELL : level)))
}

interface ContributionDay { date: string; count: number; level: number }

export function buildWeeks(days: ContributionDay[]): number[][] {
  const weeks: number[][] = []
  let week: number[] = []

  if (days.length) {
    const dow = new Date(`${days[0].date}T00:00`).getDay()
    for (let i = 0; i < dow; i++) week.push(EMPTY_CELL)
  }
  for (const day of days) {
    week.push(Math.min(4, day.level ?? 0))
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length) {
    while (week.length < 7) week.push(EMPTY_CELL)
    weeks.push(week)
  }
  return weeks
}

function isCachedHeatmap(value: unknown): value is CachedHeatmap {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CachedHeatmap>
  return (
    candidate.year === HEATMAP_YEAR &&
    typeof candidate.updatedAt === 'string' &&
    typeof candidate.total === 'number' &&
    Array.isArray(candidate.weeks) &&
    candidate.weeks.every((week) => Array.isArray(week))
  )
}

/**
 * Prefers the build-time cache and falls back to the public contributions API.
 * Throws if neither is usable, so the caller can hide the graph rather than
 * showing made-up activity.
 */
export async function fetchHeatmap(): Promise<{ weeks: number[][]; total: number }> {
  const cachedResponse = await fetch('/github-heatmap.json')
  if (cachedResponse.ok) {
    const cached: unknown = await cachedResponse.json()
    if (isCachedHeatmap(cached)) return { weeks: cached.weeks, total: cached.total }
  }

  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=${HEATMAP_YEAR}`)
  if (!res.ok) throw new Error(`contributions api ${res.status}`)

  const json = await res.json()
  const today = localIsoDate(new Date())
  const days: ContributionDay[] = (json.contributions ?? [])
    .filter((d: { date?: string }) => !!d.date && d.date.startsWith(`${HEATMAP_YEAR}`) && d.date <= today)
    .sort((a: ContributionDay, b: ContributionDay) => a.date.localeCompare(b.date))

  return { weeks: buildWeeks(days), total: days.reduce((sum, day) => sum + day.count, 0) }
}

export function buildMonthLabels(grid: number[][]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (!grid.length) return []

  const jan1Dow = new Date(HEATMAP_YEAR, 0, 1).getDay()
  const labels: { label: string; col: number }[] = []
  let previous = -1

  for (let w = 0; w < grid.length; w++) {
    const firstReal = grid[w].findIndex((v) => v >= 0)
    if (firstReal < 0) continue
    const month = new Date(HEATMAP_YEAR, 0, 1 + w * 7 + firstReal - jan1Dow).getMonth()
    if (month !== previous) {
      labels.push({ label: months[month], col: w })
      previous = month
    }
  }
  return labels
}
