import { useEffect, useRef, useState } from 'react'
import { ProjectMarquee } from './About'
import { GithubHeatmap } from './GithubHeatmap'

export function ProjectsIntro() {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} id="projects-intro" className="pt-6 pb-0 lg:pt-12" style={{ background: '#E4EFF5' }}>
      {/* Projects heading + description */}
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-2xl lg:text-3xl font-normal gradient-text">
          Projects
        </h2>
        <p className="text-black text-base lg:text-xl leading-relaxed mt-2 max-w-4xl">
          I am a fullstack developer who mainly works in Python, Java, and for frontend
          in JavaScript and TypeScript. I have experience working with a variety of machine
          learning and data science libraries like PyTorch, TensorFlow, scikit-learn, pandas,
          and more. My projects range from fintech applications to machine learning focused
          projects to apps that combine both.
        </p>
      </div>

      {/* Marquee conveyor */}
      <div className="relative mt-6 lg:mt-10 -my-4 py-4 overflow-hidden">
        <div className="lg:hidden" style={{ transform: 'scale(0.82)', transformOrigin: 'left center' }}>
          <ProjectMarquee active={active} />
        </div>
        <div className="hidden lg:block">
          <ProjectMarquee active={active} />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-8 lg:w-32 z-10"
          style={{ background: 'linear-gradient(to right, #E4EFF5, transparent)' }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 lg:w-32 z-10"
          style={{ background: 'linear-gradient(to left, #E4EFF5, transparent)' }}
        />
      </div>

      {/* GitHub heatmap */}
      <div className="mt-4 lg:mt-8">
        <GithubHeatmap />
      </div>
    </section>
  )
}
