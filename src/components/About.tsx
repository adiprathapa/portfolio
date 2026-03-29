import { type MotionValue } from 'framer-motion'
import { GradientText } from './ui/gradient-text'
import { ContainerScroll, CardsContainer, CardTransformed } from './ui/animated-cards-stack'

interface AboutProps {
  cardProgress?: MotionValue<number>
}

const HIGHLIGHTS = [
  {
    id: 'cornell',
    emoji: '🎓',
    title: 'Cornell CS + AI',
    description: 'Computer Science major with a minor in Artificial Intelligence',
    color: '#0671A4',
  },
  {
    id: 'web3',
    emoji: '🌐',
    title: 'Web3 / DeFi',
    description: 'Exploring stablecoins, IPFS, and programmable money',
    color: '#38BDF8',
  },
  {
    id: 'eagle-scout',
    emoji: '⚜️',
    title: 'Eagle Scout',
    description: 'Leadership, service, and a love for the outdoors',
    color: '#10B981',
  },
  {
    id: 'gaming',
    emoji: '🎮',
    title: 'Gaming & Anime',
    description: 'From competitive gaming to binge-watching anime',
    color: '#8B5CF6',
  },
]

export function About({ cardProgress }: AboutProps) {
  return (
    <section id="about" className="relative h-full flex items-center px-4 md:px-6" style={{ background: 'var(--color-surface, #EFF3F8)' }}>
      <div className="mx-auto max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <GradientText as="h2" className="text-3xl md:text-4xl font-bold mb-6">
            About me
          </GradientText>
          <p className="text-body text-lg leading-relaxed mb-4">
            I'm a Computer Science student at Cornell minoring in AI, originally
            from Nebraska. I am really interested in building and working with full stack web
            apps and experimenting with ML models.
          </p>
          <p className="text-body text-lg leading-relaxed mb-4">
            Lately I've been diving deep into web3, stablecoins, and IPFS, the idea of
            programmable money and decentralized finance is something I enjoy working with and learning about. I'm always looking for ways to connect what I'm learning in AI
            with applications outside of the classroom.
          </p>
          <p className="text-body text-lg leading-relaxed">
            Outside of code, I'm an Eagle Scout who still loves getting outdoors,
            camping, hiking, that kind of thing. When I'm not on a trail, you'll
            probably find me gaming, tinkering with some new tech, or catching up
            on anime and shows.
          </p>
        </div>

        {/* Animated Cards */}
        <div className="flex items-center justify-center ml-[230px] -mt-[30px]">
          <ContainerScroll scrollYProgress={cardProgress}>
            <CardsContainer className="w-full max-w-[700px] h-[525px]">
              {HIGHLIGHTS.map((item, index) => (
                <CardTransformed
                  key={item.id}
                  className="items-start justify-center border border-border bg-white shadow-card px-8 py-8"
                  arrayLength={HIGHLIGHTS.length}
                  index={index + 1}
                  variant="light"
                >
                  <div className="flex flex-col items-center text-center space-y-4 w-full">
                    <span
                      className="text-5xl"
                      style={{ filter: `drop-shadow(0 2px 4px ${item.color}40)` }}
                    >
                      {item.emoji}
                    </span>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: item.color, fontFamily: 'var(--font-heading)' }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-body text-sm leading-relaxed max-w-[280px]">
                      {item.description}
                    </p>
                  </div>
                </CardTransformed>
              ))}
            </CardsContainer>
          </ContainerScroll>
        </div>
      </div>
    </section>
  )
}
