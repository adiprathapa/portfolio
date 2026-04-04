import { useState } from 'react'
import { Section } from './ui/section'
import { GradientText } from './ui/gradient-text'

export function Experience() {
  const [active, setActive] = useState<'work' | 'involvement'>('work')

  return (
    <Section id="experience" className="bg-surface min-h-screen flex items-center !pt-0">
      <div style={{ transform: 'translateY(-50px)' }}>
        <GradientText as="h2" className="text-2xl md:text-3xl font-normal">
          Experience
        </GradientText>
      </div>

      <div className="flex items-center gap-4 mt-8" style={{ transform: 'translateY(-50px)' }}>
        <button
          onClick={() => setActive('work')}
          className="text-base font-semibold transition-all duration-300 cursor-pointer"
          style={
            active === 'work'
              ? { color: '#F4F4F4', backgroundColor: '#0671A4', borderRadius: '12px', padding: '6px 20px' }
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
              ? { color: '#F4F4F4', backgroundColor: '#0671A4', borderRadius: '12px', padding: '6px 20px' }
              : { color: '#4B5563', backgroundColor: 'transparent', border: 'none', padding: '6px 20px' }
          }
        >
          Involvement
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-10 mt-10 w-full items-start">
        {/* Left side - stats */}
        <div className="flex flex-col gap-6 md:w-1/3 pt-4" style={{ transform: 'translateY(-50px)' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#0671A4' }}>Role</p>
            <p className="text-lg mt-1" style={{ color: '#1F2937' }}>Software Engineer</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#0671A4' }}>Duration</p>
            <p className="text-lg mt-1" style={{ color: '#1F2937' }}>2024 — Present</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#0671A4' }}>Tech</p>
            <p className="text-lg mt-1" style={{ color: '#1F2937' }}>React, TypeScript, Node.js</p>
          </div>
        </div>

        {/* Right side - card */}
        <div
          className="relative overflow-hidden"
          style={{
            width: '840px',
            height: '410px',
            borderRadius: '1rem',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.10)',
            transform: 'translate(-96px, -34px)',
          }}
        >
          <img
            src="/mitre-bg.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(6, 113, 164, 0.4) 0%, rgba(6, 113, 164, 0.55) 50%, rgba(6, 113, 164, 0.92) 80%, rgba(6, 113, 164, 0.97) 100%)',
            }}
          />
          <div className="relative h-full flex flex-col justify-between p-8 md:p-10">
            <img
              src="/mitre.png"
              alt="MITRE"
              className="h-[86px] w-auto object-contain self-start"
              style={{ filter: 'brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0,0,0,0.2))', transform: 'translate(-15px, -50px)' }}
            />
            <h3
              className="font-medium leading-snug max-w-lg"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', color: '#FFFFFF' }}
            >
              Building scalable web applications and leading frontend architecture for national security
            </h3>
          </div>
        </div>
      </div>

      {/* Logo bar */}
      <div className="w-full mt-16 flex flex-col items-center">
        <div style={{ width: '60px', height: '2px', backgroundColor: '#0671A4', opacity: 0.4 }} />
        <div className="flex items-center justify-between w-full py-8 px-8">
          <img
            src="/mitre.png"
            alt="MITRE"
            className="h-[86px] w-auto object-contain"
            style={{ filter: 'grayscale(100%) opacity(0.4)' }}
          />
          <img
            src="/cornell.svg"
            alt="Cornell"
            className="h-[34px] w-auto object-contain"
            style={{ filter: 'grayscale(100%) opacity(0.4)' }}
          />
          <img
            src="/mines.png"
            alt="Mines"
            className="h-[34px] w-auto object-contain"
            style={{ filter: 'grayscale(100%) opacity(0.4)' }}
          />
          <img
            src="/neb.png"
            alt="Neb"
            className="h-[34px] w-auto object-contain"
            style={{ filter: 'grayscale(100%) opacity(0.4)' }}
          />
        </div>
      </div>
    </Section>
  )
}
