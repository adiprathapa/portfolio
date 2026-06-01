import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Section } from './ui/section'
import { RippleButton } from './ui/ripple-button'

/* ─── types ─── */
type Phase = 'idle' | 'playing' | 'over'
type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
interface Pos { r: number; c: number }
interface CachedHeatmap {
  year: number
  updatedAt: string
  total: number
  weeks: number[][]
}

/* ─── palette & constants ─── */
const LEVELS = ['#EFF3F8', '#BAE0F5', '#7CCAF0', '#38BDF8', '#0671A4']
const SNAKE_HD = '#0f172a'
const SNAKE_TL = '#38bdf8'
const ROWS = 7
const USER = 'adiprathapa'
const YEAR = new Date().getFullYear()
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const BASE_MS = 135
const MIN_MS = 72
const ACCEL = 2
const SWIPE_THRESHOLD = 22

/* ─── helpers ─── */
function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t)
}
function blendHex(h1: string, h2: string, t: number) {
  const p = (h: string, o: number) => parseInt(h.slice(o, o + 2), 16)
  return `rgb(${lerp(p(h1, 1), p(h2, 1), t)},${lerp(p(h1, 3), p(h2, 3), t)},${lerp(p(h1, 5), p(h2, 5), t)})`
}

/** Generate a plausible random heatmap when the API is unreachable. */
function makeFallback(): number[][] {
  const d0 = new Date(YEAR, 0, 1)
  const pad = d0.getDay()
  const now = new Date()
  const weeks: number[][] = []
  let wk: number[] = Array(pad).fill(-1)
  for (let i = 0; ; i++) {
    const dt = new Date(YEAR, 0, 1 + i)
    if (dt.getFullYear() !== YEAR || dt > now) break
    const wd = dt.getDay() > 0 && dt.getDay() < 6
    const r = Math.random()
    wk.push(
      wd
        ? r < 0.28 ? 0 : r < 0.52 ? 1 : r < 0.76 ? 2 : r < 0.92 ? 3 : 4
        : r < 0.52 ? 0 : r < 0.78 ? 1 : r < 0.92 ? 2 : 3,
    )
    if (wk.length === 7) { weeks.push(wk); wk = [] }
  }
  if (wk.length) { while (wk.length < 7) wk.push(-1); weeks.push(wk) }
  return weeks
}

function buildWeeksFromContributions(days: { date: string; count: number; level: number }[]) {
  const weeks: number[][] = []
  let week: number[] = []
  if (days.length) {
    const dow = new Date(days[0].date + 'T00:00').getDay()
    for (let i = 0; i < dow; i++) week.push(-1)
  }
  for (const day of days) {
    week.push(Math.min(4, day.level ?? 0))
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length) { while (week.length < 7) week.push(-1); weeks.push(week) }
  return weeks
}

function isCachedHeatmap(value: unknown): value is CachedHeatmap {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CachedHeatmap>
  return (
    candidate.year === YEAR &&
    typeof candidate.updatedAt === 'string' &&
    typeof candidate.total === 'number' &&
    Array.isArray(candidate.weeks) &&
    candidate.weeks.every((week) => Array.isArray(week))
  )
}

/* ─── component ─── */
export function GithubHeatmap() {
  const wrapRef = useRef<HTMLDivElement>(null)

  /* visual sizing (state drives render, refs let game loop read latest) */
  const [cell, setCell] = useState(18)
  const [gap, setGap] = useState(4)
  const [clip, setClip] = useState<number | undefined>()
  const cellRef = useRef(18)
  const gapRef = useRef(4)

  /* contribution data */
  const [grid, setGrid] = useState<number[][]>([])     // grid[week][day] = level 0-4 or -1
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  /* game */
  const [phase, setPhase] = useState<Phase>('idle')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [, bump] = useState(0)                          // render trigger for non-food ticks

  const gridRef    = useRef<number[][]>([])              // live game grid
  const origRef    = useRef<number[][]>([])              // pristine copy for resets
  const snakeRef   = useRef<Pos[]>([])
  const dirRef     = useRef<Dir>('RIGHT')
  const nextDirRef = useRef<Dir>('RIGHT')
  const phaseRef   = useRef<Phase>('idle')
  const scoreRef   = useRef(0)
  const speedRef   = useRef(BASE_MS)
  const timerRef   = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const gameColsRef = useRef(0)
  const foodRef    = useRef(0)
  const touchRef   = useRef<{ x: number; y: number } | undefined>(undefined)
  const [linkHov, setLinkHov] = useState(false)

  /* ═══════════════════════════════ data fetch ═══════════════════════════════ */
  useEffect(() => {
    let cancelled = false
    const applyHeatmap = (weeks: number[][], nextTotal: number) => {
      origRef.current = weeks.map(w => [...w])
      gridRef.current = weeks.map(w => [...w])
      setGrid(weeks)
      setTotal(nextTotal)
      setLoading(false)
    }

    ;(async () => {
      try {
        const cachedResponse = await fetch('/github-heatmap.json')
        if (cachedResponse.ok) {
          const cached = await cachedResponse.json()
          if (isCachedHeatmap(cached)) {
            if (cancelled) return
            applyHeatmap(cached.weeks, cached.total)
            return
          }
        }

        const res = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${USER}?y=${YEAR}`,
        )
        if (!res.ok) throw 0
        const json = await res.json()
        const days: { date: string; count: number; level: number }[] =
          (json.contributions ?? []).filter((d: { date?: string }) =>
            d.date?.startsWith(`${YEAR}`),
          )
        days.sort((a, b) => a.date.localeCompare(b.date))

        const weeks = buildWeeksFromContributions(days)
        const tot = days.reduce((sum, day) => sum + day.count, 0)
        if (cancelled) return

        applyHeatmap(weeks, tot)
      } catch {
        if (cancelled) return
        const fb = makeFallback()
        applyHeatmap(fb, fb.flat().filter(v => v > 0).length * 3)
      }
    })()
    return () => { cancelled = true }
  }, [])

  /* ══════════════════════════════ responsive ════════════════════════════════ */
  useEffect(() => {
    const calc = () => {
      const mob = window.innerWidth < 1024
      const sz = mob ? 14 : 18
      const g = mob ? 3 : 4
      setCell(sz); setGap(g)
      cellRef.current = sz; gapRef.current = g
      if (mob && wrapRef.current) {
        const avail = wrapRef.current.clientWidth
        const stride = sz + g
        setClip(Math.max(1, Math.floor((avail + g) / stride)) * stride - g)
      } else {
        setClip(undefined)
      }
    }
    calc()
    window.addEventListener('resize', calc)
    const ro = new ResizeObserver(calc)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => { window.removeEventListener('resize', calc); ro.disconnect() }
  }, [])

  /* ═══════════════════════════ month labels ═════════════════════════════════ */
  const monthLabels = useMemo(() => {
    if (!grid.length) return []
    const dow0 = new Date(YEAR, 0, 1).getDay()
    const out: { label: string; col: number }[] = []
    let prev = -1
    for (let w = 0; w < grid.length; w++) {
      const fi = grid[w].findIndex(v => v >= 0)
      if (fi < 0) continue
      const dt = new Date(YEAR, 0, 1 + w * 7 + fi - dow0)
      const m = dt.getMonth()
      if (m !== prev) { out.push({ label: MO[m], col: w }); prev = m }
    }
    return out
  }, [grid])

  /* ═══════════════════════════ game tick ════════════════════════════════════ */
  const stepRef = useRef<() => void>(() => {})
  stepRef.current = () => {
    if (phaseRef.current !== 'playing') return
    const g = gridRef.current
    const sn = snakeRef.current
    const cols = gameColsRef.current

    dirRef.current = nextDirRef.current
    const head = sn[0]
    let nr = head.r
    let nc = head.c
    const advance = () => {
      if (dirRef.current === 'UP') nr--
      else if (dirRef.current === 'DOWN') nr++
      else if (dirRef.current === 'LEFT') nc--
      else nc++

      if (nr < 0) nr = ROWS - 1
      if (nr >= ROWS) nr = 0
      if (nc < 0) nc = cols - 1
      if (nc >= cols) nc = 0
    }

    advance()
    // Calendar padding cells are visual blanks, not playable squares. Skip them
    // in the current direction so they behave like part of the wrapped edge.
    let skipped = 0
    while (g[nc]?.[nr] === -1 && skipped < ROWS * cols) {
      advance()
      skipped++
    }

    const cellVal = g[nc]?.[nr]
    const willEat = cellVal !== undefined && cellVal > 0
    const hitSelf = sn.some(
      (s, i) => s.r === nr && s.c === nc && (willEat || i < sn.length - 1),
    )
    if (cellVal === undefined || hitSelf) {
      phaseRef.current = 'over'; setPhase('over')
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = undefined }
      setBest(b => Math.max(b, scoreRef.current))
      return
    }

    sn.unshift({ r: nr, c: nc })

    if (willEat) {
      scoreRef.current++; setScore(scoreRef.current)
      g[nc][nr] = 0
      foodRef.current--
      if (foodRef.current <= 0) {
        // ate every contribution — you win
        phaseRef.current = 'over'; setPhase('over')
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = undefined }
        setBest(b => Math.max(b, scoreRef.current))
        return
      }
      if (speedRef.current > MIN_MS) {
        speedRef.current -= ACCEL
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => stepRef.current(), speedRef.current)
      }
    } else {
      sn.pop()
      bump(t => t + 1) // force re-render when score didn't change
    }
  }

  /* ═══════════════════════════ start / exit ═════════════════════════════════ */
  const play = useCallback(() => {
    gridRef.current = origRef.current.map(w => [...w])
    // visible columns = game area
    const cw = wrapRef.current?.clientWidth ?? 800
    const stride = cellRef.current + gapRef.current
    const cols = Math.min(gridRef.current.length, Math.floor((cw + gapRef.current) / stride))
    gameColsRef.current = cols

    // count food in game area
    let fc = 0
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < ROWS; r++)
        if (gridRef.current[c]?.[r] > 0) fc++
    foodRef.current = fc

    // place snake mid-left
    const sc = Math.max(2, Math.floor(cols / 4))
    const sr = 3
    snakeRef.current = [
      { r: sr, c: sc },
      { r: sr, c: sc - 1 },
      { r: sr, c: sc - 2 },
    ]
    // ensure starting cells are valid
    for (const s of snakeRef.current)
      if (gridRef.current[s.c]?.[s.r] === -1) gridRef.current[s.c][s.r] = 0

    dirRef.current = 'RIGHT'; nextDirRef.current = 'RIGHT'
    scoreRef.current = 0; setScore(0)
    speedRef.current = BASE_MS
    phaseRef.current = 'playing'; setPhase('playing')
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => stepRef.current(), BASE_MS)
  }, [])

  const exit = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = undefined }
    phaseRef.current = 'idle'; setPhase('idle')
    gridRef.current = origRef.current.map(w => [...w])
  }, [])

  const steer = useCallback((next: Dir) => {
    const current = dirRef.current
    if (next === 'UP' && current === 'DOWN') return
    if (next === 'DOWN' && current === 'UP') return
    if (next === 'LEFT' && current === 'RIGHT') return
    if (next === 'RIGHT' && current === 'LEFT') return
    nextDirRef.current = next
  }, [])

  const steerFromSwipe = useCallback((dx: number, dy: number) => {
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return false

    if (Math.abs(dx) > Math.abs(dy)) {
      steer(dx > 0 ? 'RIGHT' : 'LEFT')
    } else {
      steer(dy > 0 ? 'DOWN' : 'UP')
    }

    return true
  }, [steer])

  /* ═══════════════════════════ keyboard ═════════════════════════════════════ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current === 'playing') {
        if (e.key === 'ArrowUp' || e.key === 'w')
          { e.preventDefault(); steer('UP') }
        else if (e.key === 'ArrowDown' || e.key === 's')
          { e.preventDefault(); steer('DOWN') }
        else if (e.key === 'ArrowLeft' || e.key === 'a')
          { e.preventDefault(); steer('LEFT') }
        else if (e.key === 'ArrowRight' || e.key === 'd')
          { e.preventDefault(); steer('RIGHT') }
      }
      if (e.key === 'Escape' && phaseRef.current !== 'idle') { e.preventDefault(); exit() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [play, exit, steer])

  /* ═══════════════════════════ touch / swipe ════════════════════════════════ */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (phaseRef.current !== 'playing') return
    if (e.touches.length !== 1) return
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current || phaseRef.current !== 'playing' || e.touches.length !== 1) return
    e.preventDefault()

    const touch = e.touches[0]
    const dx = touch.clientX - touchRef.current.x
    const dy = touch.clientY - touchRef.current.y
    if (steerFromSwipe(dx, dy)) {
      touchRef.current = { x: touch.clientX, y: touch.clientY }
    }
  }, [steerFromSwipe])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current || phaseRef.current !== 'playing') return
    const dx = e.changedTouches[0].clientX - touchRef.current.x
    const dy = e.changedTouches[0].clientY - touchRef.current.y
    touchRef.current = undefined
    steerFromSwipe(dx, dy)
  }, [steerFromSwipe])

  const onTouchCancel = useCallback(() => {
    touchRef.current = undefined
  }, [])

  const handleClick = useCallback(() => {
    if (phaseRef.current === 'idle') play()
  }, [play])

  const gameButtonStyle = {
    borderRadius: 999,
    border: '2px solid rgba(6, 113, 164, 0.3)',
    color: '#0671A4',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1,
    minHeight: 34,
    padding: '0 14px',
    backgroundColor: '#E4EFF5',
    transition: 'background-color 0.3s, border-color 0.3s, color 0.3s',
  } satisfies CSSProperties

  const primaryGameButtonStyle = {
    ...gameButtonStyle,
    color: '#FFFFFF',
    backgroundColor: '#0671A4',
    border: '2px solid transparent',
    boxShadow: '0 2px 8px rgba(6, 113, 164, 0.12)',
  } satisfies CSSProperties

  /* cleanup */
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  /* ═══════════════════════════ render prep ══════════════════════════════════ */
  const sn = snakeRef.current
  const isGame = phase !== 'idle'

  // precompute snake lookup & gradient colors
  const snakeMap = new Map<string, number>()
  const snakeColors: string[] = []
  if (isGame && sn.length) {
    const len = sn.length
    sn.forEach((s, i) => {
      snakeMap.set(`${s.c},${s.r}`, i)
      snakeColors.push(
        i === 0 ? SNAKE_HD : blendHex(SNAKE_HD, SNAKE_TL, i / Math.max(1, len - 1)),
      )
    })
  }

  const displayGrid = isGame ? gridRef.current : grid
  const stride = cell + gap
  const gameW = isGame && gameColsRef.current > 0
    ? gameColsRef.current * stride - gap
    : undefined

  const cellColor = (c: number, r: number, lvl: number): string => {
    if (lvl === -1) return 'transparent'
    if (isGame) {
      const idx = snakeMap.get(`${c},${r}`)
      if (idx !== undefined) return snakeColors[idx]
    }
    return LEVELS[lvl] ?? LEVELS[0]
  }

  /* ═══════════════════════════ JSX ══════════════════════════════════════════ */
  return (
    <Section id="github" className="!pt-[8vh] !pb-[2vh]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">

        {/* ── heatmap / snake ── */}
        <div
          ref={wrapRef}
          className="order-2 lg:order-1 w-full lg:flex-1 min-w-0 flex flex-col items-center lg:block"
          style={{ colorScheme: 'light' }}
        >
          {loading ? (
            <div style={{ height: ROWS * cell + (ROWS - 1) * gap + 24 }} />
          ) : (
            <>
              {/* month labels */}
              <div className="overflow-hidden" style={{ width: gameW ?? clip ?? 'fit-content', maxWidth: '100%', marginBottom: 4 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: '1fr',
                    gridAutoFlow: 'column',
                    gridAutoColumns: `${cell}px`,
                    gap: `0 ${gap}px`,
                  }}
                >
                  {displayGrid.map((_, c) => {
                    const ml = monthLabels.find(m => m.col === c)
                    return (
                      <div
                        key={c}
                        style={{
                          fontSize: cell < 16 ? 10 : 12,
                          color: '#4B5563',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.4',
                        }}
                      >
                        {ml?.label ?? '\u00A0'}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* cell grid */}
              <div
                className={`overflow-hidden relative ${phase === 'idle' ? 'github-heatmap-fade group cursor-pointer' : ''}`}
                style={{
                  width: gameW ?? clip ?? 'fit-content',
                  maxWidth: '100%',
                  touchAction: phase === 'playing' ? 'none' : 'pan-y',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                }}
                onClick={handleClick}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchCancel}
              >
                <div
                  className={phase === 'idle' ? 'transition-opacity duration-200 group-hover:opacity-15' : ''}
                  style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(7, ${cell}px)`,
                    gridAutoFlow: 'column',
                    gridAutoColumns: `${cell}px`,
                    gap: `${gap}px`,
                    opacity: phase === 'over' ? 0.15 : undefined,
                  }}
                >
                  {displayGrid.map((wk, c) =>
                    wk.map((lvl, r) => (
                      <div
                        key={`${c}-${r}`}
                        style={{
                          width: cell,
                          height: cell,
                          borderRadius: 2,
                          backgroundColor: cellColor(
                            c, r,
                            isGame ? (gridRef.current[c]?.[r] ?? lvl) : lvl,
                          ),
                          transition: isGame ? 'background-color 60ms' : 'none',
                        }}
                      />
                    )),
                  )}
                </div>

                {/* idle hover overlay */}
                {phase === 'idle' && (
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  >
                    <span
                      style={{
                        color: '#0671A4',
                        fontWeight: 400,
                        fontSize: 15,
                      }}
                    >
                      Click to play Snake
                    </span>
                  </div>
                )}

                {/* score HUD */}
                {phase === 'playing' && (
                  <div
                    className="absolute top-1 right-2 pointer-events-none select-none"
                    style={{ color: '#0671A4', fontWeight: 600, fontSize: 13 }}
                  >
                    {score}
                  </div>
                )}

                {/* game over overlay */}
                {phase === 'over' && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <span style={{ color: '#0f172a', fontWeight: 400, fontSize: 18 }}>
                      {foodRef.current <= 0 ? 'You Win!' : 'Game Over'}
                    </span>
                    <span style={{ color: '#0671A4', fontWeight: 400, fontSize: 14, marginTop: 4 }}>
                      {score > 0 && score >= best
                        ? `New Best Score: ${score}`
                        : `Score: ${score}`}
                    </span>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <RippleButton
                        type="button"
                        className="group rounded-full px-4 py-2 text-[13px]"
                        rippleColor="#38BDF8"
                        style={primaryGameButtonStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#055a84'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#0671A4'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          play()
                        }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform duration-500 group-hover:rotate-[360deg]"
                            aria-hidden="true"
                          >
                            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                            <path d="M21 3v6h-6" />
                          </svg>
                          <span>Play Again</span>
                        </span>
                      </RippleButton>
                      <RippleButton
                        type="button"
                        className="rounded-full px-4 py-2 text-[13px]"
                        rippleColor="#38BDF8"
                        style={gameButtonStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#D7E8F1'
                          e.currentTarget.style.borderColor = '#0671A4'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#E4EFF5'
                          e.currentTarget.style.borderColor = 'rgba(6, 113, 164, 0.3)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          exit()
                        }}
                      >
                        Exit
                      </RippleButton>
                    </div>
                  </div>
                )}
              </div>

              {/* footer line */}
              <div
                className="flex items-center justify-between gap-3 lg:justify-start"
                style={{
                  width: gameW ?? clip ?? 'fit-content',
                  maxWidth: '100%',
                  marginTop: 6,
                  fontSize: cell < 16 ? 11 : 13,
                  color: '#4B5563',
                }}
              >
                {phase === 'idle' && (
                  <>
                    <span>{total.toLocaleString()} contributions in {YEAR}</span>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-[10px] lg:text-sm bg-transparent border-0 p-0 cursor-pointer select-none lg:hidden"
                      style={{ color: 'rgba(6, 113, 164, 0.45)' }}
                      onClick={play}
                    >
                      <motion.svg
                        className="size-2.5 lg:size-3.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <path d="M5 3l14 9-14 9V3z" />
                      </motion.svg>
                      Snake
                    </button>
                  </>
                )}
                {phase === 'playing' && (
                  <span>
                    <span className="lg:hidden">Swipe to steer</span>
                    <span className="hidden lg:inline">Arrow keys to steer, Esc to quit</span>
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── text panel ── */}
        <div className="order-1 lg:order-2 w-full lg:w-auto lg:max-w-md lg:text-right lg:shrink-0">
          <h2 className="font-normal gradient-text" style={{ fontSize: 'clamp(1.5rem, 1vw + 1rem, 1.875rem)' }}>
            View my projects on GitHub
          </h2>
          <p
            className="mt-3 leading-relaxed"
            style={{ color: '#4B5563', fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}
          >
            Every square is another commit toward open source work, research
            prototypes, and side projects. Browse the full set on GitHub.
          </p>
          <a
            href="https://github.com/adiprathapa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 font-medium transition-opacity hover:opacity-70"
            style={{ color: '#0671A4', fontSize: 'clamp(1rem, 0.5vw + 0.75rem, 1.25rem)' }}
            onMouseEnter={() => setLinkHov(true)}
            onMouseLeave={() => setLinkHov(false)}
          >
            <span>github.com/adiprathapa</span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {linkHov ? (
                <>
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </>
              ) : (
                <path d="M8 5l7 7-7 7" />
              )}
            </svg>
          </a>
        </div>
      </div>
    </Section>
  )
}
