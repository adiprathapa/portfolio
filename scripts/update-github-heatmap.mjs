import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const USER = 'adiprathapa'
const YEAR = new Date().getFullYear()
const OUTPUT = resolve('public/github-heatmap.json')

function buildWeeks(days) {
  const weeks = []
  let week = []

  if (days.length) {
    const firstDayOfWeek = new Date(`${days[0].date}T00:00`).getDay()
    for (let i = 0; i < firstDayOfWeek; i++) week.push(-1)
  }

  for (const day of days) {
    week.push(Math.min(4, day.level ?? 0))
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  if (week.length) {
    while (week.length < 7) week.push(-1)
    weeks.push(week)
  }

  return weeks
}

const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=${YEAR}`)
if (!response.ok) {
  throw new Error(`GitHub contributions API returned ${response.status}`)
}

const payload = await response.json()
const days = (payload.contributions ?? [])
  .filter((day) => day.date?.startsWith(`${YEAR}`))
  .sort((a, b) => a.date.localeCompare(b.date))

const cache = {
  year: YEAR,
  updatedAt: new Date().toISOString(),
  total: days.reduce((sum, day) => sum + (day.count ?? 0), 0),
  weeks: buildWeeks(days),
}

await mkdir(dirname(OUTPUT), { recursive: true })
await writeFile(OUTPUT, `${JSON.stringify(cache)}\n`, 'utf8')
