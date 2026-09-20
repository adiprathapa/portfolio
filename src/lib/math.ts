export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Root font size in px, for converting rem values read from CSS. */
export function rootFontSize() {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
}

export function rem(value: number) {
  return value * rootFontSize()
}
