import { useCallback, useEffect, useRef, useState } from 'react'
import { EMPTY_CELL, ROWS } from './contributions'

export type SnakePhase = 'idle' | 'playing' | 'over'
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
interface Cell { r: number; c: number }

const BASE_MS = 135
const MIN_MS = 72
/** Milliseconds shaved off the tick for each contribution eaten. */
const ACCEL_MS = 2
const SWIPE_THRESHOLD = 22

const OPPOSITE: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }

interface SnakeOptions {
  /** Pristine contribution grid, indexed `[week][day]`. */
  source: number[][]
  /** Visible columns available to the game, measured at start. */
  columns: () => number
}

/**
 * Snake played on the contribution graph. The grid doubles as the board: every
 * square with contributions is food, and eating it clears the square.
 */
export function useSnakeGame({ source, columns }: SnakeOptions) {
  const [phase, setPhase] = useState<SnakePhase>('idle')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [startCol, setStartCol] = useState(0)
  const [, forceRender] = useState(0)

  const grid = useRef<number[][]>([])
  const snake = useRef<Cell[]>([])
  const direction = useRef<Direction>('RIGHT')
  const nextDirection = useRef<Direction>('RIGHT')
  const phaseRef = useRef<SnakePhase>('idle')
  const scoreRef = useRef(0)
  const speed = useRef(BASE_MS)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const gameCols = useRef(0)
  const foodLeft = useRef(0)
  const touchStart = useRef<{ x: number; y: number } | undefined>(undefined)

  const stopTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = undefined
  }, [])

  const end = useCallback(() => {
    phaseRef.current = 'over'
    setPhase('over')
    stopTimer()
    setBest((b) => Math.max(b, scoreRef.current))
  }, [stopTimer])

  // Kept in a ref so the interval always calls the latest closure.
  const step = useRef<() => void>(() => {})
  // eslint-disable-next-line react-hooks/refs
  step.current = () => {
    if (phaseRef.current !== 'playing') return
    const g = grid.current
    const body = snake.current
    const cols = gameCols.current

    direction.current = nextDirection.current
    let { r, c } = body[0]

    const advance = () => {
      if (direction.current === 'UP') r--
      else if (direction.current === 'DOWN') r++
      else if (direction.current === 'LEFT') c--
      else c++

      if (r < 0) r = ROWS - 1
      if (r >= ROWS) r = 0
      if (c < 0) c = cols - 1
      if (c >= cols) c = 0
    }

    advance()
    // Calendar pad cells are visual blanks, so skip over them in the current
    // direction and let them behave like part of the wrapped edge.
    let skipped = 0
    while (g[c]?.[r] === EMPTY_CELL && skipped < ROWS * cols) {
      advance()
      skipped++
    }

    const value = g[c]?.[r]
    const willEat = value !== undefined && value > 0
    const hitSelf = body.some((s, i) => s.r === r && s.c === c && (willEat || i < body.length - 1))
    if (value === undefined || hitSelf) {
      end()
      return
    }

    body.unshift({ r, c })

    if (!willEat) {
      body.pop()
      forceRender((t) => t + 1)
      return
    }

    scoreRef.current++
    setScore(scoreRef.current)
    g[c][r] = 0
    foodLeft.current--

    if (foodLeft.current <= 0) {
      end()
      return
    }
    if (speed.current > MIN_MS) {
      speed.current -= ACCEL_MS
      stopTimer()
      timer.current = setInterval(() => step.current(), speed.current)
    }
  }

  const play = useCallback(() => {
    const cols = Math.min(source.length, columns())
    const from = source.length - cols
    setStartCol(from)
    grid.current = source.slice(from).map((week) => [...week])
    gameCols.current = cols

    let food = 0
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (grid.current[c]?.[r] > 0) food++
      }
    }
    foodLeft.current = food

    const col = Math.max(2, Math.floor(cols / 4))
    const row = 3
    snake.current = [{ r: row, c: col }, { r: row, c: col - 1 }, { r: row, c: col - 2 }]
    for (const cell of snake.current) {
      if (grid.current[cell.c]?.[cell.r] === EMPTY_CELL) grid.current[cell.c][cell.r] = 0
    }

    direction.current = 'RIGHT'
    nextDirection.current = 'RIGHT'
    scoreRef.current = 0
    setScore(0)
    speed.current = BASE_MS
    phaseRef.current = 'playing'
    setPhase('playing')
    stopTimer()
    timer.current = setInterval(() => step.current(), BASE_MS)
  }, [source, columns, stopTimer])

  const exit = useCallback(() => {
    stopTimer()
    phaseRef.current = 'idle'
    setPhase('idle')
    grid.current = source.map((week) => [...week])
  }, [source, stopTimer])

  const steer = useCallback((next: Direction) => {
    if (OPPOSITE[next] === direction.current) return
    nextDirection.current = next
  }, [])

  const steerFromSwipe = useCallback((dx: number, dy: number) => {
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return false
    if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? 'RIGHT' : 'LEFT')
    else steer(dy > 0 ? 'DOWN' : 'UP')
    return true
  }, [steer])

  useEffect(() => {
    const keyToDirection: Record<string, Direction> = {
      ArrowUp: 'UP', w: 'UP',
      ArrowDown: 'DOWN', s: 'DOWN',
      ArrowLeft: 'LEFT', a: 'LEFT',
      ArrowRight: 'RIGHT', d: 'RIGHT',
    }
    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current === 'playing' && keyToDirection[e.key]) {
        e.preventDefault()
        steer(keyToDirection[e.key])
      }
      if (e.key === 'Escape' && phaseRef.current !== 'idle') {
        e.preventDefault()
        exit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [exit, steer])

  useEffect(() => stopTimer, [stopTimer])

  const touchHandlers = {
    onTouchStart: useCallback((e: React.TouchEvent) => {
      if (phaseRef.current !== 'playing' || e.touches.length !== 1) return
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }, []),
    onTouchMove: useCallback((e: React.TouchEvent) => {
      if (!touchStart.current || phaseRef.current !== 'playing' || e.touches.length !== 1) return
      e.preventDefault()
      const touch = e.touches[0]
      if (steerFromSwipe(touch.clientX - touchStart.current.x, touch.clientY - touchStart.current.y)) {
        touchStart.current = { x: touch.clientX, y: touch.clientY }
      }
    }, [steerFromSwipe]),
    onTouchEnd: useCallback((e: React.TouchEvent) => {
      if (!touchStart.current || phaseRef.current !== 'playing') return
      const { x, y } = touchStart.current
      touchStart.current = undefined
      steerFromSwipe(e.changedTouches[0].clientX - x, e.changedTouches[0].clientY - y)
    }, [steerFromSwipe]),
    onTouchCancel: useCallback(() => { touchStart.current = undefined }, []),
  }

  // The board lives in refs because the tick runs on an interval at up to ~14
  // fps and must not queue a state update per cell. Every tick ends by bumping
  // `score` or `forceRender`, so these reads are always paired with a render.
  /* eslint-disable react-hooks/refs */
  return {
    phase,
    score,
    best,
    /** First grid column shown while playing. */
    startCol,
    columnCount: gameCols.current,
    /** True when the board was cleared rather than lost. */
    cleared: foodLeft.current <= 0,
    liveGrid: grid.current,
    snake: snake.current,
    play,
    exit,
    touchHandlers,
  }
  /* eslint-enable react-hooks/refs */
}
