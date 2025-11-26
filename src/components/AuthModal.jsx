import React from 'react'
import ModalLogin from './ModalLogin'
import ModalSignup from './ModalSignup'

export default function AuthModal({ mode = 'login', open, onClose }) {
  if (!open) return null

  return (
    <div className="auth-modal-overlay" onMouseDown={onClose}>
      <div className="auth-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="auth-modal-body">
          {mode === 'signup' ? <ModalSignup /> : <ModalLogin />}
        </div>
      </div>
    </div>
  )
}
