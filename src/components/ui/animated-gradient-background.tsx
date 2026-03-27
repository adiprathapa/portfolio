import { motion } from 'framer-motion'

interface AnimatedGradientBackgroundProps {
  className?: string
}

export function AnimatedGradientBackground({ className = '' }: AnimatedGradientBackgroundProps) {
  return (
    <motion.div
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        className="absolute inset-0 animate-breathe"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(6, 113, 164, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(56, 189, 248, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(6, 113, 164, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(56, 189, 248, 0.15) 0%, transparent 40%),
            linear-gradient(135deg, #eef6fb 0%, #e0f2fe 50%, #f0f9ff 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0 animate-breathe"
        style={{
          animationDelay: '4s',
          background: `
            radial-gradient(ellipse at 60% 30%, rgba(56, 189, 248, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 30% 70%, rgba(6, 113, 164, 0.15) 0%, transparent 50%)
          `,
        }}
      />
    </motion.div>
  )
}
