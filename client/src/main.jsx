import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { GamesProvider } from './context/GamesContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <GamesProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </GamesProvider>
    </UserProvider>
  </StrictMode>,
)
