import { useState } from 'react'
import { Section } from './ui/section'

export function Experience() {
  const [active, setActive] = useState<'work' | 'involvement'>('work')

  return (
    <Section id="experience" className="bg-surface min-h-screen flex items-center">
      <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#0671A4' }}>
        Experience
      </h2>

      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={() => setActive('work')}
          className="text-base font-semibold transition-all duration-300 cursor-pointer"
          style={
            active === 'work'
              ? { color: '#ffffff', backgroundColor: '#0671A4', borderRadius: '9999px', padding: '6px 20px' }
              : { color: '#4B5563', backgroundColor: 'transparent', border: 'none', padding: '6px 20px' }
          }
        >
          Work
        </button>
        <button
          onClick={() => setActive('involvement')}
          className="text-base font-semibold transition-all duration-300 cursor-pointer"
          style={
            active === 'involvement'
              ? { color: '#ffffff', backgroundColor: '#0671A4', borderRadius: '9999px', padding: '6px 20px' }
              : { color: '#4B5563', backgroundColor: 'transparent', border: 'none', padding: '6px 20px' }
          }
        >
          Involvement
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-10 mt-10 w-full items-start">
        {/* Left side - stats */}
        <div className="flex flex-col gap-8 md:w-1/3 pt-4">
          <div>
            <p className="text-2xl font-bold flex items-center gap-3" style={{ color: '#0671A4' }}>
              <span className="inline-block w-px h-5" style={{ backgroundColor: '#0671A4' }} />
              Role
            </p>
            <p className="text-sm mt-1 ml-[11px]" style={{ color: '#4B5563' }}>Software Engineer</p>
          </div>
          <div>
            <p className="text-2xl font-bold flex items-center gap-3" style={{ color: '#0671A4' }}>
              <span className="inline-block w-px h-5" style={{ backgroundColor: '#0671A4' }} />
              Duration
            </p>
            <p className="text-sm mt-1 ml-[11px]" style={{ color: '#4B5563' }}>2024 — Present</p>
          </div>
          <div>
            <p className="text-sm font-bold flex items-center gap-3" style={{ color: '#0671A4' }}>
              <span className="inline-block w-px h-5" style={{ backgroundColor: '#0671A4' }} />
              Tech used
            </p>
            <p className="text-sm mt-1 ml-[11px]" style={{ color: '#4B5563' }}>React, TypeScript, Node.js</p>
          </div>
        </div>

        {/* Right side - card */}
        <div
          className="relative md:w-2/3 w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{ aspectRatio: '16 / 10' }}
        >
          <img
            src="/Underwater-Rov-SpaceX3.jpg.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Color overlay - stronger at bottom */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,80,140,0.3) 0%, rgba(0,80,140,0.6) 50%, rgba(0,80,140,0.85) 100%)' }} />
          <div className="relative h-full flex flex-col justify-between p-8">
            <img src="/mitre.png" alt="MITRE" className="h-6 w-auto max-w-[120px] object-contain brightness-0 invert" />
            <h3 className="text-white text-xl md:text-2xl font-bold leading-snug">
              Building scalable web applications and leading frontend architecture
            </h3>
          </div>
        </div>
      </div>
    </Section>
  )
}
