import { motion } from 'framer-motion'
import { Section } from './ui/section'
import { Eyebrow } from './ui/eyebrow'
import { staggerContainer, fadeInUp } from '../lib/animations'

const experiences = [
  {
    period: '2024 — Present',
    role: 'Software Engineer',
    company: 'Company One',
    description:
      'Building scalable web applications and leading frontend architecture decisions for a growing product team.',
  },
  {
    period: '2022 — 2024',
    role: 'Full Stack Developer',
    company: 'Company Two',
    description:
      'Developed and maintained customer-facing features, improved performance by 40%, and mentored junior developers.',
  },
  {
    period: '2021 — 2022',
    role: 'Software Engineering Intern',
    company: 'Company Three',
    description:
      'Contributed to the core platform, built internal tools, and shipped features used by thousands of users daily.',
  },
]

export function Experience() {
  return (
    <Section id="experience" className="bg-surface">
      <Eyebrow>Experience</Eyebrow>
      <h2 className="text-3xl md:text-4xl font-bold text-heading mt-3 mb-12">
        Where I've worked
      </h2>

      <motion.div
        className="relative pl-8 border-l-2 border-primary/30 space-y-12"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {experiences.map((exp) => (
          <motion.div key={exp.period} variants={fadeInUp} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[calc(2rem+5px)] top-1 w-3 h-3 bg-primary rounded-full border-2 border-white" />

            <span className="text-sm text-muted font-medium">{exp.period}</span>
            <h3 className="text-xl font-semibold text-heading mt-1">{exp.role}</h3>
            <p className="text-primary font-medium mt-0.5">{exp.company}</p>
            <p className="text-body mt-2 leading-relaxed">{exp.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}
