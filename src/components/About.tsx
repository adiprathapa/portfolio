import { Section } from './ui/section'
import { GradientText } from './ui/gradient-text'

export function About() {
  return (
    <Section id="about" className="bg-primary/5">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <GradientText as="h2" className="text-3xl md:text-4xl font-bold mb-6">
            About me
          </GradientText>
          <p className="text-body text-lg leading-relaxed mb-4">
            I'm a software engineer who loves turning complex problems into
            elegant, user-friendly solutions. With a passion for clean code and
            thoughtful design, I build products that people enjoy using.
          </p>
          <p className="text-body text-lg leading-relaxed">
            When I'm not coding, you'll find me exploring new technologies,
            contributing to open source, or tinkering with side projects that
            push what's possible on the web.
          </p>
        </div>

        {/* Decorative element */}
        <div className="hidden md:flex items-center justify-center">
          <div
            className="w-72 h-72 rounded-3xl rotate-6 opacity-80"
            style={{
              background:
                'linear-gradient(135deg, rgba(87, 84, 255, 0.15) 0%, rgba(78, 235, 243, 0.15) 100%)',
            }}
          >
            <div
              className="w-full h-full rounded-3xl -rotate-12 flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(225deg, rgba(87, 84, 255, 0.1) 0%, rgba(78, 235, 243, 0.1) 100%)',
              }}
            >
              <div className="w-24 h-24 rounded-2xl bg-primary/20 animate-breathe" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
