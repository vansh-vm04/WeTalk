import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import {WebSocketProvider } from './context/WebSocketProvider.tsx'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
    <WebSocketProvider>
    <App />
    </WebSocketProvider>
    </BrowserRouter>
)
