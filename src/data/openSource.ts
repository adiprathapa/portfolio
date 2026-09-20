export interface Contribution {
  id: string
  name: string
  logoSrc: string
  description: string
  prListUrl: string
  /** Each mark needs a different treatment to sit evenly on the light surface. */
  logoFilter: string
}

function prSearch(org: string) {
  return `https://github.com/search?q=is%3Apr+author%3Aadiprathapa+org%3A${org}&type=pullrequests`
}

export const contributions: Contribution[] = [
  {
    id: 'kiwix',
    name: 'Kiwix / openZIM',
    logoSrc: '/oss-logo-kiwix.webp',
    description: 'Shipped system wide dark mode, translation handling, and internationalized dialogs in the freeCodeCamp offliner.',
    prListUrl: prSearch('openzim'),
    logoFilter: 'grayscale(1) brightness(1.4) contrast(0.6)',
  },
  {
    id: 'kubeflow',
    name: 'Kubeflow',
    logoSrc: '/oss-logo-kubeflow.webp',
    description: 'Merged reserved MPI environment variable validation in the Trainer runtimes; two Python SDK fixes are in review.',
    prListUrl: prSearch('kubeflow'),
    logoFilter: 'grayscale(1)',
  },
  {
    id: 'jenkins',
    name: 'Jenkins',
    logoSrc: '/oss-logo-jenkins.webp',
    description: 'Merged a custom update center URL flag in the plugin installation manager; AI chatbot and credentials plugin PRs are in review.',
    prListUrl: prSearch('jenkinsci'),
    logoFilter: 'grayscale(1) contrast(1.4)',
  },
  {
    id: 'cockroachdb',
    name: 'CockroachDB',
    logoSrc: '/oss-logo-cockroachdb.webp',
    description: 'Submitted a jsonpath scanner fix aligning trailing junk errors with Postgres diagnostics.',
    prListUrl: prSearch('cockroachdb'),
    logoFilter: 'grayscale(1) contrast(1.4)',
  },
]
