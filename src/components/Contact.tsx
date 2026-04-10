import { type FormEvent, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from './ui/button'

export function Contact() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const laptopRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: laptopRef,
    offset: ['start end', 'end start'],
  })
  const rotateX = useTransform(scrollYProgress, [0, 0.4], [70, 0], { clamp: true })
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.935, 1.1], { clamp: true })

  const validateEmail = (value: string) => {
    if (!value) return 'Please enter your email.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.'
    return ''
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const msg = validateEmail(email)
    if (msg) {
      setError(msg)
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await fetch('https://formsubmit.co/ajax/aprathapa01@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          message: `${email} reached out from your portfolio site.`,
          _subject: 'New contact from portfolio site',
        }),
      })
      setSubmitted(true)
      setEmail('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      id="contact"
      className="py-24 px-4 md:py-32 md:px-6 lg:py-40"
      style={{
        minHeight: '80vh',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-16 lg:gap-24 items-center">
          {/* Left — Contact info */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-normal mb-6 leading-tight"
              style={{ color: '#FFFFFF' }}
            >
              Let's work
              <br />
              together
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-black text-lg md:text-xl mb-10 max-w-lg leading-relaxed"
            >
              Have a project or opportunity in mind or just want to connect? Drop your email and
              I'll reach out.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="mb-12"
            >
              {submitted ? (
                <p className="text-white text-lg font-medium">Thanks! I'll be in touch soon.</p>
              ) : (
                <>
                  <div className="glassmorphism rounded-xl flex items-center p-1.5 max-w-md">
                    <input
                      type="text"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                      disabled={submitting}
                      className="flex-1 bg-transparent text-white placeholder:text-white/60 px-5 py-3 outline-none text-sm md:text-base min-w-0"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submitting}
                      className="bg-[#F4F4F4] text-primary hover:bg-[#F4F4F4]/90 !text-lg"
                    >
                      {submitting ? 'Sending...' : 'Get in touch'}
                    </Button>
                  </div>
                  {error && (
                    <p className="mt-3 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {error}
                    </p>
                  )}
                </>
              )}
            </motion.form>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-5"
            >
              <a
                href="https://github.com/adiprathapa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')
                }
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/adiprathapa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')
                }
              >
                <svg
                  className="w-5 h-5"
                  fill="white"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="mailto:aprathapa01@gmail.com"
                className="flex items-center justify-center w-11 h-11 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')
                }
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </motion.div>
          </div>

          {/* Right — MacBook lid with scroll-driven 3D closing animation */}
          <div
            ref={laptopRef}
            className="relative flex items-center justify-center"
            style={{ perspective: 1200, marginLeft: 110 }}
          >
            <motion.div
              className="relative w-full"
              style={{
                maxWidth: '78rem',
                rotateX,
                scale,
                transformOrigin: 'center bottom',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* MacBook lid */}
              <img
                src="/macbook-lid.svg"
                alt="MacBook Air Midnight"
                className="w-full h-auto"
                style={{
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                }}
              />

              {/* Apple logo — dark, like on real Midnight MacBook */}
              <img
                src="/appl.png"
                alt=""
                className="absolute pointer-events-none select-none"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  height: 52,
                  width: 'auto',
                  opacity: 0.35,
                  filter: 'brightness(0)',
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
