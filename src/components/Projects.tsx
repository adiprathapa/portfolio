import { FlickeringGrid } from './ui/flickering-grid'
import { IconCloud } from './ui/icon-cloud'

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
  const images = slugs.map(
    (slug) => `https://cdn.simpleicons.org/${slug}/${slug}`
  )

  return (
    <section id="projects" className="relative bg-dark text-white h-screen overflow-hidden">
      <FlickeringGrid
        color="rgb(56, 189, 248)"
        maxOpacity={0.4}
        squareSize={4}
        gridGap={8}
        flickerChance={0.05}
        className="absolute inset-0 z-0"
        style={{
          maskImage: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%), linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 80%), radial-gradient(circle at 70% 70%, transparent 0%, transparent 15%, rgba(0,0,0,0.3) 40%, black 60%)',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%), linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 80%), radial-gradient(circle at 70% 70%, transparent 0%, transparent 15%, rgba(0,0,0,0.3) 40%, black 60%)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'destination-in',
        }}
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 h-full flex items-center">
        <div className="flex flex-col md:flex-row items-center w-full gap-12">
          {/* Left side — project content will go here */}
          <div className="flex-1" />

          {/* Right side — Icon Cloud */}
          <div className="flex items-center justify-center md:w-1/2 md:translate-x-16">
            <IconCloud images={images} size={900} />
          </div>
        </div>
      </div>
    </section>
  )
}
