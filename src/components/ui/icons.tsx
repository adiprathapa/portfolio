import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Stroke({ size = 16, strokeWidth = 1.8, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

/**
 * Chevron that grows into a full arrow on hover. `hovered` drives it from
 * component state; omit it to let the parent's `group-hover` class do the work.
 */
export function ArrowIcon({ hovered, size = 14, ...props }: IconProps & { hovered?: boolean }) {
  if (hovered === undefined) {
    return (
      <Stroke size={size} {...props}>
        <path className="transition-opacity group-hover:opacity-0" d="M8 5l7 7-7 7" />
        <path className="opacity-0 transition-opacity group-hover:opacity-100" d="M5 12h14" />
        <path className="opacity-0 transition-opacity group-hover:opacity-100" d="M12 5l7 7-7 7" />
      </Stroke>
    )
  }
  return (
    <Stroke size={size} {...props}>
      {hovered ? (
        <>
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </>
      ) : (
        <path d="M8 5l7 7-7 7" />
      )}
    </Stroke>
  )
}

export function CloseIcon({ size = 14, ...props }: IconProps) {
  return (
    <Stroke size={size} strokeWidth={2.5} {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </Stroke>
  )
}

/** Circular arrow; spins a full turn on the parent's `group` hover. */
export function RestartIcon({ size = 13, ...props }: IconProps) {
  return (
    <Stroke size={size} strokeWidth={2} className="transition-transform duration-500 group-hover:rotate-[360deg]" {...props}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </Stroke>
  )
}

export function ChevronLeftIcon({ size = 20, ...props }: IconProps) {
  return <Stroke size={size} strokeWidth={2.5} {...props}><polyline points="15 18 9 12 15 6" /></Stroke>
}

export function ChevronRightIcon({ size = 20, ...props }: IconProps) {
  return <Stroke size={size} strokeWidth={2.5} {...props}><polyline points="9 18 15 12 9 6" /></Stroke>
}

export function ArrowLeftIcon({ size = 18, ...props }: IconProps) {
  return <Stroke size={size} strokeWidth={2.5} {...props}><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></Stroke>
}

export function ArrowRightIcon({ size = 18, ...props }: IconProps) {
  return <Stroke size={size} strokeWidth={2.5} {...props}><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></Stroke>
}

export function ExternalLinkIcon({ size = 14, ...props }: IconProps) {
  return <Stroke size={size} strokeWidth={2} {...props}><path d="M7 17L17 7" /><path d="M7 7h10v10" /></Stroke>
}

export function GithubIcon({ size = 20, ...props }: Omit<IconProps, 'stroke'>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export function LinkedInIcon({ size = 20, ...props }: Omit<IconProps, 'stroke'>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export function MailIcon({ size = 20, ...props }: IconProps) {
  return <Stroke size={size} strokeWidth={2} {...props}><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></Stroke>
}

export function CalendarIcon({ size = 20, ...props }: IconProps) {
  return <Stroke size={size} strokeWidth={2} {...props}><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></Stroke>
}
