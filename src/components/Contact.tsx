import { type FormEvent, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { fadeInUp, staggerContainer } from '../lib/animations'

export function Contact() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (email) {
      window.location.href = `mailto:hello@adiprathapa.com?subject=Let's connect&body=Hi Adi, I'd love to chat! (from ${email})`
    }
  }

  return (
    <section
      id="contact"
      className="py-16 px-4 md:py-20 md:px-6 lg:py-24"
      style={{
        background: 'linear-gradient(135deg, #0671A4 0%, #38BDF8 100%)',
      }}
    >
      <motion.div
        className="max-w-xl mx-auto text-center"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.h2
          variants={fadeInUp}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Let's work together
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-white/80 text-lg mb-10">
          Have a project in mind? Drop your email and I'll reach out.
        </motion.p>

        <motion.form variants={fadeInUp} onSubmit={handleSubmit}>
          <div className="glassmorphism rounded-full flex items-center p-1.5">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-transparent text-white placeholder:text-white/60 px-5 py-3 outline-none text-sm"
            />
            <Button type="submit" variant="primary" className="bg-white text-primary hover:bg-white/90">
              Get in touch
            </Button>
          </div>
        </motion.form>
      </motion.div>
    </section>
  )
}
