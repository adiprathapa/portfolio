import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const USER = 'adiP001'
const OUTPUT = resolve('public/duolingo-stats.json')

const response = await fetch(
  `https://www.duolingo.com/2017-06-30/users?username=${USER}&fields=users%7Bstreak,streakData,courses%7D`,
  { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; adiprathapa.space stats refresh)' } },
)
if (!response.ok) {
  throw new Error(`Duolingo API returned ${response.status}`)
}

const payload = await response.json()
const user = payload.users?.[0]
if (!user) {
  throw new Error(`Duolingo user ${USER} not found`)
}

const current = user.streakData?.currentStreak
const cache = {
  updatedAt: new Date().toISOString(),
  streak: current?.length ?? user.streak ?? 0,
  streakEnd: current?.endDate ?? null,
  courses: Object.fromEntries(
    (user.courses ?? [])
      .filter((course) => course.title && typeof course.xp === 'number')
      .map((course) => [course.title, course.xp]),
  ),
}

await mkdir(dirname(OUTPUT), { recursive: true })
await writeFile(OUTPUT, `${JSON.stringify(cache)}\n`, 'utf8')
