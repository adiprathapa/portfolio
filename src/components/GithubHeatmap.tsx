import { useEffect, useState } from 'react'
import { GitHubCalendar } from 'react-github-calendar'
import { Section } from './ui/section'
import { GradientText } from './ui/gradient-text'

const BLUE_THEME = {
  light: ['#EFF3F8', '#BAE0F5', '#7CCAF0', '#38BDF8', '#0671A4'],
  dark: ['#EFF3F8', '#BAE0F5', '#7CCAF0', '#38BDF8', '#0671A4'],
}

const CURRENT_YEAR = new Date().getFullYear()

export function GithubHeatmap() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLinkHovered, setIsLinkHovered] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <Section id="github" className="bg-surface !pt-0 !pb-[85px]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
        {/* Heatmap — left on desktop, below heading on mobile */}
        <div
          className="order-2 lg:order-1 w-full lg:flex-1 min-w-0 overflow-hidden github-heatmap-fade"
          style={{ colorScheme: 'light' }}
        >
          <GitHubCalendar
            username="adiprathapa"
            year={CURRENT_YEAR}
            theme={BLUE_THEME}
            colorScheme="light"
            blockSize={isMobile ? 12 : 18}
            blockMargin={isMobile ? 3 : 4}
            fontSize={isMobile ? 12 : 14}
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
