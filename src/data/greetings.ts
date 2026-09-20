export interface GreetingIcon {
  src: string
  link: string
  height?: number
  /** Extra left margin, in px, for marks that sit too close to the text. */
  ml?: number
}

export interface Greeting {
  text: string
  /** `text` split so each word can be highlighted on hover. */
  segments: string[]
  subtitle: string
  breakdown: { phonetic: string; meaning: string }[]
  icons?: GreetingIcon[]
}

const DUOLINGO: GreetingIcon = { src: '/duo.png', link: 'https://www.duolingo.com/profile/adiP001', height: 32 }

export const greetings: Greeting[] = [
  {
    text: "Hey, I'm Adi",
    segments: ['Hey, ', "I'm ", 'Adi'],
    subtitle: 'English (Fluent)',
    breakdown: [
      { phonetic: 'Hey', meaning: 'Hello' },
      { phonetic: "I'm", meaning: 'I am' },
      { phonetic: 'Adi', meaning: 'Adi' },
    ],
  },
  {
    text: 'Hola, soy Adi',
    segments: ['Hola, ', 'soy ', 'Adi'],
    subtitle: 'Spanish (Conversational)',
    icons: [
      DUOLINGO,
      { src: '/nde.png', link: 'https://www.education.ne.gov/press_release/nebraska-students-awarded-seals-of-biliteracy-11/', height: 33 },
    ],
    breakdown: [
      { phonetic: 'Hola', meaning: 'Hello' },
      { phonetic: 'Soy', meaning: 'I am' },
      { phonetic: 'Adi', meaning: 'Adi' },
    ],
  },
  {
    text: 'नमस्ते, मैं आदि हूँ',
    segments: ['नमस्ते, ', 'मैं ', 'आदि ', 'हूँ'],
    subtitle: 'Hindi (Conversational)',
    icons: [
      DUOLINGO,
      { src: '/cornell.png', link: 'https://courses.cornell.edu/courses/hindi/', height: 26, ml: 1 },
    ],
    breakdown: [
      { phonetic: 'Namaste', meaning: 'Hello' },
      { phonetic: 'Main', meaning: 'I' },
      { phonetic: 'Ādi', meaning: 'Adi' },
      { phonetic: 'Hoon', meaning: 'Am' },
    ],
  },
  {
    text: 'నమస్కారం, నేను ఆది',
    segments: ['నమస్కారం, ', 'నేను ', 'ఆది'],
    subtitle: 'Telugu (Native)',
    breakdown: [
      { phonetic: 'Namaskāram', meaning: 'Hello' },
      { phonetic: 'Nēnu', meaning: 'I' },
      { phonetic: 'Ādi', meaning: 'Adi' },
    ],
  },
  {
    text: '你好，我叫 Adi',
    segments: ['你好，', '我叫 ', 'Adi'],
    subtitle: 'Mandarin (Beginner)',
    icons: [
      { src: '/nsli.png', link: 'https://www.virtualbadge.io/certificate-validator?credential=39cfa8cb-56a1-4e8e-be87-b5b67cbd8874', height: 18 },
    ],
    breakdown: [
      { phonetic: 'Nǐ hǎo', meaning: 'Hello' },
      { phonetic: 'Wǒ jiào', meaning: 'I am called' },
      { phonetic: 'Adi', meaning: 'Adi' },
    ],
  },
]
