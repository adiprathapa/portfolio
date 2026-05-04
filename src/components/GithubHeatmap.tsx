import { useEffect, useRef, useState } from 'react'
import { GitHubCalendar } from 'react-github-calendar'
import { Section } from './ui/section'

const BLUE_THEME = {
  light: ['#EFF3F8', '#BAE0F5', '#7CCAF0', '#38BDF8', '#0671A4'],
  dark: ['#EFF3F8', '#BAE0F5', '#7CCAF0', '#38BDF8', '#0671A4'],
}

const CURRENT_YEAR = new Date().getFullYear()

export function GithubHeatmap() {
  const [isLinkHovered, setIsLinkHovered] = useState(false)
  const [blockSize, setBlockSize] = useState(18)
  const [blockMargin, setBlockMargin] = useState(4)
  const [fontSize, setFontSize] = useState(14)
  const [clipWidth, setClipWidth] = useState<number | undefined>(undefined)
  const heatmapColRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const compute = () => {
      const mobile = window.innerWidth < 1024
      let size: number, margin: number
      if (mobile) {
        size = 14
        margin = 3
        setBlockSize(size)
        setBlockMargin(margin)
        setFontSize(12)
      } else {
        size = 18
        margin = 4
        setBlockSize(size)
        setBlockMargin(margin)
        setFontSize(14)
      }
      if (mobile && heatmapColRef.current) {
        const available = heatmapColRef.current.clientWidth
        const stride = size + margin
        const cols = Math.max(1, Math.floor((available + margin) / stride))
        setClipWidth(cols * stride - margin)
      } else {
        setClipWidth(undefined)
      }
    }
    compute()
    window.addEventListener('resize', compute)
    const ro = new ResizeObserver(compute)
    if (heatmapColRef.current) ro.observe(heatmapColRef.current)
    return () => {
      window.removeEventListener('resize', compute)
      ro.disconnect()
    }
  }, [])

  return (
    <Section id="github" className="!pt-[8vh] !pb-[2vh]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
        {/* Heatmap — left on desktop, below heading on mobile */}
        <div
          ref={heatmapColRef}
          className="order-2 lg:order-1 w-full lg:flex-1 min-w-0 flex justify-center lg:block"
          style={{ colorScheme: 'light' }}
        >
          <div
            className="overflow-hidden github-heatmap-fade"
            style={{ width: clipWidth }}
          >
            <GitHubCalendar
              username="adiprathapa"
              year={CURRENT_YEAR}
              theme={BLUE_THEME}
              colorScheme="light"
              blockSize={blockSize}
              blockMargin={blockMargin}
              fontSize={fontSize}
              showColorLegend={false}
              showMonthLabels={true}
              labels={{
                totalCount: `{{count}} contributions in ${CURRENT_YEAR}`,
              }}
            />
          </div>
        </div>

        {/* Heading — right on desktop, on top on mobile */}
        <div className="order-1 lg:order-2 w-full lg:w-auto lg:max-w-md lg:text-right lg:shrink-0">
          <h2 className="text-2xl md:text-3xl font-normal gradient-text">
            View my projects on GitHub
          </h2>
          <p
            className="mt-3 text-base md:text-lg leading-relaxed"
            style={{ color: '#4B5563' }}
          >
            Every square is another commit toward open source work, research
            prototypes, and side projects. Browse the full set on GitHub.
          </p>
          <a
            href="https://github.com/adiprathapa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-base md:text-lg font-medium transition-opacity hover:opacity-70"
            style={{ color: '#0671A4' }}
            onMouseEnter={() => setIsLinkHovered(true)}
            onMouseLeave={() => setIsLinkHovered(false)}
          >
            <span>github.com/adiprathapa</span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {isLinkHovered ? (
                <>
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </>
              ) : (
                <path d="M8 5l7 7-7 7" />
              )}
            </svg>
          </a>
        </div>
      </div>
    </Section>
  )
}
