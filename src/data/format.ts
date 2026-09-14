const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function parseMonth(ym: string) {
  const [year, month] = ym.split('-').map(Number)
  return { year, month }
}

/** 'YYYY-MM' → 'May 2026' */
export function formatMonth(ym: string) {
  const { year, month } = parseMonth(ym)
  return `${MONTHS[month - 1]} ${year}`
}

/** Matches the Experience section style: 'May — August 2026', 'August 2026 — Present'. */
export function formatDateRange(start: string, end?: string) {
  if (!end || end === start) return formatMonth(start)
  if (end === 'present') return `${formatMonth(start)} — Present`
  const s = parseMonth(start)
  const e = parseMonth(end)
  if (s.year === e.year) return `${MONTHS[s.month - 1]} — ${formatMonth(end)}`
  return `${formatMonth(start)} — ${formatMonth(end)}`
}

export function yearsCovered(start: string, end: string | undefined, currentYear: number) {
  const from = parseMonth(start).year
  const to = !end ? from : end === 'present' ? currentYear : parseMonth(end).year
  const years: number[] = []
  for (let y = from; y <= to; y++) years.push(y)
  return years
}
