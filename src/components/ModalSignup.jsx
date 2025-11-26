import React, { useState, useContext } from 'react'
import { emailSignUp } from '../firebase'
import { AuthContext, AuthModalContext } from '../App'

export default function ModalSignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useContext(AuthContext)
  const { closeModal, showLoading } = useContext(AuthModalContext)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const cred = await emailSignUp(email, password)
      if (cred?.user) setUser(cred.user)
      if (showLoading) showLoading(500)
      if (closeModal) closeModal()
    } catch (err) {
      alert('Sign up failed: ' + err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-auth-card">
      <h3 style={{marginTop:0}}>Create account</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn primary" type="submit" disabled={loading} style={{width:'100%'}}>
          {loading ? 'Creating...' : 'Sign up'}
        </button>
      </form>
    </div>
  )
}
