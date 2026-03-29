import { type MotionValue } from 'framer-motion'
import { GradientText } from './ui/gradient-text'
import { ContainerScroll, CardsContainer, CardTransformed } from './ui/animated-cards-stack'

interface AboutProps {
  cardProgress?: MotionValue<number>
}

const CARDS: { id: string; image?: string; offsetY?: number; gradientAngle?: number }[] = [
  { id: 'card-1', image: '/team-presentation.png' },
  { id: 'card-2', image: '/card-3.png', offsetY: -420, gradientAngle: 135 },
  { id: 'card-3' },
  { id: 'card-4' },
  { id: 'card-5' },
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
        <div className="flex items-center justify-center ml-[200px] -mt-[30px]">
          <ContainerScroll scrollYProgress={cardProgress}>
            <CardsContainer className="w-[400px] h-[420px]">
              {CARDS.map((card, index) => (
                <CardTransformed
                  key={card.id}
                  className={card.image ? "border border-border shadow-card" : "border border-border bg-white shadow-card"}
                  arrayLength={CARDS.length}
                  index={index + 1}
                  variant={card.image ? "image" : "light"}
                  {...(card.offsetY ? { offsetY: card.offsetY } : {})}
                  {...(card.image ? { style: { backgroundImage: `linear-gradient(${card.gradientAngle ?? 315}deg, rgba(6,113,164,0.3), rgba(56,189,248,0.2), transparent 60%), url('${card.image}')`, backgroundSize: "cover", backgroundPosition: "center", filter: "saturate(1.3) contrast(1.1) brightness(1.05)" } } : {})}
                />
              ))}
            </CardsContainer>
          </ContainerScroll>
        </div>
      </div>
    </section>
  )
}
