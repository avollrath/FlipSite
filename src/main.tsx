import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyStoredTheme } from '@/lib/theme'
import './index.css'
import './styles/themes.css'
import App from './App.tsx'

applyStoredTheme()

createRoot(document.getElementById('root')!).render(
 <StrictMode>
 <App />
 </StrictMode>,
)
