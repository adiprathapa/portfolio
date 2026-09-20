export interface ExperienceItem {
  id: string
  company: string
  role: string
  duration: string
  description: string
  tech: { name: string; icon: string }[]
  logo: string
  logoHeight: number
  /** Knock the mark out to white over the branded gradient. */
  logoInvert?: boolean
  logoOffsetY?: number
  logoOffsetX?: number
  bgImage: string
  gradientColor: string
}

export const work: ExperienceItem[] = [
  {
    id: 'mitre',
    company: 'MITRE',
    role: 'Data Science Intern',
    duration: 'May — August 2026',
    description: 'Graph learning on cyber event data with PyTorch Geometric',
    tech: [
      { name: 'PyTorch Geometric', icon: '/icons/pytorch.svg' },
      { name: 'Optuna', icon: '' },
    ],
    logo: '/mitre.png',
    logoHeight: 91,
    logoInvert: true,
    logoOffsetY: -25,
    bgImage: '/pexels-pinamon-17647329.webp',
    gradientColor: '#0671A4',
  },
  {
    id: 'cornell',
    company: 'Cornell Bowers CIS',
    role: 'CSMore Intern',
    duration: 'January 2026',
    description: 'Implemented modular class designs, data structures, and algorithms',
    tech: [
      { name: 'Java', icon: '/icons/openjdk.svg' },
      { name: 'JUnit', icon: '/icons/junit5.svg' },
    ],
    logo: '/cornell.svg',
    logoHeight: 44,
    logoInvert: true,
    bgImage: '/bowers.webp',
    gradientColor: '#B31B1B',
  },
  {
    id: 'mines',
    company: 'Colorado School of Mines',
    role: 'Software Engineering Intern',
    duration: 'June — July 2024',
    description: 'Built an AI chatbot and tools to improve access to cybersecurity resources',
    tech: [
      { name: 'OpenAI API', icon: '/icons/chatbot.svg' },
      { name: 'JavaScript', icon: '/icons/javascript.svg' },
    ],
    logo: '/mines.png',
    logoHeight: 44,
    logoInvert: true,
    logoOffsetY: 0,
    bgImage: '/mines-bg.webp',
    gradientColor: '#21314D',
  },
  {
    id: 'neb',
    company: 'University of Nebraska–Lincoln',
    role: 'Physics Research Assistant',
    duration: 'June — August 2023',
    description: 'Data visualization through 3D printing for Bohmian trajectories',
    tech: [
      { name: 'scikit-learn', icon: '/icons/scikitlearn.svg' },
      { name: 'Python', icon: '/icons/python.svg' },
    ],
    logo: '/neb.png',
    logoHeight: 42,
    logoInvert: true,
    logoOffsetY: -1,
    logoOffsetX: -12,
    bgImage: '/unl-bg.webp',
    gradientColor: '#D00000',
  },
]

export const involvement: ExperienceItem[] = [
  {
    id: 'cds',
    company: 'Cornell Data & Strategy',
    role: 'Technology Implementation Associate',
    duration: 'September 2025 — Present',
    description: 'Delivering data prediction and visualization tools to clients',
    tech: [
      { name: 'Redis', icon: '/icons/redis.svg' },
      { name: 'PostgreSQL', icon: '/icons/postgresql.svg' },
    ],
    logo: '/logodsa.png',
    logoHeight: 79,
    logoInvert: true,
    logoOffsetY: -16,
    bgImage: '/cornell-data-strategy.webp',
    gradientColor: '#1C3D6B',
  },
  {
    id: 'c2s2',
    company: 'Cornell Custom Silicon Systems',
    role: 'Operations Engineer',
    duration: 'November 2025 — Present',
    description: 'Migrated the team site to React and deploy web apps to Apache for a student led chip tapeout team',
    tech: [
      { name: 'React', icon: '/icons/react.svg' },
      { name: 'Apache HTTP Server', icon: '/icons/apache.svg' },
    ],
    logo: '/c2s2logo.png',
    logoHeight: 72,
    logoInvert: true,
    logoOffsetY: -6,
    logoOffsetX: -4,
    bgImage: '/c2s2.webp',
    gradientColor: '#B31B1B',
  },
  {
    id: 'ambassador',
    company: 'Cornell Arts & Sciences',
    role: 'Ambassador',
    duration: 'Fall 2025 — Present',
    description: 'Representing the College of Arts & Sciences to prospective students and families',
    tech: [],
    logo: '/aslogo.png',
    logoHeight: 91,
    logoInvert: true,
    logoOffsetX: -8,
    logoOffsetY: -14,
    bgImage: '/cas.webp',
    gradientColor: '#6B1D2A',
  },
]

export const experienceEntries = [...work, ...involvement]
export type ExperienceTab = 'work' | 'involvement'
