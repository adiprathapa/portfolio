export type PlatformerPhase = 'intro' | 'starting' | 'playing' | 'dead-top' | 'dead-bottom' | 'dead-squish' | 'won'

export const DEAD_PHASES: PlatformerPhase[] = ['dead-top', 'dead-bottom', 'dead-squish']

export function isOver(phase: PlatformerPhase) {
  return phase === 'won' || DEAD_PHASES.includes(phase)
}
