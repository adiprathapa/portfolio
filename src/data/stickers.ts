import type { CSSProperties } from 'react'

// One table behind both the laptop lid and the placement game. Before this the
// positions lived twice — once per <Sticker> and once in the game's list — and
// had to be nudged in lockstep.

export interface Sticker {
  src: string
  /** Image alt text. */
  alt: string
  /** Short name the placement game prompts with. */
  gameName: string
  /** Tooltip copy: where the sticker came from. */
  label: string
  /** Round this sticker is asked for, 1-based. */
  round: number
  tooltipTop: number
  tooltipOffsetX?: number
  rotation?: number
  /** Lid placement; a few sit slightly differently on desktop. */
  position: (isLg: boolean) => CSSProperties
  /** Opaque region of the artwork, so hover only fires over the sticker itself. */
  hoverArea: CSSProperties
}

const HOVER_Z = 10

function area(top: string, left: string, width: string, height: string): CSSProperties {
  return { top, left, width, height, zIndex: HOVER_Z }
}

/** Listed back to front: later entries stack above earlier ones on the lid. */
export const stickers: Sticker[] = [
  {
    src: '/sticker-acsu2.png', alt: 'ACSU', gameName: 'ACSU', round: 9,
    label: 'From Association of Computer Science Undergraduates', tooltipTop: -56,
    position: () => ({ bottom: 'calc(10% + 18px)', left: 'calc(68% + 17px)', width: '23.3%' }),
    hoverArea: area('5%', '2%', '96%', '89%'),
  },
  {
    src: '/sticker-acsu.png', alt: "Riley's Way", gameName: "Riley's Way", round: 10,
    label: "From Team Mentor Role at Riley's Way Retreat '26", tooltipTop: -56,
    position: () => ({ bottom: 'calc(10% + 11px)', left: 'calc(55% - 13px)', width: '16%' }),
    hoverArea: area('4%', '6%', '83%', '96%'),
  },
  {
    src: '/sticker-tata.png', alt: 'Tata-Cornell Institute', gameName: 'Tata-Cornell', round: 11,
    label: 'From Cornell Food Hackathon Sponsored by Tata-Cornell Institute', tooltipTop: 0,
    position: () => ({ bottom: 'calc(10% - 31px)', left: 'calc(30% - 86px)', width: '37%' }),
    hoverArea: area('33%', '20%', '69%', '36%'),
  },
  {
    src: '/sticker-data.png', alt: 'Cornell Data & Strategy', gameName: 'Data Strategy', round: 7,
    label: 'From Cornell Data & Strategy', tooltipTop: -19,
    position: () => ({ bottom: 'calc(10% - 40px)', left: 'calc(6% - 72px)', width: '37%' }),
    hoverArea: area('24%', '32%', '36%', '47%'),
  },
  {
    src: '/sticker-frog.png', alt: 'TrexQuant', gameName: 'TrexQuant', round: 12,
    label: 'From first Career Fair at Cornell', tooltipTop: -56,
    position: () => ({ bottom: 'calc(10% + 91px)', left: 'calc(70% + 40px)', width: '14.4%' }),
    hoverArea: area('7%', '8%', '85%', '85%'),
  },
  {
    src: '/sticker-c2s2.png', alt: 'C2S2', gameName: 'C2S2', round: 5,
    label: 'From Cornell Custom Silicon Systems', tooltipTop: -56,
    position: (isLg) => ({ bottom: isLg ? 'calc(10% + 105px)' : 'calc(10% + 110px)', left: 'calc(55% + 20px)', width: '15.04%' }),
    hoverArea: area('5%', '5%', '92%', '92%'),
  },
  {
    src: '/sticker-gemini-char.png', alt: 'Ampersand', gameName: 'Arts & Sciences', round: 13,
    label: "From Cornell Days '26", tooltipTop: -56,
    position: () => ({ bottom: 'calc(10% + 115px)', left: 'calc(8% - 10px)', width: '18%' }),
    hoverArea: area('5%', '5%', '90%', '90%'),
  },
  {
    src: '/sticker-gemini.png', alt: 'Coneflower', gameName: 'Coneflower', round: 3,
    label: 'From my favorite creamery in Omaha, NE', tooltipTop: -56, tooltipOffsetX: 11,
    position: () => ({ bottom: 'calc(10% + 90px)', left: 'calc(30% - 63px)', width: '28.52%' }),
    hoverArea: area('5%', '14%', '78%', '91%'),
  },
  {
    src: '/sticker-purple.png', alt: 'Hackathons Cornell', gameName: 'Hackathon', round: 6,
    label: 'From first hackathon at Cornell', tooltipTop: -56,
    position: (isLg) => ({ bottom: isLg ? 'calc(10% + 210px)' : 'calc(10% + 215px)', left: 'calc(70% + 20px)', width: '22%' }),
    hoverArea: area('10%', '4%', '94%', '76%'),
  },
  {
    src: '/sticker-nell.png', alt: 'Cornell University', gameName: 'Cornell', round: 2,
    label: 'From Orientation Week', tooltipTop: -59,
    position: (isLg) => ({ bottom: isLg ? 'calc(10% + 260px)' : 'calc(10% + 285px)', left: 'calc(70% + 40px)', width: '16.2%' }),
    hoverArea: area('0%', '2%', '96%', '97%'),
  },
  {
    src: '/sticker-claude.png', alt: 'Claude', gameName: 'Claude', round: 1,
    label: 'From Claude Builders Club', tooltipTop: -37,
    position: (isLg) => ({ bottom: isLg ? 'calc(10% + 197px)' : 'calc(10% + 202px)', left: 'calc(52% + 25px)', width: '18%' }),
    hoverArea: area('16%', '12%', '77%', '68%'),
  },
  {
    src: '/sticker-tabs.png', alt: 'Google for Education', gameName: 'Google', round: 8,
    label: 'From event at Okenshields', tooltipTop: -37,
    position: (isLg) => ({ bottom: isLg ? 'calc(10% + 315px)' : 'calc(10% + 340px)', left: 'calc(34% + 130px)', width: '19.8%' }),
    hoverArea: area('25%', '3%', '95%', '72%'),
  },
  {
    src: '/sticker-tab.png', alt: 'tabs+', gameName: 'tabs', round: 14,
    label: 'From Cornell AI Hackathon hosted at tabs', tooltipTop: -40,
    position: (isLg) => ({
      bottom: isLg ? 'calc(10% + 243px)' : 'calc(10% + 253px)',
      left: isLg ? 'calc(16% + 180px)' : 'calc(16% + 185px)',
      width: '12.6%',
    }),
    hoverArea: area('12%', '5%', '91%', '71%'),
  },
  {
    src: '/sticker-cu.png', alt: 'CU mascot', gameName: 'Civics Unplugged', round: 15,
    label: "From Georgetown '24 Civic Innovation Academy", tooltipTop: -35,
    position: (isLg) => ({ bottom: isLg ? 'calc(10% + 280px)' : 'calc(10% + 305px)', left: 'calc(2% + 225px)', width: '12.6%' }),
    hoverArea: area('20%', '6%', '91%', '67%'),
  },
  {
    src: '/sticker-claude-confused.png', alt: 'Claude', gameName: 'Claude Code', round: 16,
    label: 'From Claude Builders Club Hackathon', tooltipTop: -56, rotation: 30,
    position: (isLg) => ({ bottom: isLg ? 'calc(10% + 209px)' : 'calc(10% + 219px)', left: 'calc(8% + 40px)', width: '18%' }),
    hoverArea: area('5%', '5%', '90%', '90%'),
  },
  {
    src: '/gemini-sticker.png', alt: 'YC', gameName: 'YC', round: 4,
    label: 'From YC @ Cornell', tooltipTop: -21,
    position: (isLg) => ({ top: isLg ? 'calc(10% - 51px)' : 'calc(10% - 59px)', bottom: 'auto', left: 'calc(8% + 5px)', width: '20%' }),
    hoverArea: area('5%', '5%', '90%', '90%'),
  },
]

/** The same stickers in the order the placement game asks for them. */
export const stickersByRound = [...stickers].sort((a, b) => a.round - b.round)
