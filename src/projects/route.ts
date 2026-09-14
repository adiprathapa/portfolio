import { projectBySlug } from '../data/projects'

export type Route =
  | { name: 'index' }
  | { name: 'detail'; slug: string }
  | { name: 'notfound' }

export function parseRoute(pathname: string): Route {
  const match = pathname.match(/^\/projects(?:\/([a-z0-9-]+))?\/?(?:index\.html)?$/)
  if (!match) return { name: 'notfound' }
  if (!match[1]) return { name: 'index' }
  return projectBySlug(match[1]) ? { name: 'detail', slug: match[1] } : { name: 'notfound' }
}
