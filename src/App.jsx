import React, { createContext, useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import NavBar from './components/NavBar'
import { initFirebase, auth, onAuthStateChanged } from './firebase'
import ErrorBoundary from './ErrorBoundary'
import AuthModal from './components/AuthModal'
import NetworkAnimation from './components/NetworkAnimation'
import PageLoader from './components/PageLoader'
 

export const AuthContext = createContext(null)
export const AuthModalContext = createContext({ openModal: () => {}, closeModal: () => {} })

initFirebase()

export default function App() {
  const [user, setUser] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('login')
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const loaderTimerRef = React.useRef(null)

  const showLoading = (ms = 500) => {
    try { if (loaderTimerRef.current) clearTimeout(loaderTimerRef.current) } catch (e) {}
    setLoading(true)
    loaderTimerRef.current = setTimeout(() => { setLoading(false); loaderTimerRef.current = null }, ms)
  }

  useEffect(() => {
    
    let unsub = null
    const cb = (u) => {
      setUser(u)
      if (u) navigate('/dashboard')
      else navigate('/')
    }

      try {
      if (auth && typeof auth.onAuthStateChanged === 'function') {
        unsub = auth.onAuthStateChanged(cb)
      } else if (typeof onAuthStateChanged === 'function') {
        unsub = onAuthStateChanged(auth, cb)
      } else {
        cb(null)
      }
    } catch (e) {
      console.warn('Auth subscription failed', e)
      cb(null)
    }

    return () => { try { if (typeof unsub === 'function') unsub(); } catch (e) {} }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    setModalOpen(false)
    try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) } catch (e) {}
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [location.pathname])

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      try { window.history.scrollRestoration = 'manual' } catch (e) {}
    }
    try { window.scrollTo(0, 0) } catch (e) {}
  }, [])

  const openModal = (mode) => { setModalMode(mode); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <AuthModalContext.Provider value={{ openModal, closeModal, showLoading }}>
        <NetworkAnimation />
        <PageLoader visible={loading} />
        <NavBar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <AuthModal mode={modalMode} open={modalOpen} onClose={closeModal} />
        </ErrorBoundary>
      </AuthModalContext.Provider>
    </AuthContext.Provider>
  )
}
