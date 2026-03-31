import { FlickeringGrid } from './ui/flickering-grid'
import { IconCloud } from './ui/icon-cloud'
import { Safari } from './ui/safari'

const slugs = [
  "typescript",
  "javascript",
  "python",
  "react",
  "nextdotjs",
  "nodedotjs",
  "tailwindcss",
  "postgresql",
  "firebase",
  "vercel",
  "docker",
  "git",
  "github",
  "tensorflow",
  "pytorch",
  "solidity",
  "ethereum",
  "ipfs",
  "html5",
  "css3",
  "figma",
  "amazonaws",
  "mongodb",
  "prisma",
  "graphql",
  "express",
  "flask",
  "rust",
  "go",
  "linux",
]

export function Projects() {
  const safariX = -63
  const safariY = -3
  const safariScale = 1.4
  const cloudSize = 845
  const cloudX = 154
  const cloudY = -10

  const images = slugs.map(
    (slug) => `https://cdn.simpleicons.org/${slug}/${slug}`
  )

  return (
    <section id="projects" className="relative bg-[#080d14] text-white h-screen overflow-hidden">
      {/* Subtle radial gradient for depth */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(6, 113, 164, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 40%, rgba(56, 189, 248, 0.06) 0%, transparent 50%)',
        }}
      />
      <FlickeringGrid
        color="rgb(56, 189, 248)"
        maxOpacity={0.9}
        squareSize={5}
        gridGap={8}
        flickerChance={0.06}
        className="absolute inset-0 z-0"
        style={{
          maskImage: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%), linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 80%), radial-gradient(circle at 70% 70%, transparent 0%, transparent 15%, rgba(0,0,0,0.3) 40%, black 60%)',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%), linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 80%), radial-gradient(circle at 70% 70%, transparent 0%, transparent 15%, rgba(0,0,0,0.3) 40%, black 60%)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'destination-in',
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-12 h-full flex items-center">
        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-16">
          {/* Left side — Safari browser mockup */}
          <div className="flex items-center md:w-[50%] origin-center" style={{ transform: `translateX(${safariX}px) translateY(${safariY}px) scale(${safariScale})` }}>
            <Safari url="adiprathapa.com" className="w-[calc(100%+30px)] h-[calc(80vh+30px)]" style={{ aspectRatio: 'auto' }} />
          </div>

          {/* Right side — Icon Cloud */}
          <div className="flex items-center justify-center md:w-[40%]" style={{ transform: `translateX(${cloudX}px) translateY(${cloudY}px)` }}>
            <IconCloud images={images} size={cloudSize} />
          </div>
        </div>
      </div>
    </section>
  )
}
