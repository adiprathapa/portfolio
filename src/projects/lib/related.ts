import { projects, type Project } from '../../data/projects'

/** Projects sharing the most domains with `project`, then the most recent. */
export function relatedProjects(project: Project, count: number) {
  const endKey = (p: Project) => (p.end === 'present' ? '9999-12' : p.end ?? p.start)
  return projects
    .filter((p) => p.slug !== project.slug)
    .map((p) => ({ p, shared: p.domains.filter((d) => project.domains.includes(d)).length }))
    .sort((a, b) => b.shared - a.shared || endKey(b.p).localeCompare(endKey(a.p)))
    .slice(0, count)
    .map(({ p }) => p)
}
