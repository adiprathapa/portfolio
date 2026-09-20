import { Section } from './ui/section'
import { GradientText } from './ui/gradient-text'
import { ArrowIcon } from './ui/icons'
import { contributions } from '../data/openSource'
import { COLOR, SURFACE, TEXT } from '../lib/theme'

export function OpenSource() {
  return (
    <Section
      id="open-source"
      className="open-source-section relative"
      style={{
        background: SURFACE.page,
        paddingTop: 'clamp(2.5rem, 6vh, 5rem)',
        paddingBottom: 'clamp(7rem, 14vh, 11rem)',
      }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <GradientText as="h2" className="font-normal" style={{ fontSize: TEXT.h2 }}>
          Open Source Contributions
        </GradientText>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-12">
        {contributions.map((item) => (
          <div key={item.id} className="flex flex-col">
            <img
              src={item.logoSrc}
              alt={item.name}
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="h-12 w-12 object-contain"
              style={{ filter: item.logoFilter, opacity: 0.85, mixBlendMode: 'multiply' }}
            />
            <h3
              className="mt-7 font-medium leading-tight"
              style={{ color: COLOR.heading, fontSize: 'clamp(1.125rem, 0.6vw + 0.85rem, 1.375rem)' }}
            >
              {item.name}
            </h3>
            <p className="mt-3 leading-relaxed" style={{ color: COLOR.prose, fontSize: 'clamp(1rem, 0.4vw + 0.8rem, 1.125rem)' }}>
              {item.description}
            </p>
            <a
              href={item.prListUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-auto inline-flex items-center gap-2 self-start pt-6 font-medium transition-opacity hover:opacity-70"
              style={{ color: COLOR.primary, fontSize: 'clamp(1.0625rem, 0.4vw + 0.9rem, 1.1875rem)' }}
            >
              <span>View PRs</span>
              <ArrowIcon size={16} />
            </a>
          </div>
        ))}
      </div>
    </Section>
  )
}
