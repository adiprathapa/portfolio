// One catalog behind every tech listing on the site: the About marquee cards,
// the matching game deck, and the accent colors both use on hover.

export interface TechItem {
  name: string
  /** Monochrome mark tinted to the brand blue. */
  icon: string
  url: string
  blurb?: string
  /** 'major' items get their own tall marquee card. */
  tier: 'major' | 'minor'
  /** Shorter label where space is tight (matching game cards). */
  shortName?: string
  /** Marquee hover swap; defaults to the full-color mark. */
  hoverIcon?: string
  /** Full-color mark; defaults to `icon` with the brand-blue suffix dropped. */
  colorIcon?: string
  /** Drawn as a tinted CSS mask rather than an image swap. */
  maskTinted?: boolean
  /** Hover accent; defaults to the color registered for the mark's slug. */
  accent?: string
  /** Marks whose aspect ratio reads badly when promoted to a tall card. */
  neverTall?: boolean
}

const ACCENT_BY_SLUG: Record<string, string> = {
  react: '#61DAFB',
  python: '#3776AB',
  typescript: '#3178C6',
  pytorch: '#EE4C2C',
  nodedotjs: '#5FA04E',
  openjdk: '#111111',
  google: '#4285F4',
  vuedotjs: '#42B883',
  javascript: '#F7DF1E',
  fastapi: '#009688',
  confluence: '#4C9AFF',
  git: '#F05032',
  github: '#181717',
  pandas: '#150458',
  numpy: '#013243',
  mongodb: '#47A248',
  postgresql: '#4169E1',
  d3: '#F9A03C',
  codemirror: '#D30707',
  yaml: '#CB171E',
  scikitlearn: '#F7931E',
  express: '#000000',
  vercel: '#000000',
  tensorflow: '#FF6F00',
  githubactions: '#2088FF',
  ipfs: '#65C2CB',
  anthropic: '#111111',
  googlegemini: '#8E75B8',
  mistralai: '#FF7000',
  leaflet: '#199900',
  ollama: '#000000',
  palantir: '#101820',
  posthog: '#F9BD2B',
  clerk: '#6C47FF',
  pinia: '#FFD859',
  supabase: '#3ECF8E',
  redis: '#DC382D',
  docker: '#2496ED',
  html5: '#E34F26',
  css: '#6E43B8',
  css3: '#6E43B8',
  flask: '#3BABC3',
  plotly: '#7A76FF',
  apache: '#D22128',
  huggingface: '#FFD21E',
  nvidia: '#76B900',
  mediapipe: '#0097A7',
  elevenlabs: '#000000',
}

/** Marquee card icon box, in px, for marks that need to break the default. */
export const ICON_SIZE_OVERRIDES: Record<string, { small: number; tall: number }> = {
  'Apache HTTP Server': { small: 40, tall: 52 },
  YAML: { small: 24, tall: 30 },
}

export const DEFAULT_ICON_SIZE = { small: 32, tall: 40 }

export const tech: TechItem[] = [
  { tier: 'major', name: 'React', icon: '/icons/react-0671A4.svg', url: 'https://react.dev', blurb: 'Built interactive UIs for data visualization web applications' },
  { tier: 'major', name: 'Python', icon: '/icons/python-0671A4.svg', url: 'https://python.org', blurb: 'Trained ML models and shipped backend APIs for data insights' },
  { tier: 'major', name: 'TypeScript', icon: '/icons/typescript-0671A4.svg', url: 'https://typescriptlang.org', blurb: 'Architected type safe frontends for clients' },
  { tier: 'major', name: 'PyTorch', icon: '/icons/pytorch-0671A4.svg', url: 'https://pytorch.org', blurb: 'Trained GRU and GraphSAGE models for complex data analysis' },
  { tier: 'major', name: 'Node.js', icon: '/icons/nodedotjs-0671A4.svg', url: 'https://nodejs.org', blurb: 'Deployed full stack apps and REST APIs for client projects' },
  { tier: 'major', name: 'Java', icon: '/icons/openjdk-0671A4.svg', url: 'https://dev.java', blurb: 'Engineered backend systems and data structures' },
  { tier: 'major', name: 'NetworkX', icon: '/networkx.png', url: 'https://networkx.org', blurb: 'Constructed knowledge graphs and contact networks to detect anomalies', maskTinted: true, accent: '#2B7BBB' },
  { tier: 'major', name: 'Google ADK', icon: '/icons/google-0671A4.svg', url: 'https://google.github.io/adk-docs/', blurb: 'Orchestrated sequential multi agent workflows' },
  { tier: 'major', name: 'Confluence', icon: '/icons/confluence-0671A4.svg', hoverIcon: '/icons/confluence-4C9AFF.svg', url: 'https://www.atlassian.com/software/confluence', blurb: 'Documented engineering workflows and team project plans for C2S2' },
  { tier: 'major', name: 'Apache HTTP Server', shortName: 'Apache', icon: '/icons/apache-0671A4.svg', url: 'https://httpd.apache.org', blurb: "Maintained C2S2 site on Cornell's Apache HTTP Server" },
  { tier: 'major', name: 'PostHog', icon: '/icons/posthog-0671A4.svg', hoverIcon: '/icons/posthog-F9BD2B.svg', url: 'https://posthog.com', blurb: 'This site uses PostHog for product analytics' },
  { tier: 'major', name: 'Docker', icon: '/icons/docker-0671A4.svg', url: 'https://www.docker.com', blurb: 'Containerized app services for deployable apps to clients' },
  { tier: 'major', name: 'PostgreSQL', icon: '/icons/postgresql-0671A4.svg', url: 'https://www.postgresql.org', blurb: 'Designed relational schemas and queried analytics data for client applications' },
  { tier: 'major', name: 'Ollama', icon: '/icons/ollama-0671A4.svg', url: 'https://ollama.com', blurb: 'Ran local LLM inference pipelines for XAI' },
  { tier: 'major', name: 'Hugging Face', icon: '/icons/huggingface-0671A4.svg', url: 'https://huggingface.co', blurb: 'Pulled FineWeb shards and pretrained checkpoints from the Hub for ML training pipelines' },
  { tier: 'major', name: 'CUDA', icon: '/icons/nvidia-0671A4.svg', url: 'https://developer.nvidia.com/cuda-toolkit', blurb: 'Trained transformer models on H100 GPUs with FlashAttention 3 and CUDA 13' },

  { tier: 'minor', name: 'Clerk', icon: '/icons/clerk-0671A4.svg', url: 'https://clerk.com' },
  { tier: 'minor', name: 'Vue.js', icon: '/icons/vuedotjs-0671A4.svg', url: 'https://vuejs.org' },
  { tier: 'minor', name: 'JavaScript', icon: '/icons/javascript-0671A4.svg', url: 'https://developer.mozilla.org/docs/Web/JavaScript' },
  { tier: 'minor', name: 'FastAPI', icon: '/icons/fastapi-0671A4.svg', url: 'https://fastapi.tiangolo.com' },
  { tier: 'minor', name: 'HTML5', icon: '/icons/html5-0671A4.svg', url: 'https://developer.mozilla.org/docs/Web/HTML', blurb: 'Built accessible page structure for production web interfaces' },
  { tier: 'minor', name: 'CSS3', icon: '/icons/css-0671A4.svg', url: 'https://developer.mozilla.org/docs/Web/CSS', blurb: 'Implemented responsive layouts, theming systems, and polished UI interactions' },
  { tier: 'minor', name: 'Flask', icon: '/icons/flask-0671A4.svg', url: 'https://flask.palletsprojects.com', blurb: 'Built lightweight API endpoints and backend utilities for rapid feature delivery' },
  { tier: 'minor', name: 'Git', icon: '/icons/git-0671A4.svg', url: 'https://git-scm.com', blurb: 'Managed branching, review workflows, and release ready version control' },
  { tier: 'minor', name: 'GitHub', icon: '/icons/github-0671A4.svg', url: 'https://github.com', blurb: 'Shipped collaborative code with PRs, issue tracking, and CI integrated repos' },
  { tier: 'minor', name: 'Supabase', icon: '/icons/supabase-0671A4.svg', url: 'https://supabase.com' },
  { tier: 'minor', name: 'Redis', icon: '/icons/redis-0671A4.svg', url: 'https://redis.io' },
  { tier: 'minor', name: 'pandas', icon: '/icons/pandas-0671A4.svg', url: 'https://pandas.pydata.org' },
  { tier: 'minor', name: 'NumPy', icon: '/icons/numpy-0671A4.svg', url: 'https://numpy.org' },
  { tier: 'minor', name: 'MongoDB', icon: '/icons/mongodb-0671A4.svg', url: 'https://mongodb.com' },
  { tier: 'minor', name: 'D3.js', icon: '/icons/d3-0671A4.svg', url: 'https://d3js.org' },
  { tier: 'minor', name: 'Plotly', icon: '/icons/plotly-0671A4.svg', url: 'https://plotly.com', blurb: 'Created and presented KPI metrics using Plotly visualizations' },
  { tier: 'minor', name: 'CodeMirror', icon: '/icons/codemirror-0671A4.svg', url: 'https://codemirror.net', neverTall: true },
  { tier: 'minor', name: 'YAML', icon: '/icons/yaml-0671A4.svg', url: 'https://yaml.org', blurb: 'Built CI validation and configuration workflows for large open source codebases', neverTall: true },
  { tier: 'minor', name: 'scikit-learn', icon: '/icons/scikitlearn-0671A4.svg', url: 'https://scikit-learn.org' },
  { tier: 'minor', name: 'Express', icon: '/icons/express-0671A4.svg', url: 'https://expressjs.com' },
  { tier: 'minor', name: 'Vercel', icon: '/icons/vercel-0671A4.svg', url: 'https://vercel.com' },
  { tier: 'minor', name: 'TensorFlow', icon: '/icons/tensorflow-0671A4.svg', url: 'https://tensorflow.org' },
  { tier: 'minor', name: 'GitHub Actions', icon: '/icons/githubactions-0671A4.svg', url: 'https://github.com/features/actions' },
  { tier: 'minor', name: 'IPFS', icon: '/icons/ipfs-0671A4.svg', url: 'https://ipfs.tech' },
  { tier: 'minor', name: 'Claude API', icon: '/claude.svg', url: 'https://docs.anthropic.com', maskTinted: true, accent: '#D97757' },
  { tier: 'minor', name: 'Gemini API', icon: '/icons/googlegemini-0671A4.svg', url: 'https://ai.google.dev', blurb: 'Built multi-model AI workflows and fallback orchestration for production apps' },
  { tier: 'minor', name: 'Mistral AI', icon: '/icons/mistralai-0671A4.svg', url: 'https://mistral.ai' },
  { tier: 'minor', name: 'Leaflet', icon: '/icons/leaflet-0671A4.svg', url: 'https://leafletjs.com', neverTall: true },
  { tier: 'minor', name: 'Palantir Foundry', shortName: 'Palantir', icon: '/icons/palantir-0671A4.svg', url: 'https://www.palantir.com/platforms/foundry/', blurb: 'Built an on-chain risk prototype with graph risk scoring and case management on Foundry' },
  { tier: 'minor', name: 'MediaPipe', icon: '/icons/mediapipe-0671A4.svg', url: 'https://ai.google.dev/edge/mediapipe', blurb: 'Streamed real time pose keypoints from phone cameras to a 60Hz game server for hit detection' },
  { tier: 'minor', name: 'ElevenLabs', icon: '/icons/elevenlabs-0671A4.svg', url: 'https://elevenlabs.io', blurb: 'Generated low latency AI commentary voices for live in browser game streams' },
  { tier: 'minor', name: 'Matplotlib', icon: '/matplotlib-mark.svg', colorIcon: '/matplotlib-rainbow.svg', url: 'https://matplotlib.org', blurb: 'Visualized macro placements, training metrics, and sensor signals across ML and EDA projects', maskTinted: true, accent: '#11557C' },
]

export const majorTech = tech.filter((t) => t.tier === 'major')
export const minorTech = tech.filter((t) => t.tier === 'minor')

/** Full-color mark, used by the matching game and as the default hover swap. */
export function colorIconOf(item: TechItem) {
  return item.colorIcon ?? item.icon.replace('-0671A4.svg', '.svg')
}

/** Mark shown while the marquee card is hovered. */
export function hoverIconOf(item: TechItem) {
  return item.hoverIcon ?? colorIconOf(item)
}

export function accentOf(item: TechItem) {
  if (item.accent) return item.accent
  const slug = item.icon.match(/\/icons\/([^/.-]+)/)?.[1]
  return (slug && ACCENT_BY_SLUG[slug]) ?? '#0671A4'
}

export function iconSizeOf(item: TechItem, variant: 'small' | 'tall') {
  return (ICON_SIZE_OVERRIDES[item.name] ?? DEFAULT_ICON_SIZE)[variant]
}
