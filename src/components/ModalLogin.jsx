import React, { useState, useContext } from 'react'
import { googleSignIn, emailSignIn } from '../firebase'
import { AuthContext, AuthModalContext } from '../App'

export default function ModalLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useContext(AuthContext)
  const { closeModal, showLoading } = useContext(AuthModalContext)
  const handleGoogle = async () => {
    setLoading(true)
    try {
      const cred = await googleSignIn()
      if (cred?.user) setUser(cred.user)
      if (showLoading) showLoading(500)
      if (closeModal) closeModal()
    } catch (err) {
      alert('Google sign-in failed: ' + err.message)
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const cred = await emailSignIn(email, password)
      if (cred?.user) setUser(cred.user)
      if (showLoading) showLoading(500)
      if (closeModal) closeModal()
    } catch (err) {
      alert('Sign in failed: ' + err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-auth-card">
      <h3 style={{marginTop:0}}>Sign in</h3>
      <button className="btn primary" onClick={handleGoogle} disabled={loading} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
        <i className="fa-brands fa-google"/> Sign in with Google
      </button>
      <div className="or">OR</div>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn primary" type="submit" disabled={loading} style={{width:'100%'}}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
