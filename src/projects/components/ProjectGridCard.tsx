import { TYPE_LABELS, projectPath, type Project } from '../../data/projects'
import { posthog } from '../../lib/analytics'
import { warmDocument } from '../../lib/prefetch'
import { ProjectLogo } from '../../components/ui/project-logo'
import { TypeIcon } from './TypeIcon'

interface ProjectGridCardProps {
  project: Project
  position: number
  source: 'index' | 'more_projects'
  eager?: boolean
  compact?: boolean
  headingLevel?: 2 | 3
}

/** Stripe-style tile: brand image under a tint, logo top-left, type icon top-right, headline at the bottom. */
export function ProjectGridCard({ project, position, source, eager = false, compact = false, headingLevel = 2 }: ProjectGridCardProps) {
  const href = projectPath(project.slug)
  const color = project.brand.color
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <a
      href={href}
      aria-label={`${project.title}: ${project.tagline}`}
      className={`group relative block overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0671A4] ${compact ? 'aspect-[4/3]' : 'aspect-[4/3] md:aspect-[16/11]'}`}
      style={{ backgroundColor: color }}
      onMouseEnter={() => warmDocument(href)}
      onFocus={() => warmDocument(href)}
      onTouchStart={() => warmDocument(href)}
      onClick={() => posthog?.capture('project_card_opened', { slug: project.slug, source, position })}
    >
      {project.brand.bgImage ? (
        <img
          src={project.brand.bgImage}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager && position === 1 ? 'high' : undefined}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          style={{ objectPosition: project.brand.bgPosition }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${color}66 0%, ${color}A6 45%, ${color}F2 100%)` }}
      />

      <div className={`relative flex h-full flex-col justify-between ${compact ? 'p-5' : 'p-5 lg:p-7'}`}>
        <div className="flex items-start justify-between gap-4">
          <div style={{ mixBlendMode: project.logo?.blend ?? 'normal' }}>
            <ProjectLogo project={project} variant="grid" />
          </div>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)' }}
            title={TYPE_LABELS[project.type]}
          >
            <TypeIcon type={project.type} />
          </span>
        </div>

        <div>
          <Heading
            className="font-heading font-medium text-white"
            style={{ color: '#FFFFFF', lineHeight: 1.25, fontSize: compact ? 'clamp(1.05rem, 0.4vw + 0.9rem, 1.25rem)' : 'clamp(1.25rem, 0.8vw + 1rem, 1.75rem)' }}
          >
            {project.tagline}
          </Heading>
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white lg:text-base">
            View project
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  )
}
