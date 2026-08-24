type CaptureFn = (event: string, properties?: Record<string, unknown>) => void

let client: { capture: CaptureFn; captureException: (error: unknown) => void } | null = null
const pending: Array<[string, Record<string, unknown> | undefined]> = []

export const posthog = {
  capture(event: string, properties?: Record<string, unknown>) {
    if (client) client.capture(event, properties)
    else pending.push([event, properties])
  },
  captureException(error: unknown) {
    client?.captureException(error)
  },
}

export function initAnalytics() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  if (nav.doNotTrack === '1' || nav.globalPrivacyControl === true) return
  const load = () => {
    import('posthog-js').then(({ default: ph }) => {
      ph.init(import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN, {
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2026-01-30',
        persistence: 'memory',
        autocapture: false,
        respect_dnt: true,
        person_profiles: 'identified_only',
      })
      client = ph
      pending.splice(0).forEach(([event, properties]) => ph.capture(event, properties))
    })
  }
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(load, { timeout: 4000 })
  else window.setTimeout(load, 1500)
}
