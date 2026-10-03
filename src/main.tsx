import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n/LanguageContext.tsx'
import eruda from 'eruda';
import WebApp from '@twa-dev/sdk';

if (import.meta.env.DEV || WebApp.initDataUnsafe?.start_param === 'debug') {
  eruda.init();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
