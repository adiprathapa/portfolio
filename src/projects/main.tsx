import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import { initAnalytics } from '../lib/analytics'
import { ProjectsApp } from './ProjectsApp'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectsApp />
  </StrictMode>,
)
