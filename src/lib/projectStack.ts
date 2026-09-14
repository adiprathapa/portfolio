/**
 * Y offset of card `i` in the homepage project stack at card progress `p`
 * (0 → 1) for `n` cards. Each card starts `i * spacing` below the first and
 * rises one spacing per segment, keeping `stagger` px of the cards before it
 * visible. The last card lands flush at 0 so it covers the stack.
 */
export function stackCardY(i: number, p: number, n: number, spacing: number, stagger: number) {
  if (n < 2 || i === 0) return 0
  const last = i === n - 1
  const pos = Math.min(Math.max(p, 0), 1) * (n - 1)
  const at = (s: number) => (last && s === i ? 0 : (i - s) * spacing + s * stagger)
  if (pos >= i) return at(i)
  const k = Math.floor(pos)
  return at(k) + (at(k + 1) - at(k)) * (pos - k)
}
