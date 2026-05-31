import { Section } from './ui/section'
import { GradientText } from './ui/gradient-text'

type Contribution = {
  id: string
  name: string
  logoSrc: string
  description: string
  prListUrl: string
}

const items: Contribution[] = [
  {
    id: 'kiwix',
    name: 'Kiwix / openZIM',
    logoSrc: '/oss-logo-kiwix.webp',
    description:
      'Shipped system wide dark mode, translation handling, internationalized reset dialogs, and a failed check visual flash in the FreeCodeCamp offliner.',
    prListUrl:
      'https://github.com/search?q=is%3Apr+author%3Aadiprathapa+org%3Aopenzim&type=pullrequests',
  },
  {
    id: 'kubeflow',
    name: 'Kubeflow',
    logoSrc: '/oss-logo-kubeflow.webp',
    description:
      'Added validation for reserved MPI environment variables in the Trainer runtimes and contributed a Spark Connect URL fix for the Python SDK.',
    prListUrl:
      'https://github.com/search?q=is%3Apr+author%3Aadiprathapa+org%3Akubeflow&type=pullrequests',
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    logoSrc: '/oss-logo-jenkins.webp',
    description:
      'Added a custom update center URL flag to the plugin installation manager and contributed unit tests for export logic in the AI chatbot plugin.',
    prListUrl:
      'https://github.com/search?q=is%3Apr+author%3Aadiprathapa+org%3Ajenkinsci&type=pullrequests',
  },
  {
    id: 'ccextractor',
    name: 'CCExtractor',
    logoSrc: '/oss-logo-ccextractor.webp',
    description:
      'Built test suites hardening the ccsync Tasks page UI, covering Reports Toggle behavior and selection state in the multi select utilities.',
    prListUrl:
      'https://github.com/search?q=is%3Apr+author%3Aadiprathapa+org%3ACCExtractor&type=pullrequests',
  },
]

export function OpenSource() {
  return (
    <Section
      id="open-source"
      className="open-source-section relative"
      style={{
        background: '#f4f4f4',
        paddingTop: 'clamp(6rem, 13vh, 10rem)',
        paddingBottom: 'clamp(7rem, 14vh, 11rem)',
      }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <GradientText
          as="h2"
          className="font-normal"
          style={{ fontSize: 'clamp(1.5rem, 1vw + 1rem, 1.875rem)' }}
        >
          Open Source Contributions
        </GradientText>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-10">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col">
            <img
              src={item.logoSrc}
              alt={item.name}
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="h-12 w-12 object-contain"
              style={{
                filter: item.id === 'kubeflow' ? 'grayscale(1)' : 'grayscale(1) contrast(1.4)',
                opacity: 0.85,
                mixBlendMode: 'multiply',
              }}
            />
            <h3
              className="mt-7 font-medium leading-tight"
              style={{
                color: '#111827',
                fontSize: 'clamp(1.125rem, 0.6vw + 0.85rem, 1.375rem)',
              }}
            >
              {item.name}
            </h3>
            <p
              className="mt-3 leading-relaxed"
              style={{
                color: '#515850',
                fontSize: 'clamp(1rem, 0.4vw + 0.8rem, 1.125rem)',
              }}
            >
              {item.description}
            </p>
            <a
              href={item.prListUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-auto inline-flex items-center gap-2 self-start pt-6 font-medium transition-opacity hover:opacity-70"
              style={{
                color: '#0671A4',
                fontSize: 'clamp(1.0625rem, 0.4vw + 0.9rem, 1.1875rem)',
              }}
            >
              <span>View PRs</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path className="transition-opacity group-hover:opacity-0" d="M8 5l7 7-7 7" />
                <path className="opacity-0 transition-opacity group-hover:opacity-100" d="M5 12h14" />
                <path className="opacity-0 transition-opacity group-hover:opacity-100" d="M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </Section>
  )
}
