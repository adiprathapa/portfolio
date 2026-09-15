// Single source of truth for every project on the site: the homepage stack
// (featured), the all-projects grid and each /projects/<slug>/ page. Plain
// data only, so the build plugin can import it too.

export type ProjectType = 'startup' | 'solo' | 'hackathon' | 'challenge' | 'research' | 'open-source'
export type ProjectDomain = 'graph-ml' | 'agents-llms' | 'devtools' | 'fintech' | 'chip-systems' | 'data' | 'ml-systems'
export type LinkKind = 'live' | 'repo' | 'slides' | 'prs' | 'video' | 'package' | 'marketplace'
export type LogoFilter = 'white' | 'white-shadow' | 'shadow' | 'mono-white' | 'none'

export interface ProjectLink {
  kind: LinkKind
  href: string
  label?: string
}

export interface ProjectMedia {
  kind: 'image' | 'video'
  src: string
  poster?: string
  alt: string
  /** 'plain' shows the image as-is (plots, diagrams) instead of in a browser frame. */
  frame?: 'browser' | 'plain'
  /** Text shown in the mock browser address bar. */
  url?: string
  cropTop?: number | string
  cropBottom?: number | string
  cropLeft?: number | string
  cropRight?: number | string
  caption?: string
}

export interface ProjectLogo {
  marks: { src: string; alt: string }[]
  /** Renders a "×" between marks (e.g. HRT × Partcl). */
  joiner?: boolean
  filter: LogoFilter
  height: { card: number; grid: number; hero: number }
  opacity?: number
  blend?: 'screen' | 'normal'
}

export interface Project {
  slug: string
  title: string
  tagline: string
  /** ≤160 characters; meta description and grid context. */
  summary: string
  /** Longer copy for the homepage stack card. */
  cardDescription?: string
  type: ProjectType
  event?: { name: string; url?: string }
  teamSize?: number
  role: string
  /** 'YYYY-MM' */
  start: string
  end?: string
  domains: ProjectDomain[]
  tech: string[]
  links: ProjectLink[]
  media: ProjectMedia[]
  logo?: ProjectLogo
  /** bgPosition is a CSS object-position, for images whose subject isn't centered. */
  brand: { color: string; bgImage?: string; bgPosition?: string }
  ogImage?: string
  /** 1-based homepage order; omit to keep a project off the homepage stack. */
  featured?: number
}

export const SITE_ORIGIN = 'https://www.adiprathapa.space'

export const TYPE_LABELS: Record<ProjectType, string> = {
  startup: 'Startup',
  solo: 'Solo project',
  hackathon: 'Hackathon',
  challenge: 'Challenge entry',
  research: 'Research',
  'open-source': 'Open source',
}

export const DOMAIN_LABELS: Record<ProjectDomain, string> = {
  'graph-ml': 'Graph ML',
  'agents-llms': 'Agents & LLMs',
  devtools: 'Developer tools',
  fintech: 'Fintech',
  'chip-systems': 'Chip design',
  data: 'Data',
  'ml-systems': 'ML systems',
}

/** Icon-only marks (square-ish). */
const ORG_MARK = { card: 96, grid: 44, hero: 88 }

function whiteLogo(src: string, alt: string, height: ProjectLogo['height']): ProjectLogo {
  return { marks: [{ src, alt }], filter: 'white', height, opacity: 0.9, blend: 'normal' }
}

/** Logos pre-rendered in white and gray that keep their own shading. */
function shadedLogo(src: string, alt: string, height: ProjectLogo['height']): ProjectLogo {
  return { marks: [{ src, alt }], filter: 'none', height, opacity: 0.95, blend: 'normal' }
}

function prsSearch(org: string) {
  return `https://github.com/search?q=is%3Apr+author%3Aadiprathapa+org%3A${org}&type=pullrequests`
}

export const projects: Project[] = [
  {
    slug: 'apature',
    title: 'Apature',
    tagline: 'VLM design review that checks judgment, not pixels',
    summary: 'My design tooling startup: six open source repos for grounded VLM design review, sandboxed PR review, LLM eval error bars, and MCP.',
    cardDescription: "My design tooling startup. Verdict, the core product, is a grounded VLM design reviewer: it captures a running web UI with deterministic headless Chromium, critiques it against the repo's own design system, and deletes every finding it cannot point at a captured element. Sigil, its open source companion library, puts error bars on LLM-as-judge evals.",
    type: 'startup',
    role: 'Founder',
    start: '2026-06',
    end: 'present',
    domains: ['agents-llms', 'devtools'],
    tech: ['TypeScript', 'Playwright', 'Rust', 'PostgreSQL', 'MCP', 'VLM', 'Conformal Prediction'],
    links: [
      { kind: 'repo', href: 'https://github.com/apatureai/verdict', label: 'Verdict repository' },
      { kind: 'repo', href: 'https://github.com/apatureai', label: 'apatureai on GitHub' },
      { kind: 'marketplace', href: 'https://github.com/marketplace/actions/apature-gate', label: 'Gate on GitHub Marketplace' },
    ],
    media: [
      { kind: 'image', src: '/verdict-hero.webp', alt: 'Verdict measuring a running page from the terminal', url: 'github.com/apatureai/verdict' },
    ],
    logo: {
      // Pre-rendered white version that keeps each facet's relative shading.
      marks: [{ src: '/logo-apature-white.png', alt: 'Apature' }],
      filter: 'shadow',
      height: { card: 128, grid: 56, hero: 112 },
      opacity: 0.95,
      blend: 'normal',
    },
    brand: { color: '#232B66', bgImage: '/verdictbg.webp' },
    featured: 1,
  },
  {
    slug: 'macroplace',
    title: 'Macro Placement',
    tagline: 'GNN + electrostatic hybrid macro placer for the Partcl x HRT challenge',
    summary: 'A hybrid GNN and electrostatic macro placer for the Partcl x HRT Macro Placement Challenge, evaluated on 17 IBM benchmarks with zero overlaps.',
    cardDescription: 'Built a hybrid GNN + electrostatic macro placer for the Partcl x HRT chip design challenge. GNN initialization on the netlist graph, ePlace style FFT density optimization, then density equalization and congestion aware coordinate descent refinement. Evaluated on 17 IBM benchmarks with zero overlaps.',
    type: 'challenge',
    event: { name: 'Partcl x HRT Macro Placement Challenge 2026', url: 'https://github.com/partcleda/macro-place-challenge-2026' },
    role: 'Solo entrant',
    start: '2026-04',
    end: '2026-05',
    domains: ['graph-ml', 'chip-systems'],
    tech: ['PyTorch', 'GNN', 'NumPy', 'FFT', 'Python'],
    links: [
      { kind: 'repo', href: 'https://github.com/adiprathapa/macro-place-challenge-2026/tree/main/submissions/gnn_placer', label: 'Submission code' },
      { kind: 'repo', href: 'https://github.com/partcleda/macro-place-challenge-2026', label: 'Challenge repository' },
    ],
    media: [
      { kind: 'image', src: '/macroplace-poster.webp', alt: 'Macro placement result on an IBM benchmark', url: 'github.com/adiprathapa/macro-place-challenge-2026' },
    ],
    logo: {
      // White knockout versions of the HRT and Partcl marks (letters transparent).
      marks: [
        { src: '/logo-hrt-white.png', alt: 'HRT' },
        { src: '/logo-partcl-white.png', alt: 'Partcl' },
      ],
      joiner: true,
      filter: 'white',
      height: { card: 80, grid: 36, hero: 64 },
      opacity: 0.9,
      blend: 'normal',
    },
    brand: { color: '#1a1a2e', bgImage: '/macroplace-bg.webp' },
    featured: 2,
  },
  {
    slug: 'hexmend',
    title: 'Hexmend',
    tagline: 'An agent gym where humans decide what matters and agents prove the smallest repair',
    summary: 'A WebMCP agent evaluation environment disguised as a spell game: 7 tools, 96 deterministic tasks, and a 23 point rubric for safe, intent-preserving repair.',
    cardDescription: 'Built an agent evaluation environment disguised as a graph native spell game. Seven WebMCP tools let an agent inspect, simulate, diagnose, and patch a typed spell graph while preserving the constraints a human sets, and a 23 point rubric scores every step across 96 deterministic tasks with exportable trajectories.',
    type: 'solo',
    event: { name: 'The WebMCP Challenge', url: 'https://webmcp.devpost.com/' },
    role: 'Solo builder',
    start: '2026-08',
    end: '2026-09',
    domains: ['agents-llms', 'graph-ml', 'devtools'],
    tech: ['TypeScript', 'React', 'WebMCP', 'MCP', 'Cloudflare Workers', 'Python'],
    links: [
      { kind: 'repo', href: 'https://github.com/adiprathapa/hexmend' },
      { kind: 'live', href: 'https://hexmend.hex-machina.workers.dev', label: 'Play Hexmend' },
      { kind: 'video', href: 'https://youtu.be/ZMxs1HrpS1s', label: 'Watch the demo' },
    ],
    media: [
      { kind: 'image', src: '/hexmend-poster.webp', alt: 'Hexmend after a verified repair: the spell graph is stable and the moonflower blooms', url: 'hexmend.hex-machina.workers.dev' },
    ],
    logo: {
      marks: [{ src: '/logo-hexmend.png', alt: 'Hexmend' }],
      filter: 'white-shadow',
      height: { card: 152, grid: 60, hero: 120 },
      opacity: 0.95,
      blend: 'normal',
    },
    brand: { color: '#0B0D12', bgImage: '/hexmend-bg.webp' },
    featured: 3,
  },
  {
    slug: 'tauron',
    title: 'Tauron',
    tagline: 'Predicting livestock disease 48 hours before symptoms appear',
    summary: 'GRU and GraphSAGE early warning for dairy herd disease with 48 hour risk forecasts and fast gradient explanations, built at the Cornell Digital Ag Hackathon.',
    cardDescription: 'Trained a GRU and GraphSAGE model over a synthetic 60 cow contact graph encoding 9 sensor features to predict mastitis, bovine respiratory disease, and lameness risk 48 hours ahead. Built gradient based feature attribution reducing per cow explanation latency by 40x.',
    type: 'hackathon',
    event: { name: 'Cornell Digital Ag Hackathon 2026' },
    teamSize: 6,
    role: 'Built the ML pipeline and trained the model',
    start: '2026-02',
    end: '2026-03',
    domains: ['graph-ml', 'data'],
    tech: ['PyTorch', 'PyTorch Geometric', 'FastAPI', 'React', 'D3.js', 'Ollama', 'NetworkX'],
    links: [
      { kind: 'repo', href: 'https://github.com/adiprathapa/Tauron' },
      { kind: 'live', href: 'https://adiprathapa.github.io/Tauron/' },
      { kind: 'slides', href: 'https://adiprathapa.github.io/Tauron/reveal_slides' },
    ],
    media: [
      { kind: 'video', src: '/tauron.mp4', poster: '/tauron-poster.webp', alt: 'Tauron herd dashboard demo', url: 'adiprathapa.github.io/Tauron', cropTop: 25 },
    ],
    logo: whiteLogo('/logo-tauron.png', 'Tauron', { card: 56, grid: 36, hero: 72 }),
    brand: { color: '#4C867A', bgImage: '/tauronbg.webp' },
  },
  {
    slug: 'helicity',
    title: 'Helicity',
    tagline: 'AI powered liquidity stress scoring with verifiable audit trails',
    summary: 'Liquidity stress scoring for stablecoin reserves with a NetworkX knowledge graph, a Claude and Gemini LLM jury, and IPFS-pinned audit trails.',
    cardDescription: 'Built a composite liquidity stress scoring engine over a NetworkX knowledge graph linking stablecoins, banks, and jurisdictions. Set up a multi-model LLM jury using Claude and Gemini for consensus causal narratives, with scores pinned to IPFS for verifiable audit trails.',
    type: 'hackathon',
    event: { name: 'Cornell AI Hackathon 2026, Programmable Capital track' },
    teamSize: 6,
    role: 'Backtesting, IPFS audit trail, dashboard UI, and slides',
    start: '2026-03',
    end: '2026-03',
    domains: ['fintech', 'agents-llms', 'data'],
    tech: ['FastAPI', 'NetworkX', 'React', 'TypeScript', 'Claude API', 'Gemini API', 'IPFS', 'MCP'],
    links: [
      { kind: 'repo', href: 'https://github.com/AI-HackathonNYC/helicity' },
      { kind: 'live', href: 'https://helicity-theta.vercel.app' },
      { kind: 'slides', href: 'https://ai-hackathonnyc.github.io/helicity/', label: 'Pitch slides' },
    ],
    media: [
      { kind: 'video', src: '/helicity.mp4', poster: '/helicity-poster.webp', alt: 'Helicity risk dashboard demo', url: 'helicity-theta.vercel.app' },
    ],
    logo: whiteLogo('/logo-helicity-icon.png', 'Helicity', ORG_MARK),
    brand: { color: '#6366F1', bgImage: '/helicitybg.webp' },
  },
  {
    slug: 'zam',
    title: 'ZAM',
    tagline: 'Market sizing for founders, with TAM, SAM, and SOM grounded in retrieved benchmarks',
    summary: 'A solo-built market sizing tool: a four step wizard for TAM, SAM, and SOM plus an AI analysis grounded with BM25 retrieval and Groq.',
    type: 'solo',
    role: 'Solo builder',
    start: '2025-12',
    end: '2026-06',
    domains: ['agents-llms', 'data'],
    tech: ['React', 'Vite', 'Express', 'MongoDB', 'Groq', 'BM25', 'Vercel'],
    links: [
      { kind: 'repo', href: 'https://github.com/adiprathapa/ZAM' },
      { kind: 'live', href: 'https://zam-nu.vercel.app' },
    ],
    media: [
      { kind: 'video', src: '/zam-copy.mp4', poster: '/zam-copy-poster.webp', alt: 'ZAM market sizing wizard demo', url: 'zam-nu.vercel.app', cropTop: 110, cropBottom: 30, cropLeft: 270, cropRight: 272 },
    ],
    logo: whiteLogo('/logo-zamsizing.png', 'ZAM', { card: 56, grid: 32, hero: 64 }),
    brand: { color: '#E8740C', bgImage: '/zamsizingbg.webp' },
  },
  {
    slug: 'spectre',
    title: 'Spectre',
    tagline: 'Real-time phone camera boxing with a live PixiJS spectator overlay',
    summary: 'A real-time 1v1 boxing game driven by phone camera pose estimation. I built the React and PixiJS spectator overlay in a team of 4.',
    type: 'hackathon',
    event: { name: 'Cornell Claude Builders Club Hackathon, spring 2026' },
    teamSize: 4,
    role: 'Built the spectator overlay',
    start: '2026-04',
    end: '2026-04',
    domains: ['ml-systems'],
    tech: ['React', 'TypeScript', 'PixiJS', 'Vite', 'WebSockets', 'Web Audio'],
    links: [
      { kind: 'repo', href: 'https://github.com/cx18121/spectre' },
      { kind: 'video', href: 'https://www.youtube.com/watch?v=Afx3NxmBlJA', label: 'Watch the demo' },
    ],
    media: [
      { kind: 'image', src: '/spectre-overlay.webp', alt: 'The Spectre spectator overlay mid-round: health bars, round timer, and both fighters as glowing silhouettes', url: 'youtube.com/watch?v=Afx3NxmBlJA' },
    ],
    logo: whiteLogo('/logo-claude-icon.png', 'Claude Builders Club', ORG_MARK),
    brand: { color: '#DA7756', bgImage: '/pexels-dichupdi-35168139.webp' },
  },
  {
    slug: 'palate',
    title: 'Palate',
    tagline: 'A trip planner where every stop cites something you actually did',
    summary: 'Builds an evidence-backed taste profile from reservations, calendars, and saved lists, then plans trips around it. Overnight hackathon, team of 3.',
    type: 'hackathon',
    event: { name: 'Corgi × Merge × Photon overnight hackathon' },
    teamSize: 3,
    role: 'PRD, technical design, profile module, and integration',
    start: '2026-07',
    end: '2026-07',
    domains: ['agents-llms', 'data'],
    tech: ['Python', 'SQLite', 'Gmail API', 'Google Calendar API', 'Google Places API', 'Merge'],
    links: [
      { kind: 'repo', href: 'https://github.com/KeyaanMatrix/Palate-Corgi' },
    ],
    media: [
      { kind: 'image', src: '/palate-demo-frame.webp', alt: 'Palate demo: an itinerary where each stop cites your own dining history', url: 'github.com/KeyaanMatrix/Palate-Corgi' },
    ],
    logo: whiteLogo('/logo-palate-p.png', 'Palate', ORG_MARK),
    brand: { color: '#1A120D', bgImage: '/palate-bg.webp' },
  },
  {
    slug: 'paramgolf',
    title: 'Parameter Golf',
    tagline: 'A budget reproduction of an SP4096 Parameter Golf record under the 16 MB cap',
    summary: 'Reproduced an SP4096 record on one H100, added an artifact fit guard, and reached 1.10743 val bpb with QK_GAIN_INIT=4.5. Non-record reproduction.',
    type: 'challenge',
    event: { name: 'OpenAI Parameter Golf', url: 'https://github.com/openai/parameter-golf' },
    role: 'Reproduction and experiments',
    start: '2026-05',
    end: '2026-05',
    domains: ['ml-systems'],
    tech: ['Python', 'PyTorch', 'FlashAttention 3', 'torchrun', 'NVIDIA H100', 'RunPod'],
    links: [
      { kind: 'repo', href: 'https://github.com/adiprathapa/parameter-golf/tree/codex/sp4096-qk45-budget/records/track_non_record_16mb/2026-05-07_sp4096_budget_repro', label: 'Record folder' },
      { kind: 'prs', href: 'https://github.com/openai/parameter-golf/pull/2161', label: 'PR #2161 (open)' },
    ],
    media: [],
    logo: whiteLogo('/logo-openai-icon.png', 'OpenAI', ORG_MARK),
    brand: { color: '#0E1F1B', bgImage: '/pexels-andrewshelley-8454632.webp' },
  },
  {
    slug: 'galatea',
    title: 'Galatea',
    tagline: 'On-chain risk triage prototype with graph-based scoring and case management',
    summary: 'A Palantir FDSE challenge prototype: synthetic on-chain data, NetworkX risk scoring, and a triage app with case management for risk analysts.',
    type: 'challenge',
    event: { name: 'Palantir FDSE technical challenge' },
    role: 'Solo builder',
    start: '2026-03',
    end: '2026-03',
    domains: ['fintech', 'data'],
    tech: ['Python', 'NetworkX', 'JavaScript', 'HTML', 'CSS'],
    links: [
      { kind: 'repo', href: 'https://github.com/adiprathapa/galatea' },
    ],
    media: [
      { kind: 'image', src: '/recording-1-poster.webp', alt: 'Galatea risk triage prototype', url: 'github.com/adiprathapa/galatea' },
    ],
    logo: whiteLogo('/logo-palantir-icon.png', 'Palantir', ORG_MARK),
    brand: { color: '#2c2c2c', bgImage: '/galateabg.webp' },
  },
  {
    slug: 'off-data-quality',
    title: 'Open Food Facts data quality',
    tagline: "Porting Open Food Facts' Perl data quality checks to tested Python and DuckDB",
    summary: 'GSoC 2026 proposal prototype that ports five Open Food Facts Perl data quality checks to Python and DuckDB, with parity tests on real products.',
    type: 'research',
    event: { name: 'Google Summer of Code 2026 proposal (Open Food Facts)' },
    role: 'Solo builder',
    start: '2026-03',
    end: '2026-03',
    domains: ['data'],
    tech: ['Python', 'DuckDB', 'pytest', 'Poetry'],
    links: [
      { kind: 'repo', href: 'https://github.com/adiprathapa/OFFDataQualityMonitoring' },
      { kind: 'prs', href: 'https://github.com/openfoodfacts/robotoff/pull/1878', label: 'Robotoff PR #1878 (open)' },
    ],
    media: [],
    logo: whiteLogo('/logo-off-icon.png', 'Open Food Facts', ORG_MARK),
    brand: { color: '#3D2412', bgImage: '/off-bg.webp' },
  },
  {
    slug: 'graph-attention',
    title: 'Graph Attention Networks',
    tagline: 'Reproducing Graph Attention Networks for node classification on Cora',
    summary: 'A PyTorch Geometric reproduction of Graph Attention Networks on the Cora citation dataset, reaching about 80% test accuracy versus 83% in the paper.',
    type: 'research',
    role: 'Solo',
    start: '2026-02',
    end: '2026-02',
    domains: ['graph-ml'],
    tech: ['Python', 'PyTorch', 'PyTorch Geometric', 'Jupyter', 'scikit-learn'],
    links: [
      { kind: 'repo', href: 'https://github.com/adiprathapa/graph-attention-networks' },
    ],
    media: [
      { kind: 'image', frame: 'plain', src: '/gat-training-curves.webp', alt: 'Training loss and accuracy curves for the GAT model', caption: 'Training curves over 200 epochs.' },
      { kind: 'image', frame: 'plain', src: '/gat-tsne.webp', alt: 't-SNE plot of learned node embeddings colored by class', caption: 't-SNE of the learned node embeddings, colored by paper topic.' },
    ],
    logo: whiteLogo('/logo-pyg-icon.png', 'PyTorch Geometric', ORG_MARK),
    brand: { color: '#1E293B', bgImage: '/gat-graph-bg.webp' },
  },
  {
    slug: 'openzim',
    title: 'Kiwix / openZIM',
    tagline: 'Dark mode, translation checks, and UI fixes for the freeCodeCamp offliner',
    summary: "Four merged pull requests and one open in openZIM's freeCodeCamp offliner, including a dark theme and build-time translation validation.",
    type: 'open-source',
    role: 'Contributor',
    start: '2026-03',
    end: 'present',
    domains: ['devtools'],
    tech: ['Vue', 'TypeScript', 'CSS', 'Python'],
    links: [{ kind: 'prs', href: prsSearch('openzim'), label: 'All openZIM PRs' }],
    media: [],
    logo: whiteLogo('/oss-logo-kiwix.webp', 'Kiwix', ORG_MARK),
    brand: { color: '#12324A', bgImage: '/openzim-bg.webp' },
  },
  {
    slug: 'kubeflow',
    title: 'Kubeflow',
    tagline: 'MPI environment validation in Kubeflow Trainer and fixes to the Python SDK',
    summary: 'One merged Kubeflow Trainer pull request validating reserved MPI environment variables, plus two open Kubeflow SDK fixes.',
    type: 'open-source',
    role: 'Contributor',
    start: '2026-05',
    end: 'present',
    domains: ['ml-systems', 'devtools'],
    tech: ['Go', 'Python', 'Kubernetes', 'MPI'],
    links: [{ kind: 'prs', href: prsSearch('kubeflow'), label: 'All Kubeflow PRs' }],
    media: [],
    logo: whiteLogo('/oss-logo-kubeflow.webp', 'Kubeflow', ORG_MARK),
    brand: { color: '#1B3A6B', bgImage: '/kubeflow-bg.webp' },
  },
  {
    slug: 'jenkins',
    title: 'Jenkins',
    tagline: 'A new Plugin Manager CLI option, chatbot export tests, and credential ID checks',
    summary: 'A merged Plugin Manager CLI option for custom update center downloads, plus open chatbot plugin tests (approved) and credential ID validation.',
    type: 'open-source',
    role: 'Contributor',
    start: '2026-05',
    end: 'present',
    domains: ['devtools'],
    tech: ['Java', 'TypeScript', 'JSDOM', 'Jenkins'],
    links: [{ kind: 'prs', href: prsSearch('jenkinsci'), label: 'All Jenkins PRs' }],
    media: [],
    logo: shadedLogo('/logo-jenkins-shaded.png', 'Jenkins', ORG_MARK),
    brand: { color: '#335061', bgImage: '/jenkins-bg.webp' },
  },
  {
    slug: 'cockroachdb',
    title: 'CockroachDB',
    tagline: "Postgres-matching error messages in CockroachDB's jsonpath scanner",
    summary: 'An approved CockroachDB pull request that makes jsonpath trailing junk errors for digit-leading keys match Postgres diagnostics.',
    type: 'open-source',
    role: 'Contributor',
    start: '2026-08',
    end: 'present',
    domains: ['data'],
    tech: ['Go', 'SQL', 'PostgreSQL', 'jsonpath'],
    links: [{ kind: 'prs', href: 'https://github.com/cockroachdb/cockroach/pull/173453', label: 'PR #173453 (open, approved)' }],
    media: [],
    logo: whiteLogo('/oss-logo-cockroachdb.webp', 'CockroachDB', ORG_MARK),
    brand: { color: '#190F33', bgImage: '/cockroachdb-bg.webp' },
  },
  {
    slug: 'ccextractor',
    title: 'CCExtractor',
    tagline: 'Jest test suites for the CCSync Tasks frontend',
    summary: 'Two merged CCExtractor CCSync pull requests adding Jest tests for multi-select utilities and the Reports toggle in the Tasks view.',
    type: 'open-source',
    role: 'Contributor',
    start: '2026-03',
    end: '2026-05',
    domains: ['devtools'],
    tech: ['TypeScript', 'Jest', 'React', 'Testing'],
    links: [{ kind: 'prs', href: prsSearch('CCExtractor'), label: 'All CCExtractor PRs' }],
    media: [],
    logo: shadedLogo('/logo-ccextractor-shaded.png', 'CCExtractor', ORG_MARK),
    brand: { color: '#1F3A4D', bgImage: '/ccextractor-bg.webp' },
  },
]

export const featuredProjects = projects
  .filter((p) => p.featured != null)
  .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0))

export function projectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug)
}

export function repoLink(project: Project) {
  return project.links.find((l) => l.kind === 'repo') ?? project.links.find((l) => l.kind === 'live')
}

export function projectPath(slug: string) {
  return `/projects/${slug}/`
}
