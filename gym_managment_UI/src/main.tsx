import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import './index.css'
import { GymApp } from './Frontend/GymApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GymApp />
  </StrictMode>,
)
