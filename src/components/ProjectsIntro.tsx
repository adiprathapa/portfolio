import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ProjectMarquee } from './about/ProjectMarquee'
import { GithubHeatmap } from './GithubHeatmap'
import { MemoryMatch } from './games/MemoryMatch'
import { ConveyorMatchGame } from './games/ConveyorMatchGame'
import { ArrowIcon, CloseIcon } from './ui/icons'
import { projects } from '../data/projects'
import { posthog } from '../lib/analytics'
import { warmDocument } from '../lib/prefetch'
import { COLOR, PRIMARY, SURFACE, TEXT } from '../lib/theme'
import { useInView } from '../hooks/useInView'

const FLIP_TRANSITION = { duration: 0.6, ease: [0.4, 0, 0.2, 1] } as const
/** Half the flip, so each face swaps while it is edge-on and invisible. */
const FACE_SWAP = { duration: 0.08, delay: 0.26 } as const

function MatchingIcon() {
  const squares = [
    { x: 2, y: 2, delay: 0 },
    { x: 14, y: 2, delay: 0.3 },
    { x: 14, y: 14, delay: 0.6 },
    { x: 2, y: 14, delay: 0.9 },
  ]
  return (
    <svg className="size-3 lg:size-4" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {squares.map((s) => (
        <motion.rect
          key={`${s.x}-${s.y}`}
          x={s.x}
          y={s.y}
          width="8"
          height="8"
          rx="1"
          animate={{ fillOpacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
        />
      ))}
    </svg>
  )
}

/** One label of the marquee/game toggle, cross-fading with the other. */
function ToggleLabel({ id, icon, children }: { id: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.span
      key={id}
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex items-center gap-2 whitespace-nowrap"
    >
      {icon}
      {children}
    </motion.span>
  )
}

/** Fades the marquee edges into the section background. */
function EdgeFade({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 z-10 w-8 lg:w-32 ${side === 'left' ? 'left-0' : 'right-0'}`}
      style={{ background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, ${SURFACE.tint}, transparent)` }}
    />
  )
}

export function ProjectsIntro() {
  const [showMemoryGame, setShowMemoryGame] = useState(false)
  const [conveyorActive, setConveyorActive] = useState(false)
  const [conveyorKey, setConveyorKey] = useState(0)
  // The flip stage keeps the marquee's height while the game is showing, so
  // the page below it does not jump when the two faces differ in height.
  const [lockedHeight, setLockedHeight] = useState<number | undefined>()
  const [unlockAfterReturn, setUnlockAfterReturn] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const marqueeActive = useInView(sectionRef, { threshold: 0.15, once: true })
  const heavyContentReady = useInView(sectionRef, { once: true, rootMargin: '700px 0px', threshold: 0.01 })

  const startConveyorGame = useCallback(() => {
    if (stageRef.current) setLockedHeight(stageRef.current.offsetHeight)
    setUnlockAfterReturn(false)
    setShowMemoryGame(false)
    setConveyorKey((key) => key + 1)
    setConveyorActive(true)
    setTimeout(() => stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }, [])

  const endConveyorGame = useCallback(() => {
    setConveyorActive(false)
    setUnlockAfterReturn(true)
  }, [])

  const warmProjects = () => warmDocument('/projects/')

  return (
    <section ref={sectionRef} id="projects-intro" className="pb-0 pt-6 lg:pt-12" style={{ background: SURFACE.tint }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="gradient-text font-normal" style={{ fontSize: TEXT.h2 }}>Projects</h2>
          <a
            href="/projects/"
            className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-medium transition-opacity hover:opacity-70"
            style={{ color: COLOR.primary, fontSize: TEXT.link }}
            onMouseEnter={warmProjects}
            onFocus={warmProjects}
            onTouchStart={warmProjects}
            onClick={() => posthog?.capture('projects_index_link_clicked', { source: 'home_intro' })}
          >
            <span>See all {projects.length} projects</span>
            <ArrowIcon size={15} />
          </a>
        </div>

        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-4xl leading-relaxed text-black" style={{ fontSize: TEXT.body }}>
            I'm a full stack developer who works mainly in Python and Java, with JavaScript
            and TypeScript on the frontend. I've worked with a range of machine learning and
            data science libraries including PyTorch, TensorFlow, scikit-learn, and pandas.
            My projects range from fintech applications to machine learning focused work to
            apps that combine both.
            <span className="mt-3 block" style={{ fontSize: TEXT.bodySm, color: COLOR.body }}>
              <span className="font-medium" style={{ color: COLOR.primary }}>Currently building:</span>{' '}
              <a href="https://github.com/apatureai" target="_blank" rel="noopener noreferrer" className="underline decoration-[#0671A4]/40 underline-offset-4 hover:decoration-[#0671A4]">Apature</a>, a vision-model layer that reviews machine-generated UIs for design judgment, not pixels, and a
              preregistered study of what makes GNNs generalize to larger graphs.
            </span>
          </p>

          <motion.button
            layout
            transition={{ layout: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }}
            onClick={() => (conveyorActive ? endConveyorGame() : setShowMemoryGame(true))}
            className="flex shrink-0 cursor-pointer select-none items-center gap-2 self-center border-0 bg-transparent p-0 text-[10px] lg:self-auto lg:text-sm"
            style={{ color: PRIMARY.a75 }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {conveyorActive ? (
                <ToggleLabel id="end-game" icon={<CloseIcon size={16} className="size-3 lg:size-4" strokeWidth={2} />}>
                  End Game
                </ToggleLabel>
              ) : (
                <ToggleLabel id="matching-game" icon={<MatchingIcon />}>Matching</ToggleLabel>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showMemoryGame && (
          <MemoryMatch onClose={() => setShowMemoryGame(false)} onConveyorGame={startConveyorGame} />
        )}
      </AnimatePresence>

      {/* Marquee on the front face, conveyor game on the back. */}
      <div
        ref={stageRef}
        className="conveyor-flip-stage relative -my-4 mt-6 lg:mt-10"
        style={{
          perspective: 1200,
          height: lockedHeight,
          overflowX: 'hidden',
          overflowY: conveyorActive ? 'visible' : 'hidden',
        }}
      >
        <motion.div
          className="h-full"
          animate={{ rotateX: conveyorActive ? 180 : 0 }}
          transition={FLIP_TRANSITION}
          style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
          onAnimationComplete={() => {
            if (!conveyorActive && unlockAfterReturn) {
              setLockedHeight(undefined)
              setUnlockAfterReturn(false)
            }
          }}
        >
          <motion.div
            className="relative h-full"
            animate={{ opacity: conveyorActive ? 0 : 1 }}
            transition={FACE_SWAP}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: conveyorActive ? 'none' : 'auto',
            }}
          >
            <div className="project-marquee" aria-hidden={!heavyContentReady}>
              {heavyContentReady && <ProjectMarquee active={marqueeActive && !conveyorActive} />}
            </div>
            <EdgeFade side="left" />
            <EdgeFade side="right" />
          </motion.div>

          <motion.div
            className="absolute inset-0 h-full"
            animate={{ opacity: conveyorActive ? 1 : 0 }}
            transition={FACE_SWAP}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              pointerEvents: conveyorActive ? 'auto' : 'none',
            }}
          >
            <ConveyorMatchGame key={conveyorKey} onClose={endConveyorGame} />
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-4 lg:mt-8">
        {heavyContentReady ? <GithubHeatmap /> : <div className="projects-intro-heatmap-placeholder" aria-hidden="true" />}
      </div>
    </section>
  )
}
