import { useState, type FormEvent } from 'react'
import { Button } from '../ui/button'
import { ArrowIcon } from '../ui/icons'
import { posthog } from '../../lib/analytics'
import { SITE } from '../../data/site'
import { TEXT } from '../../lib/theme'

const FORM_ENDPOINT = `https://formsubmit.co/ajax/${SITE.email}`
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(email: string) {
  if (!email) return 'Please enter your email.'
  if (!EMAIL_PATTERN.test(email)) return 'Please enter a valid email address.'
  return ''
}

/** Email capture, delivered through FormSubmit so there's no backend to run. */
export function ContactForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ctaHovered, setCtaHovered] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const message = validate(email)
    if (message) {
      setError(message)
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          message: `${email} reached out from your portfolio site.`,
          _subject: 'New contact from portfolio site',
        }),
      })
      if (!res.ok) throw new Error(`formsubmit ${res.status}`)
      setSubmitted(true)
      setEmail('')
      posthog?.capture('contact_form_submitted')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      posthog?.captureException(err)
      posthog?.capture('contact_form_error')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <form className="mb-12 text-center lg:text-left">
        <p className="leading-relaxed text-white" style={{ fontSize: TEXT.body }}>Thanks! I'll be in touch soon.</p>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-12 text-center lg:text-left">
      <div className="glassmorphism mx-auto flex max-w-md flex-col items-stretch gap-2 rounded-xl p-2 sm:flex-row sm:items-center lg:mx-0">
        <input
          type="email"
          name="email"
          autoComplete="email"
          aria-label="Your email address"
          aria-invalid={!!error}
          aria-describedby={error ? 'contact-email-error' : undefined}
          placeholder="your@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
          disabled={submitting}
          className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/60 md:text-base"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
          className="w-full !bg-black !text-lg !text-white hover:!bg-black/85 sm:w-auto"
          onMouseEnter={() => setCtaHovered(true)}
          onMouseLeave={() => setCtaHovered(false)}
        >
          <span className="inline-flex items-center gap-1.5">
            <span>{submitting ? 'Sending...' : 'Get in touch'}</span>
            <ArrowIcon hovered={ctaHovered} />
          </span>
        </Button>
      </div>

      {error && (
        <p id="contact-email-error" role="alert" className="mt-3 text-sm font-medium text-white">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>
        Delivered via FormSubmit. See the <a href="/privacy.html" className="underline underline-offset-2">privacy page</a>.
      </p>
    </form>
  )
}
