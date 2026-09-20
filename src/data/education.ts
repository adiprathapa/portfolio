export type EducationId = 'cornell' | 'highschool'

export interface EducationItem {
  id: EducationId
  school: string
  degree: string
  /** Location, shown next to the school name. */
  location: string
  description: string
  bullets: string[]
  /** Section blurb shown while this entry is selected. */
  summary: string
  bgImage: string
  color: string
}

export const education: EducationItem[] = [
  {
    id: 'cornell',
    school: 'Cornell University',
    degree: 'B.A. Computer Science',
    location: 'Ithaca, NY',
    description: 'College of Arts and Sciences and Ann S. Bowers College of Computing and Information Science, minor in Artificial Intelligence.',
    bullets: [
      'Data Structures, Object-Oriented Programming, Theory of Computation, Discrete Math, Python Design and Development, Calculus 1, Calculus 2, Linear Algebra for Engineers',
    ],
    summary: 'Pursuing a B.A. in Computer Science with a minor in AI at Cornell University.',
    bgImage: '/nell.webp',
    color: '#B31B1B',
  },
  {
    id: 'highschool',
    school: 'Millard North High School',
    degree: 'International Baccalaureate Diploma',
    location: 'Omaha, NE',
    description: 'Math Higher Level, Biology Higher Level, English Higher Level, Psychology Standard Level, Spanish Standard Level, Music Standard Level.',
    bullets: [
      'AP Spanish, AP Human Geography, AP World History, AP Physics, AP Computer Science Principles',
      'National Honor Society, Spanish Honor Society, Varsity Marching Band, Speech, Mustang Mentoring',
    ],
    summary: 'Earned my International Baccalaureate Diploma at Millard North High School.',
    bgImage: '/mnhs.webp',
    color: '#004d2c',
  },
]
