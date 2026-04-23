import { useEffect, useRef, useState } from 'react'
import { GitHubCalendar } from 'react-github-calendar'
import { Section } from './ui/section'
import { GradientText } from './ui/gradient-text'

const BLUE_THEME = {
  light: ['#EFF3F8', '#BAE0F5', '#7CCAF0', '#38BDF8', '#0671A4'],
  dark: ['#EFF3F8', '#BAE0F5', '#7CCAF0', '#38BDF8', '#0671A4'],
}

const CURRENT_YEAR = new Date().getFullYear()

// GitHub calendars span 53 weeks max in a year. Keep in one place so block
// sizing math below stays readable.
const WEEK_COLUMNS = 53

export function GithubHeatmap() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLinkHovered, setIsLinkHovered] = useState(false)
  const [blockSize, setBlockSize] = useState(18)
  const [blockMargin, setBlockMargin] = useState(4)
  const [fontSize, setFontSize] = useState(14)
  const heatmapColRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const compute = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        // Size blocks so the full 53-week grid fits the heatmap column on
        // mobile with no horizontal overflow and even spacing on both sides.
        const colW = heatmapColRef.current?.clientWidth ?? window.innerWidth
        // Reserve ~80% of the per-column slot for the block, ~20% for margin.
        const slot = colW / WEEK_COLUMNS
        const size = Math.max(4, Math.floor(slot * 0.8))
        const margin = Math.max(1, Math.round(slot - size))
        setBlockSize(size)
        setBlockMargin(margin)
        setFontSize(Math.max(9, Math.round(size * 1.8)))
      } else {
        setBlockSize(18)
        setBlockMargin(4)
        setFontSize(14)
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
    <Section id="github" className="bg-surface !pt-0 !pb-[8vh]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
        {/* Heatmap — left on desktop, below heading on mobile */}
        <div
          ref={heatmapColRef}
          className="order-2 lg:order-1 w-full lg:flex-1 min-w-0 overflow-hidden flex justify-center lg:block github-heatmap-fade"
          style={{ colorScheme: 'light' }}
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

        {/* Heading — right on desktop, on top on mobile */}
        <div className="order-1 lg:order-2 w-full lg:w-auto lg:max-w-md lg:text-right lg:shrink-0">
          <GradientText as="h2" className="text-2xl md:text-3xl font-normal">
            View my projects on GitHub
          </GradientText>
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
