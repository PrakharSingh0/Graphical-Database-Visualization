import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import './styles.css'
(async () => {
  try {
    const AOS = await import('aos')
    await import('aos/dist/aos.css')
    AOS.init({ once: true, duration: 700 })
  } catch (err) {
  }
})()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

const fallback = document.getElementById('fallback')
if (fallback) fallback.className = 'fallback-hidden'
