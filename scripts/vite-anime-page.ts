import type { Connect, Plugin } from 'vite'

const ANIME_PATH_RE = /^\/anime\/?$/

const rewrite: Connect.NextHandleFunction = (req, _res, next) => {
  const [pathname, query] = (req.url ?? '').split('?')
  if (ANIME_PATH_RE.test(pathname)) {
    req.url = `/anime/index.html${query ? `?${query}` : ''}`
  }
  next()
}

export function animePage(): Plugin {
  return {
    name: 'anime-page',
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}
