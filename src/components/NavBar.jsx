import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext, AuthModalContext } from '../App'
import { signUserOut } from '../firebase'

export default function NavBar() {
  const { user } = useContext(AuthContext)
  const { openModal } = useContext(AuthModalContext)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        <Link to="/" className="brand flex items-center gap-2">
          <img
            src="https://res.cloudinary.com/dnsjdvzdn/image/upload/v1764153659/Gemini_Generated_Image_jjhaozjjhaozjjha-removebg-preview_otkqbk.png"
            alt="logo"
            style={{ width: '96px', height: '36px', objectFit: 'contain' }}
          />
        </Link>
      </div>

      <div className="nav-right">
        <Link to="/" className="nav-link">
          <i className="fa-solid fa-house text-xl"></i>
        </Link>
        &nbsp;&nbsp;
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/dashboard" className="nav-link">Visualizer</Link>

        {!user && <button className="nav-link btn-link" onClick={() => openModal('login')}>Login</button>}
        {!user && <button className="btn primary" onClick={() => openModal('signup')}>Sign Up</button>}

        {user && (
          <div className="user-menu">
            <img className="avatar" src={user.photoURL || 'https://via.placeholder.com/32'} alt="avatar" />
            <span className="user-name">{user.displayName || user.email}</span>
            <button className="btn ghost" onClick={() => signUserOut()}>Sign out</button>
          </div>
        )}
      </div>
    </nav>
  )
}
