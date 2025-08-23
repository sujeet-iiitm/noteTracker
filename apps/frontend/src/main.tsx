import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'

// import "../styles/globals.css"
import "@repo/ui/styles/globals.css"; 
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>,
)
