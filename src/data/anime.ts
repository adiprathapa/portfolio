export interface AnimeEntry {
  title: string
  image?: string
  url?: string
  note?: string
  clip?: string
}

export interface CurrentEntry extends AnimeEntry {
  status: 'Watching' | 'Reading'
}

export const MAL_LIST_URL = 'https://myanimelist.net/animelist/adi0000000000001'

export const favoriteAnime: AnimeEntry[] = [
  {
    title: 'Bleach',
    image: '/anime/bleach.webp',
    url: 'https://myanimelist.net/anime/269',
    clip: '/anime/clips/bleach.mp4',
  },
  {
    title: 'Code Geass',
    image: '/anime/code-geass.webp',
    url: 'https://myanimelist.net/anime/1575',
    clip: '/anime/clips/code-geass.mp4',
  },
  {
    title: 'Fullmetal Alchemist: Brotherhood',
    image: '/anime/fullmetal-alchemist-brotherhood.webp',
    url: 'https://myanimelist.net/anime/5114',
    clip: '/anime/clips/fullmetal-alchemist-brotherhood.mp4',
  },
  {
    title: 'Hunter x Hunter',
    image: '/anime/hunter-x-hunter.webp',
    url: 'https://myanimelist.net/anime/11061',
    clip: '/anime/clips/hunter-x-hunter.mp4',
  },
  {
    title: 'Steins;Gate',
    image: '/anime/steins-gate.webp',
    url: 'https://myanimelist.net/anime/9253',
    clip: '/anime/clips/steins-gate.mp4',
  },
  {
    title: 'That Time I Got Reincarnated as a Slime',
    image: '/anime/slime.webp',
    url: 'https://myanimelist.net/anime/37430',
    clip: '/anime/clips/slime.mp4',
  },
]

export const currentlyEnjoying: CurrentEntry[] = [
  {
    title: 'Yu Yu Hakusho',
    status: 'Watching',
    image: '/anime/yu-yu-hakusho.webp',
    clip: '/anime/clips/yu-yu-hakusho.mp4',
    url: 'https://myanimelist.net/anime/392',
  },
  {
    title: 'Berserk',
    status: 'Reading',
    image: '/anime/berserk.webp',
    clip: '/anime/clips/berserk.mp4',
    url: 'https://myanimelist.net/manga/2',
  },
  {
    title: 'Reverend Insanity',
    status: 'Reading',
    image: '/anime/reverend-insanity.webp',
    clip: '/anime/clips/reverend-insanity.mp4',
    url: 'https://www.goodreads.com/book/show/39892810-reverend-insanity',
  },
]
