const TIERS: { under: number; messages: string[] }[] = [
  {
    under: 2500,
    messages: ['Gentle toss', 'Easy there', 'Baby throw', 'That was cute', 'Soft hands', 'Not bad', 'Nice flick'],
  },
  {
    under: 5000,
    messages: ['Getting warmer', 'Decent arm', 'Solid throw', "Now we're talking", 'Strong arm!', 'Impressive', 'That had some zip'],
  },
  {
    under: 10000,
    messages: ['Serious heat', 'Absolute cannon', 'Did you play baseball?', 'Sheesh', 'Certified launcher', 'That card had a family'],
  },
  {
    under: Infinity,
    messages: ['Are you okay??', 'Call the police', 'Physics left the chat', 'Unholy velocity', 'Bro chill', 'NASA called, they want their rocket back'],
  },
]

export function throwMessage(speed: number) {
  const tier = TIERS.find((t) => speed < t.under) ?? TIERS[TIERS.length - 1]
  return tier.messages[Math.floor(Math.random() * tier.messages.length)]
}
