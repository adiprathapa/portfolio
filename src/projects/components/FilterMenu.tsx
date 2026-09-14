import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'
import type { FilterOption } from '../lib/filters'

const BORDER = '1.5px solid rgba(6, 113, 164, 0.3)'

interface FilterMenuProps {
  label: string
  icon: ReactNode
  options: FilterOption[]
  selected: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggle: (value: string) => void
  searchable?: boolean
}

/** Disclosure button + checkbox group. Arrow keys move between options, Escape closes. */
export function FilterMenu({ label, icon, options, selected, open, onOpenChange, onToggle, searchable = false }: FilterMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const labelId = useId()
  const [query, setQuery] = useState('')

  const shown = searchable && query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onOpenChange])

  const checkboxes = () => [...(panelRef.current?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? [])]

  const focusOption = (index: number) => {
    const inputs = checkboxes()
    if (!inputs.length) return
    inputs[(index + inputs.length) % inputs.length].focus()
  }

  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      onOpenChange(true)
      requestAnimationFrame(() => focusOption(0))
    }
  }

  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const inputs = checkboxes()
    const index = inputs.indexOf(document.activeElement as HTMLInputElement)
    const onCheckbox = index !== -1
    if (e.key === 'Escape') {
      e.preventDefault()
      onOpenChange(false)
      buttonRef.current?.focus()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusOption(onCheckbox ? index + 1 : 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusOption(onCheckbox ? index - 1 : inputs.length - 1)
    } else if (onCheckbox && e.key === 'Home') {
      e.preventDefault()
      focusOption(0)
    } else if (onCheckbox && e.key === 'End') {
      e.preventDefault()
      focusOption(inputs.length - 1)
    }
  }

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (open && !rootRef.current?.contains(e.relatedTarget as Node | null)) onOpenChange(false)
  }

  const active = selected.length > 0

  return (
    <div ref={rootRef} className="relative w-full md:w-auto" onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => onOpenChange(!open)}
        onKeyDown={onButtonKeyDown}
        className="flex w-full items-center justify-between gap-4 rounded-xl px-4 py-2.5 text-left font-medium transition-colors md:min-w-44"
        style={{
          background: '#F4F4F4',
          border: open || active ? '1.5px solid #0671A4' : BORDER,
          color: '#111827',
          fontSize: 'clamp(0.95rem, 0.2vw + 0.9rem, 1.0625rem)',
        }}
      >
        <span className="flex items-center gap-2.5">
          <span className="flex" style={{ color: '#0671A4' }}>{icon}</span>
          <span id={labelId}>{label}</span>
          {active && (
            <span className="rounded-full px-2 py-px text-xs font-semibold" style={{ background: '#0671A4', color: '#FFFFFF' }}>
              {selected.length}
            </span>
          )}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="group"
          aria-labelledby={labelId}
          onKeyDown={onPanelKeyDown}
          className="z-30 mt-2 w-full rounded-xl p-2 md:absolute md:left-0 md:w-72"
          style={{ background: '#F4F4F4', border: BORDER }}
        >
          {searchable && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              aria-label={`Search ${label.toLowerCase()}`}
              className="mb-2 w-full rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#0671A4]"
              style={{ background: '#E4EFF5', color: '#111827' }}
            />
          )}
          <div className="max-h-72 overflow-y-auto">
            {shown.map((option) => {
              const id = `${panelId}-${option.value}`
              const checked = selected.includes(option.value)
              return (
                <label
                  key={option.value}
                  htmlFor={id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[rgba(6,113,164,0.07)]"
                  style={{ color: '#111827' }}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(option.value)}
                      className="size-4 cursor-pointer accent-[#0671A4]"
                    />
                    {option.label}
                  </span>
                  <span className="text-xs tabular-nums" style={{ color: '#4B5563' }}>{option.count}</span>
                </label>
              )
            })}
            {shown.length === 0 && (
              <p className="px-3 py-2 text-sm" style={{ color: '#4B5563' }}>No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
