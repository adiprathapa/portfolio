// Build-time support for the /projects/ pages.
// - dev: /projects/ and /projects/<slug>/ load the projects entry.
// - preview: serves the generated per-project HTML and 404s unknown slugs,
//   matching how Vercel serves the static output.
// - build: writes dist/projects/<slug>/index.html with per-project title,
//   description, canonical, Open Graph/Twitter tags, JSON-LD and a <noscript>
//   summary (link previews don't run JS), then regenerates sitemap.xml and
//   llms.txt. Bad project data fails the build.
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import { projects, SITE_ORIGIN, TYPE_LABELS, projectPath, type Project } from '../src/data/projects.ts'
import { projectWriteups } from '../src/data/project-writeups.ts'
import { formatDateRange } from '../src/data/format.ts'

const PROJECTS_PATH_RE = /^\/projects(?:\/([a-z0-9-]+))?\/?$/
const SLUG_RE = /^[a-z0-9-]+$/
const DEFAULT_OG_IMAGE = '/og-image.png'
const INDEX_TITLE = 'All projects | Adi Prathapa'
const INDEX_DESCRIPTION = 'Everything Adi Prathapa has built: startup work, solo projects, hackathon builds, challenge entries, research and open source contributions.'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function absolute(url: string) {
  return url.startsWith('http') ? url : `${SITE_ORIGIN}${url}`
}

function metaTags({ title, description, url, image, type }: { title: string; description: string; url: string; image: string; type: 'website' | 'article' }) {
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const lines = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:image" content="${absolute(image)}" />`,
  ]
  if (image === DEFAULT_OG_IMAGE) {
    lines.push('<meta property="og:image:width" content="1200" />', '<meta property="og:image:height" content="630" />')
  }
  lines.push(
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${absolute(image)}" />`,
  )
  return lines.join('\n    ')
}

function jsonLd(data: unknown) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}

const AUTHOR = { '@type': 'Person', name: 'Aditya (Adi) Prathapa', url: `${SITE_ORIGIN}/` }

function replaceMarker(html: string, marker: string, content: string) {
  if (!html.includes(marker)) throw new Error(`[project-pages] marker ${marker} missing from projects/index.html output`)
  return html.replace(marker, content)
}

function replaceMeta(html: string, content: string) {
  const start = '<!--meta:start-->'
  const end = '<!--meta:end-->'
  const i = html.indexOf(start)
  const j = html.indexOf(end)
  if (i === -1 || j === -1) throw new Error('[project-pages] meta markers missing from projects/index.html output')
  return `${html.slice(0, i)}${start}\n    ${content}\n    ${html.slice(j)}`
}

function projectNoscript(project: Project) {
  const sections = (projectWriteups[project.slug] ?? [])
    .map((section) => {
      const paragraphs = section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')
      const bullets = section.bullets?.length
        ? `<ul>${section.bullets.map((b) => `<li>${b.href ? `<a href="${escapeHtml(b.href)}">${escapeHtml(b.text)}</a>` : escapeHtml(b.text)}</li>`).join('')}</ul>`
        : ''
      return `<h2>${escapeHtml(section.heading)}</h2>${paragraphs}${bullets}`
    })
    .join('')
  const facts = [
    TYPE_LABELS[project.type],
    project.event?.name,
    project.teamSize ? `Team of ${project.teamSize}` : undefined,
    project.role,
    formatDateRange(project.start, project.end),
  ].filter(Boolean)
  const links = project.links.map((l) => `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.label ?? l.kind)}</a></li>`).join('')
  return `<noscript><main><p><a href="/projects/">All projects</a></p><h1>${escapeHtml(project.title)}</h1><p>${escapeHtml(project.tagline)}</p><p>${escapeHtml(facts.join(' · '))}</p>${sections}<ul>${links}</ul></main></noscript>`
}

function indexNoscript() {
  const items = projects
    .map((p) => `<li><a href="${projectPath(p.slug)}">${escapeHtml(p.title)}</a>: ${escapeHtml(p.summary)}</li>`)
    .join('')
  return `<noscript><main><h1>All projects</h1><ul>${items}</ul></main></noscript>`
}

function validate(publicDir: string) {
  const errors: string[] = []
  const seen = new Set<string>()
  const assetExists = (src: string | undefined, where: string) => {
    if (!src || src.startsWith('http')) return
    if (!fs.existsSync(path.join(publicDir, src))) errors.push(`${where}: missing public asset ${src}`)
  }
  for (const p of projects) {
    if (!SLUG_RE.test(p.slug)) errors.push(`${p.slug}: slug must match ${SLUG_RE}`)
    if (seen.has(p.slug)) errors.push(`${p.slug}: duplicate slug`)
    seen.add(p.slug)
    if (!p.title || !p.tagline || !p.summary) errors.push(`${p.slug}: title, tagline and summary are required`)
    if (p.summary.length > 160) errors.push(`${p.slug}: summary is ${p.summary.length} characters (max 160)`)
    if (!/^\d{4}-\d{2}$/.test(p.start)) errors.push(`${p.slug}: start must be YYYY-MM`)
    if (p.end && p.end !== 'present' && !/^\d{4}-\d{2}$/.test(p.end)) errors.push(`${p.slug}: end must be YYYY-MM or present`)
    if (!projectWriteups[p.slug]?.length) errors.push(`${p.slug}: no write-up in src/data/project-writeups.ts`)
    assetExists(p.brand.bgImage, p.slug)
    assetExists(p.ogImage, p.slug)
    p.logo?.marks.forEach((m) => assetExists(m.src, p.slug))
    p.media.forEach((m) => { assetExists(m.src, p.slug); assetExists(m.poster, p.slug) })
  }
  for (const slug of Object.keys(projectWriteups)) {
    if (!seen.has(slug)) errors.push(`project-writeups.ts has a write-up for unknown slug ${slug}`)
  }
  if (projects.filter((p) => p.featured != null).length < 2) errors.push('at least 2 projects must be featured on the homepage')
  if (errors.length) throw new Error(`[project-pages] invalid project data:\n  - ${errors.join('\n  - ')}`)
}

function sitemap() {
  const urls = ['/', '/projects/', ...projects.map((p) => projectPath(p.slug)), '/calendar.html', '/privacy.html']
  const body = urls
    .map((u) => `  <url>\n    <loc>${SITE_ORIGIN}${u}</loc>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

export function projectPages(): Plugin {
  let config: ResolvedConfig

  return {
    name: 'project-pages',
    configResolved(resolved) {
      config = resolved
    },
    buildStart() {
      if (config.command === 'build') validate(config.publicDir)
    },
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [pathname, query] = (req.url ?? '').split('?')
        if (PROJECTS_PATH_RE.test(pathname) && pathname !== '/projects/index.html') {
          req.url = `/projects/index.html${query ? `?${query}` : ''}`
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const [pathname, query] = (req.url ?? '').split('?')
        const match = pathname.match(PROJECTS_PATH_RE)
        if (!match) return next()
        const outDir = path.resolve(config.root, config.build.outDir)
        const rel = match[1] ? `projects/${match[1]}/index.html` : 'projects/index.html'
        if (fs.existsSync(path.join(outDir, rel))) {
          req.url = `/${rel}${query ? `?${query}` : ''}`
          return next()
        }
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(fs.readFileSync(path.join(outDir, '404.html')))
      })
    },
    writeBundle: {
      order: 'post',
      handler(options) {
        const outDir = options.dir ?? path.resolve(config.root, config.build.outDir)
        const template = fs.readFileSync(path.join(outDir, 'projects', 'index.html'), 'utf8')

        for (const project of projects) {
          const url = `${SITE_ORIGIN}${projectPath(project.slug)}`
          let html = replaceMeta(template, metaTags({
            title: `${project.title} | Adi Prathapa`,
            description: project.summary,
            url,
            image: project.ogImage ?? DEFAULT_OG_IMAGE,
            type: 'article',
          }))
          html = replaceMarker(html, '<!--jsonld-->', jsonLd({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: project.title,
            headline: project.tagline,
            description: project.summary,
            url,
            author: AUTHOR,
            dateCreated: project.start,
            keywords: project.tech.join(', '),
          }))
          html = replaceMarker(html, '<!--noscript-->', projectNoscript(project))
          const dir = path.join(outDir, 'projects', project.slug)
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(path.join(dir, 'index.html'), html)
        }

        let indexHtml = replaceMeta(template, metaTags({
          title: INDEX_TITLE,
          description: INDEX_DESCRIPTION,
          url: `${SITE_ORIGIN}/projects/`,
          image: DEFAULT_OG_IMAGE,
          type: 'website',
        }))
        indexHtml = replaceMarker(indexHtml, '<!--jsonld-->', jsonLd({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Projects by Adi Prathapa',
          itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_ORIGIN}${projectPath(p.slug)}`, name: p.title })),
        }))
        indexHtml = replaceMarker(indexHtml, '<!--noscript-->', indexNoscript())
        fs.writeFileSync(path.join(outDir, 'projects', 'index.html'), indexHtml)

        fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap())

        const llmsSource = path.join(config.publicDir, 'llms.txt')
        if (fs.existsSync(llmsSource)) {
          const list = projects.map((p) => `- [${p.title}](${SITE_ORIGIN}${projectPath(p.slug)}): ${p.summary}`).join('\n')
          const llms = fs.readFileSync(llmsSource, 'utf8').replace('<!-- PROJECTS -->', list)
          fs.writeFileSync(path.join(outDir, 'llms.txt'), llms)
        }
      },
    },
  }
}
