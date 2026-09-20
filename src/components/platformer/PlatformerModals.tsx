import { Fragment, type ReactNode } from 'react'
import { PillButton } from '../ui/pill-button'
import { CloseButton } from '../ui/close-button'
import { COLOR, PRIMARY, SURFACE, TEXT } from '../../lib/theme'
import { projectTitle } from './level'
import type { PlatformerPhase } from './usePlatformer'

const PANEL_STYLE = {
  background: 'rgba(239, 243, 248, 0.95)',
  backdropFilter: 'blur(20px)',
  border: `1.5px solid ${PRIMARY.a30}`,
}

function Keys({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-1">{children}</div>
}

function Key({ children }: { children: ReactNode }) {
  return <kbd className="capoo-key">{children}</kbd>
}

const MOBILE_CONTROLS: [ReactNode, string][] = [
  [<><Key>◀</Key><Key>▶</Key></>, 'tap arrows to move'],
  [<Key>▲</Key>, 'tap to jump (hold for higher)'],
  [<Key>Exit</Key>, 'top-right button'],
]

const DESKTOP_CONTROLS: [ReactNode, string][] = [
  [<><Key>←</Key><Key>→</Key></>, 'move'],
  [<><Key>Space</Key><span className="text-[11px] opacity-60">/</span><Key>↑</Key></>, 'jump (hold for higher)'],
  [<Key>R</Key>, 'restart'],
  [<Key>Esc</Key>, 'exit'],
]

export function PlatformerIntro({ isMobile, onStart, onExit }: {
  isMobile: boolean
  onStart: () => void
  onExit: () => void
}) {
  const controls = isMobile ? MOBILE_CONTROLS : DESKTOP_CONTROLS

  return (
    <div
      data-game-ui
      className="pointer-events-auto absolute inset-0 flex items-center justify-center px-4"
      style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onExit() }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
        style={PANEL_STYLE}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <div>
            <h3 className="font-normal" style={{ color: COLOR.primary, fontSize: TEXT.body }}>Project platformer</h3>
            <p className="mt-0.5 text-xs" style={{ color: PRIMARY.a50 }}>Race through every project to Experience</p>
          </div>
          <CloseButton aria-label="Exit" onClick={onExit} />
        </div>

        <div className="px-5 pb-5 pt-3">
          <p className="mb-4 text-sm" style={{ color: PRIMARY.a85 }}>
            Hop across the words on each project card and touch the orange ⚑ flag before the next card stacks on top of you.
          </p>
          <div
            className="mx-auto mb-5 rounded-xl px-4 py-3"
            style={{ background: SURFACE.page, border: `1px solid ${PRIMARY.a15}`, width: 'fit-content' }}
          >
            <div
              className="grid items-center gap-x-3 gap-y-2 text-sm"
              style={{ gridTemplateColumns: 'auto 1fr', color: PRIMARY.a85 }}
            >
              {controls.map(([keys, label]) => (
                <Fragment key={label}>
                  <Keys>{keys}</Keys>
                  <span>{label}</span>
                </Fragment>
              ))}
            </div>
          </div>
          <PillButton
            className="w-full px-6 py-2.5"
            onClick={(e) => { e.stopPropagation(); onStart() }}
            style={{ boxShadow: '0 2px 8px rgba(6, 113, 164, 0.18)' }}
          >
            Start
          </PillButton>
        </div>
      </div>
    </div>
  )
}

const OUTCOME_TITLE: Record<string, string> = {
  won: 'You made it!',
  'dead-squish': 'Smooshed by the next card',
  'dead-top': 'Squished off the top',
  'dead-bottom': 'Off the bottom',
}

function outcomeBody(phase: PlatformerPhase, reachedSlug: string | null) {
  if (phase === 'won') return 'You hopped through every project all the way to Experience.'
  if (phase === 'dead-squish') return `The next card squished you on ${projectTitle(reachedSlug)}. Reach the flag faster next time.`
  if (reachedSlug) return `You made it to ${projectTitle(reachedSlug)}.`
  return 'Land on a platform, fall through the gaps — use ← → to find an opening.'
}

export function PlatformerEnd({ phase, reachedSlug, onRestart, onExit }: {
  phase: PlatformerPhase
  reachedSlug: string | null
  onRestart: () => void
  onExit: () => void
}) {
  return (
    <div
      data-game-ui
      className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: 'rgba(228, 239, 245, 0.92)', backdropFilter: 'blur(4px)' }}
    >
      <div className="mb-2 px-6 text-center text-3xl font-normal" style={{ color: COLOR.primary }}>
        {OUTCOME_TITLE[phase]}
      </div>
      <div className="mb-5 max-w-md px-6 text-center text-sm" style={{ color: PRIMARY.a75 }}>
        {outcomeBody(phase, reachedSlug)}
      </div>
      <div className="flex gap-3">
        <PillButton onClick={(e) => { e.stopPropagation(); onRestart() }}>
          <span className="retry-btn inline-flex items-center gap-1.5">
            <svg className="retry-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <polyline points="3 3 3 9 9 9" />
            </svg>
            {phase === 'won' ? 'Play Again' : 'Try Again'}
          </span>
        </PillButton>
        <PillButton variant="ghost" className="font-normal" onClick={(e) => { e.stopPropagation(); onExit() }}>
          Exit
        </PillButton>
      </div>
    </div>
  )
}
