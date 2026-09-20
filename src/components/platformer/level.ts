import { featuredProjects } from '../../data/projects'
import { DESKTOP_BP } from '../../lib/theme'

/** Capoo's sprite, a touch smaller on mobile so he crowds the card less. */
export const CAPOO_W = typeof window !== 'undefined' && window.innerWidth < DESKTOP_BP ? 22 : 26
export const CAPOO_H = typeof window !== 'undefined' && window.innerWidth < DESKTOP_BP ? 20 : 24

export const GRAVITY = 900
export const JUMP_VY = -460
/** Releasing jump mid-rise clips upward velocity to this, for variable height. */
export const JUMP_CUT_VY = -180
export const MOVE_SPEED = 200
export const START_DELAY_MS = 900
export const LAND_TOLERANCE = 10
export const COYOTE_MS = 120
export const JUMP_BUFFER_MS = 160
/** Per-card race timer: the page scrolls to the next card over this long. */
export const CARD_TIME_MS = 12000
export const TELEPORT_MS = 600

/** Cards, words and flags are all tagged with the project's slug. */
export const PROJECT_SLUGS = featuredProjects.map((p) => p.slug)
export const FINAL_PROJECT_SLUG = PROJECT_SLUGS[PROJECT_SLUGS.length - 1]

export function projectTitle(slug: string | null) {
  return featuredProjects.find((p) => p.slug === slug)?.title ?? slug ?? ''
}

export function easeInOutSine(t: number) {
  return -0.5 * (Math.cos(Math.PI * t) - 1)
}

/**
 * Scroll distance between two cards' views. Mirrors `spacing` in Projects.tsx:
 * 650 on desktop, and on mobile the rendered card height times 1.15. Reading
 * the real height keeps the per-card scroll aligned with the animation rail.
 */
export function scrollPerCard(): number {
  if (window.innerWidth >= DESKTOP_BP) return 650
  const card = document.querySelector<HTMLElement>('[data-project-card]')
  return Math.round((card?.offsetHeight || 400) * 1.15)
}

export interface Rect {
  el: HTMLElement
  /** The project slug this platform or flag belongs to. */
  key: string
  top: number
  bottom: number
  left: number
  right: number
}

function collectRects(selector: string, dataKey: 'gameWord' | 'cardFlag'): Rect[] {
  const out: Rect[] = []
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const r = el.getBoundingClientRect()
    // Skip anything clipped out or collapsed.
    if (r.width <= 0 || r.height <= 0) return
    out.push({ el, key: el.dataset[dataKey] || '', top: r.top, bottom: r.bottom, left: r.left, right: r.right })
  })
  return out
}

export const wordRects = () => collectRects('[data-game-word]', 'gameWord')
export const flagRects = () => collectRects('[data-card-flag]', 'cardFlag')

export function findCard(slug: string) {
  return document.querySelector<HTMLElement>(`[data-project-card="${slug}"]`)
}

export function firstWordOfCard(slug: string) {
  const el = document.querySelector<HTMLElement>(`[data-game-word="${slug}"]`)
  return el ? { rect: el.getBoundingClientRect(), el } : null
}

/** Walks the paint stack at a point, ignoring the game's own HUD. */
function topmostContentAt(x: number, y: number): HTMLElement | null {
  if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) return null
  for (const el of document.elementsFromPoint(x, y)) {
    if (!(el instanceof HTMLElement)) continue
    if (el.closest('[data-game-ui]')) continue
    return el
  }
  return null
}

/**
 * True when a word platform is buried under another card, so Capoo cannot
 * stand on a word belonging to a card that is no longer on top.
 */
export function isWordCovered(word: Rect): boolean {
  const top = topmostContentAt((word.left + word.right) / 2, (word.top + word.bottom) / 2)
  if (!top) return false
  return !(top === word.el || word.el.contains(top) || top.contains(word.el))
}

/**
 * True when a card *later* in the stack than `currentSlug` is painted over any
 * part of Capoo — the race has caught up with him. Brushing an earlier card's
 * leftover text while jumping high does not count.
 */
export function isNextCardTouching(currentSlug: string, x: number, topY: number, bottomY: number): boolean {
  const currentIdx = PROJECT_SLUGS.indexOf(currentSlug)
  if (currentIdx < 0) return false

  for (const y of [topY + 2, (topY + bottomY) / 2, bottomY - 2]) {
    const top = topmostContentAt(x, y)
    const card = top?.closest<HTMLElement>('[data-project-card]')
    if (!card) continue
    if (PROJECT_SLUGS.indexOf(card.dataset.projectCard || '') > currentIdx) return true
  }
  return false
}
