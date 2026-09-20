import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Section } from './ui/section'
import { PillButton } from './ui/pill-button'
import { ArrowIcon, RestartIcon } from './ui/icons'
import { useSnakeGame } from './github/useSnakeGame'
import {
  fetchHeatmap,
  trimFutureDays,
  buildMonthLabels,
  GITHUB_USER,
  HEATMAP_YEAR,
  ROWS,
  EMPTY_CELL,
} from './github/contributions'
import { COLOR, SURFACE, TEXT } from '../lib/theme'
import { lerp } from '../lib/math'
import { useIsDesktop } from '../hooks/useMediaQuery'

const LEVEL_COLORS = [SURFACE.panel, '#BAE0F5', '#7CCAF0', COLOR.accent, COLOR.primary]
const SNAKE_HEAD = COLOR.ink
const SNAKE_TAIL = '#38bdf8'

/** Blends two `#rrggbb` strings for the snake's head-to-tail gradient. */
function blendHex(from: string, to: string, t: number) {
  const channel = (hex: string, offset: number) => parseInt(hex.slice(offset, offset + 2), 16)
  const mix = (offset: number) => Math.round(lerp(channel(from, offset), channel(to, offset), t))
  return `rgb(${mix(1)},${mix(3)},${mix(5)})`
}

/** Cell and gap size, plus how many columns currently fit. */
function useGridMetrics(wrapRef: React.RefObject<HTMLDivElement | null>) {
  const isDesktop = useIsDesktop()
  const cell = isDesktop ? 18 : 14
  const gap = isDesktop ? 4 : 3
  const [visibleCols, setVisibleCols] = useState<number | undefined>()

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => setVisibleCols(Math.max(1, Math.floor((el.clientWidth + gap) / (cell + gap))))
    measure()
    window.addEventListener('resize', measure)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      window.removeEventListener('resize', measure)
      ro.disconnect()
    }
  }, [wrapRef, cell, gap])

  return { cell, gap, visibleCols, stride: cell + gap }
}

export function GithubHeatmap() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const { cell, gap, visibleCols, stride } = useGridMetrics(wrapRef)

  const [grid, setGrid] = useState<number[][]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)
  const [linkHovered, setLinkHovered] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchHeatmap()
      .then(({ weeks, total: nextTotal }) => {
        if (cancelled) return
        setGrid(trimFutureDays(weeks))
        setTotal(nextTotal)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        // Hide the graph rather than showing made-up activity.
        setUnavailable(true)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const gameColumns = useCallback(
    () => Math.floor(((wrapRef.current?.clientWidth ?? 800) + gap) / stride),
    [gap, stride],
  )
  const game = useSnakeGame({ source: grid, columns: gameColumns })
  const monthLabels = useMemo(() => buildMonthLabels(grid), [grid])

  const isGame = game.phase !== 'idle'
  const idleStartCol = Math.max(0, grid.length - (visibleCols ?? grid.length))
  const displayGrid = isGame ? game.liveGrid : grid.slice(idleStartCol)
  const colOffset = isGame ? game.startCol : idleStartCol

  // Precompute the snake's cells and their gradient so the render is a lookup.
  const snakeColors = useMemo(() => {
    const map = new Map<string, string>()
    if (!isGame) return map
    const length = game.snake.length
    game.snake.forEach((cell, i) => {
      map.set(`${cell.c},${cell.r}`, i === 0 ? SNAKE_HEAD : blendHex(SNAKE_HEAD, SNAKE_TAIL, i / Math.max(1, length - 1)))
    })
    return map
  }, [isGame, game.snake])

  const cellColor = (c: number, r: number, level: number) => {
    if (level === EMPTY_CELL) return 'transparent'
    return (isGame && snakeColors.get(`${c},${r}`)) || LEVEL_COLORS[level] || LEVEL_COLORS[0]
  }

  const boardWidth = isGame && game.columnCount > 0
    ? game.columnCount * stride - gap
    : grid.length > idleStartCol
      ? (grid.length - idleStartCol) * stride - gap
      : 'fit-content'

  const fadeOldestEdge = idleStartCol > 0 ? 'linear-gradient(to left, black 88%, transparent 100%)' : 'none'

  return (
    <Section id="github" className="!pb-[2vh] !pt-[8vh]">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div
          ref={wrapRef}
          className="order-2 flex w-full min-w-0 flex-col items-center lg:order-1 lg:block lg:flex-1"
          style={{ colorScheme: 'light' }}
        >
          {unavailable ? null : loading ? (
            <div style={{ height: ROWS * cell + (ROWS - 1) * gap + 24 }} />
          ) : (
            <>
              <div className="overflow-hidden" style={{ width: boardWidth, maxWidth: '100%', marginBottom: 4 }}>
                <div style={{ display: 'grid', gridTemplateRows: '1fr', gridAutoFlow: 'column', gridAutoColumns: `${cell}px`, gap: `0 ${gap}px` }}>
                  {displayGrid.map((_, c) => (
                    <div key={c} style={{ fontSize: cell < 16 ? 10 : 12, color: COLOR.body, whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                      {monthLabels.find((m) => m.col === c + colOffset)?.label ?? ' '}
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`relative overflow-hidden ${game.phase === 'idle' ? 'github-heatmap-fade group cursor-pointer' : ''}`}
                role={game.phase === 'idle' ? 'button' : undefined}
                tabIndex={game.phase === 'idle' ? 0 : -1}
                aria-label={game.phase === 'idle' ? 'Play the contribution graph game' : undefined}
                onKeyDown={(e) => {
                  if (game.phase === 'idle' && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    game.play()
                  }
                }}
                style={{
                  width: boardWidth,
                  maxWidth: '100%',
                  // The newest week sits on the right, so fade the oldest edge,
                  // and only when earlier weeks are actually cut off.
                  ...(game.phase === 'idle' ? { maskImage: fadeOldestEdge, WebkitMaskImage: fadeOldestEdge } : {}),
                  touchAction: game.phase === 'playing' ? 'none' : 'pan-y',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                }}
                onClick={() => { if (game.phase === 'idle') game.play() }}
                {...game.touchHandlers}
              >
                <div
                  className={game.phase === 'idle' ? 'transition-opacity duration-200 group-hover:opacity-15' : ''}
                  style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${ROWS}, ${cell}px)`,
                    gridAutoFlow: 'column',
                    gridAutoColumns: `${cell}px`,
                    gap: `${gap}px`,
                    opacity: game.phase === 'over' ? 0.15 : undefined,
                  }}
                >
                  {displayGrid.map((week, c) =>
                    week.map((level, r) => (
                      <div
                        key={`${c}-${r}`}
                        style={{
                          width: cell,
                          height: cell,
                          borderRadius: 2,
                          backgroundColor: cellColor(c, r, isGame ? (game.liveGrid[c]?.[r] ?? level) : level),
                          transition: isGame ? 'background-color 60ms' : 'none',
                        }}
                      />
                    )),
                  )}
                </div>

                {game.phase === 'idle' && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span style={{ color: COLOR.primary, fontWeight: 400, fontSize: 15 }}>Click to play Snake</span>
                  </div>
                )}

                {game.phase === 'playing' && (
                  <div className="pointer-events-none absolute right-2 top-1 select-none" style={{ color: COLOR.primary, fontWeight: 600, fontSize: 13 }}>
                    {game.score}
                  </div>
                )}

                {game.phase === 'over' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span style={{ color: COLOR.ink, fontWeight: 400, fontSize: 18 }}>
                      {game.cleared ? 'You Win!' : 'Game Over'}
                    </span>
                    <span style={{ color: COLOR.primary, fontWeight: 400, fontSize: 14, marginTop: 4 }}>
                      {game.score > 0 && game.score >= game.best ? `New Best Score: ${game.score}` : `Score: ${game.score}`}
                    </span>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <PillButton
                        className="group px-4 py-2 text-[13px]"
                        onClick={(e) => { e.stopPropagation(); game.play() }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <RestartIcon />
                          <span>Play Again</span>
                        </span>
                      </PillButton>
                      <PillButton
                        variant="soft"
                        className="px-4 py-2 text-[13px]"
                        onClick={(e) => { e.stopPropagation(); game.exit() }}
                      >
                        Exit
                      </PillButton>
                    </div>
                  </div>
                )}
              </div>

              <div
                className="flex items-center justify-between gap-3 lg:justify-start"
                style={{ width: boardWidth, maxWidth: '100%', marginTop: 6, fontSize: cell < 16 ? 11 : 13, color: COLOR.body }}
              >
                {game.phase === 'idle' && (
                  <>
                    <span>{total.toLocaleString()} contributions in {HEATMAP_YEAR}</span>
                    <button
                      type="button"
                      className="flex cursor-pointer select-none items-center gap-2 border-0 bg-transparent p-0 text-[10px] lg:hidden lg:text-sm"
                      style={{ color: 'rgba(6, 113, 164, 0.75)' }}
                      onClick={game.play}
                    >
                      <motion.svg
                        className="size-2.5 lg:size-3.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
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
                {game.phase === 'playing' && (
                  <span>
                    <span className="lg:hidden">Swipe to steer</span>
                    <span className="hidden lg:inline">Arrow keys to steer, Esc to quit</span>
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <HeatmapCopy hovered={linkHovered} setHovered={setLinkHovered} />
      </div>
    </Section>
  )
}

function HeatmapCopy({ hovered, setHovered }: { hovered: boolean; setHovered: (v: boolean) => void }) {
  return (
    <div className="order-1 w-full lg:order-2 lg:w-auto lg:max-w-md lg:shrink-0 lg:text-right">
      <h2 className="gradient-text font-normal" style={{ fontSize: TEXT.h2 }}>View my projects on GitHub</h2>
      <p className="mt-3 leading-relaxed" style={{ color: COLOR.body, fontSize: TEXT.body }}>
        Every square is another commit toward open source work, research
        prototypes, and side projects. Browse the full set on GitHub.
      </p>
      <a
        href={`https://github.com/${GITHUB_USER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70"
        style={{ color: COLOR.primary, fontSize: TEXT.body }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span>github.com/{GITHUB_USER}</span>
        <ArrowIcon hovered={hovered} size={13} />
      </a>
    </div>
  )
}
