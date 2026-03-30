import { motion } from 'framer-motion'
import { Section } from './ui/section'
import { Eyebrow } from './ui/eyebrow'
import { Card } from './ui/card'
import { staggerContainer, fadeInUp } from '../lib/animations'

const projects = [
  {
    title: 'Project One',
    description:
      'A full-stack application that streamlines workflow management with real-time collaboration features.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    title: 'Project Two',
    description:
      'An AI-powered tool that helps teams analyze and visualize complex datasets with natural language queries.',
    tags: ['Python', 'TypeScript', 'OpenAI'],
  },
  {
    title: 'Project Three',
    description:
      'A mobile-first platform connecting local communities through event discovery and shared interest groups.',
    tags: ['React Native', 'Firebase', 'Maps API'],
  },
]

export function Projects() {
  return (
    <Section id="projects" className="bg-dark text-white min-h-screen flex items-center">
      <Eyebrow className="text-accent">Projects</Eyebrow>
      <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-12">
        Things I've built
      </h2>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {projects.map((project) => (
          <motion.div key={project.title} variants={fadeInUp}>
            <Card className="bg-white/5 border-white/10 hover:bg-white/10">
              {/* Dot pattern placeholder image */}
              <div className="dot-pattern aspect-video rounded-sm mb-4 bg-white/5" />

              <h3 className="text-lg font-semibold text-white mb-2">
                {project.title}
              </h3>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/10 text-white/85 text-xs px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}
