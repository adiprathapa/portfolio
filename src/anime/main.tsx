import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { initAnalytics } from '../lib/analytics'
import { PageShell } from '../components/PageShell'
import { AnimePage } from './AnimePage'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageShell page="anime">
      <AnimePage />
    </PageShell>
  </StrictMode>,
)
