import type { ReactNode } from 'react'
import { COLOR, PRIMARY } from '../../lib/theme'

const BUTTON_SIZE = 52

const BASE = {
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  touchAction: 'none' as const,
}

function PadButton({ label, primary, onPress, onRelease, children }: {
  label: string
  primary?: boolean
  onPress: () => void
  onRelease: () => void
  children: ReactNode
}) {
  return (
    <button
      aria-label={label}
      onPointerDown={(e) => { e.preventDefault(); onPress() }}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      onPointerLeave={onRelease}
      className="flex select-none items-center justify-center rounded-full"
      style={{
        ...BASE,
        background: primary ? COLOR.primary : 'rgba(255,255,255,0.92)',
        border: primary ? `1.5px solid ${COLOR.primaryHover}` : `1.5px solid ${PRIMARY.a30}`,
        color: primary ? '#fff' : COLOR.primary,
        boxShadow: primary ? '0 4px 12px rgba(6, 113, 164, 0.35)' : '0 4px 10px rgba(0,0,0,0.12)',
      }}
    >
      {children}
    </button>
  )
}

interface TouchControlsProps {
  onLeft: (down: boolean) => void
  onRight: (down: boolean) => void
  onJump: (down: boolean) => void
}

/** On-screen d-pad, shown during play on small viewports. */
export function TouchControls({ onLeft, onRight, onJump }: TouchControlsProps) {
  return (
    <div
      data-game-ui
      className="pointer-events-none absolute inset-x-0 flex items-center justify-between px-4"
      style={{ bottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}
    >
      <div className="pointer-events-auto flex gap-3">
        <PadButton label="Move left" onPress={() => onLeft(true)} onRelease={() => onLeft(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </PadButton>
        <PadButton label="Move right" onPress={() => onRight(true)} onRelease={() => onRight(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </PadButton>
      </div>
      <div className="pointer-events-auto">
        <PadButton label="Jump" primary onPress={() => onJump(true)} onRelease={() => onJump(false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        </PadButton>
      </div>
    </div>
  )
}
