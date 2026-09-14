import { useEffect } from 'react'
import { PageShell } from '../components/PageShell'
import { parseRoute } from './route'
import { AllProjectsPage } from './pages/AllProjectsPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'

function NotFound() {
  useEffect(() => {
    document.title = 'Project not found | Adi Prathapa'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="gradient-text font-normal" style={{ fontSize: 'clamp(2rem, 3vw + 1rem, 3rem)' }}>
        Project not found
      </h1>
      <p className="mt-4 leading-relaxed" style={{ color: '#4B5563' }}>
        That project doesn't exist or has moved.
      </p>
      <a href="/projects/" className="mt-8 inline-flex rounded-xl px-5 py-2.5 font-medium" style={{ backgroundColor: '#0671A4', color: '#FFFFFF' }}>
        See all projects
      </a>
    </div>
  )
}

export function ProjectsApp() {
  const route = parseRoute(window.location.pathname)

  return (
    <PageShell>
      {route.name === 'index' && <AllProjectsPage />}
      {route.name === 'detail' && <ProjectDetailPage slug={route.slug} />}
      {route.name === 'notfound' && <NotFound />}
    </PageShell>
  )
}
