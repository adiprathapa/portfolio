export interface PhotoCard {
  id: string
  image: string
  caption: string
  /** Starting tilt in the shuffled stack. */
  rotation: number
  bgSize?: string
  bgPosition?: string
  /** Puts the blue wash in the top-left rather than across the diagonal. */
  topLeftBlue?: boolean
}

export const photoCards: PhotoCard[] = [
  { id: 'card-1', image: '/img3.webp', caption: 'Cornell Data & Strategy Meeting', rotation: -8 },
  { id: 'card-2', image: '/team-presentation.webp', caption: 'Stablecoin Presentation at Cornell Hackathon', rotation: -3 },
  { id: 'card-3', image: '/img3-stack.webp', caption: 'Formal Organizing Group', rotation: 2 },
  { id: 'card-6', image: '/treman-hiking.webp', caption: 'Hiking in Robert H. Treman State Park', rotation: 6, topLeftBlue: true },
  { id: 'card-4', image: '/card-3.webp', caption: 'Eagle Scout Project', rotation: -5 },
  { id: 'card-5', image: '/coh.webp', caption: 'After Eagle Scout Board of Review', rotation: 4, bgSize: '180%', bgPosition: 'center center' },
]
