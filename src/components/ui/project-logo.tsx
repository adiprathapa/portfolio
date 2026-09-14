import type { CSSProperties } from 'react'
import type { LogoFilter, Project } from '../../data/projects'

const SHADOW = 'drop-shadow(0 14px 30px rgba(0, 0, 0, 0.55)) drop-shadow(0 3px 8px rgba(0, 0, 0, 0.4))'

const FILTERS: Record<LogoFilter, string> = {
  white: 'brightness(0) invert(1)',
  'white-shadow': `brightness(0) invert(1) ${SHADOW}`,
  // For marks already rendered in white (keeps their own shading).
  shadow: SHADOW,
  'mono-white': 'grayscale(1) invert(1) brightness(3) contrast(10)',
  none: 'none',
}

export function ProjectLogo({ project, variant, className = '' }: { project: Project; variant: 'card' | 'grid' | 'hero'; className?: string }) {
  const logo = project.logo
  // Icon-only marks: projects without one show no logo rather than their name.
  if (!logo) return null

  const height = logo.height[variant]
  const imgStyle: CSSProperties = { height, filter: FILTERS[logo.filter] }

  return (
    <div className={`flex items-center gap-4 ${className}`} style={{ opacity: logo.opacity ?? 1 }}>
      {logo.marks.map((mark, i) => (
        <span key={mark.src} className="contents">
          {i > 0 && logo.joiner && (
            <span className="font-light text-white" style={{ fontSize: Math.round(height * 0.45) }}>
              &times;
            </span>
          )}
          <img src={mark.src} alt={mark.alt} className="w-auto object-contain" style={imgStyle} />
        </span>
      ))}
    </div>
  )
}
