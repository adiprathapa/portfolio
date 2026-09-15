import { useEffect, useMemo } from 'react'
import { TYPE_LABELS, projectBySlug, type LinkKind, type ProjectLink } from '../../data/projects'
import { projectWriteups } from '../../data/project-writeups'
import { posthog } from '../../lib/analytics'
import { ProjectLogo } from '../../components/ui/project-logo'
import { TechPill } from '../../components/ui/tech-pill'
import { ProjectBreadcrumb } from '../components/ProjectsSubnav'
import { ProjectGridCard } from '../components/ProjectGridCard'
import { TypeIcon } from '../components/TypeIcon'
import { ProjectMedia } from '../components/ProjectMedia'
import { readLastProjectsQuery } from '../hooks/useProjectFilters'
import { relatedProjects } from '../lib/related'
import { techSlug } from '../lib/filters'

const LINK_ORDER: LinkKind[] = ['live', 'repo', 'video', 'slides', 'prs', 'package', 'marketplace']
const LINK_LABELS: Record<LinkKind, string> = {
  live: 'Live site',
  repo: 'Repository',
  video: 'Watch demo',
  slides: 'Slides',
  prs: 'Pull requests',
  package: 'npm package',
  marketplace: 'GitHub Marketplace',
}

const BODY_TEXT = { color: '#374151', fontSize: 'clamp(1rem, 0.3vw + 0.9rem, 1.125rem)' }

function sortLinks(links: ProjectLink[]) {
  return [...links].sort((a, b) => LINK_ORDER.indexOf(a.kind) - LINK_ORDER.indexOf(b.kind))
}

export function ProjectDetailPage({ slug }: { slug: string }) {
  const project = projectBySlug(slug)!
  const sections = projectWriteups[slug] ?? []
  const backHref = `/projects/${readLastProjectsQuery()}`
  const related = useMemo(() => relatedProjects(project, 3), [project])
  const links = sortLinks(project.links)
  const color = project.brand.color

  useEffect(() => {
    document.title = `${project.title} | Adi Prathapa`
    posthog?.capture('projects_page_viewed', { page: 'detail', slug })
  }, [project.title, slug])

  return (
    <article className="mx-auto max-w-7xl px-6">
      {/* Single centered column for the write-up; "More projects" below uses the full width. */}
      <div className="mx-auto max-w-4xl">
        <ProjectBreadcrumb title={project.title} backHref={backHref} />

        <div
          className="relative mt-8 flex items-center justify-center overflow-hidden rounded-xl"
          style={{ backgroundColor: color, height: 'clamp(10rem, 22vw, 16rem)' }}
        >
          {project.brand.bgImage ? (
            <img src={project.brand.bgImage} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: project.brand.bgPosition }} />
          ) : (
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          )}
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${color}73 0%, ${color}D9 60%, ${color}FF 100%)` }} />
          <div className="relative" style={{ mixBlendMode: project.logo?.blend ?? 'normal' }}>
            <ProjectLogo project={project} variant="hero" />
          </div>
        </div>

        <header className="mt-10">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
            style={{ background: 'rgba(6, 113, 164, 0.08)', color: '#0671A4', border: '1px solid rgba(6, 113, 164, 0.15)' }}
          >
            <TypeIcon type={project.type} />
            {TYPE_LABELS[project.type]}
          </span>
          <h1 className="gradient-text mt-4 font-normal" style={{ fontSize: 'clamp(2.25rem, 3vw + 1rem, 3.5rem)', lineHeight: 1.1 }}>
            {project.title}
          </h1>
          <p className="mt-3 leading-snug" style={{ color: '#111827', fontSize: 'clamp(1.125rem, 0.6vw + 0.95rem, 1.5rem)' }}>
            {project.tagline}
          </p>
          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {links.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 font-medium transition-colors"
                  style={i === 0
                    ? { backgroundColor: '#0671A4', color: '#FFFFFF', border: '2px solid transparent' }
                    : { backgroundColor: 'transparent', color: '#0671A4', border: '2px solid rgba(6, 113, 164, 0.3)' }}
                  onClick={() => posthog?.capture('project_link_clicked', { slug, kind: link.kind, url: link.href, source: 'detail' })}
                >
                  {link.label ?? LINK_LABELS[link.kind]}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </header>

        <div className="mt-10">
          {project.media.map((media) => (
            <div key={media.src} className="mb-10">
              <ProjectMedia media={media} />
            </div>
          ))}

          {sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="font-heading font-medium" style={{ color: '#111827', fontSize: 'clamp(1.35rem, 0.6vw + 1.1rem, 1.75rem)' }}>
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-3 leading-relaxed" style={BODY_TEXT}>
                  {paragraph}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-4 list-disc space-y-2 pl-5" style={BODY_TEXT}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet.text}>
                      {bullet.href ? (
                        <a href={bullet.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: '#0671A4' }}>
                          {bullet.text}
                        </a>
                      ) : bullet.text}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {project.tech.length > 0 && (
            <section className="mb-4">
              <h2 className="font-heading font-medium" style={{ color: '#111827', fontSize: 'clamp(1.35rem, 0.6vw + 1.1rem, 1.75rem)' }}>
                Built with
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <TechPill key={tech} href={`/projects/?tech=${techSlug(tech)}`} className="rounded-xl px-3 py-1 text-sm font-medium">
                    {tech}
                  </TechPill>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="gradient-text font-normal" style={{ fontSize: 'clamp(1.5rem, 1vw + 1rem, 1.875rem)' }}>
              More projects
            </h2>
            <a href={backHref} className="font-medium transition-opacity hover:opacity-70" style={{ color: '#0671A4' }}>
              See all projects →
            </a>
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {related.map((p, i) => (
              <li key={p.slug}>
                <ProjectGridCard project={p} position={i + 1} source="more_projects" compact headingLevel={3} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
