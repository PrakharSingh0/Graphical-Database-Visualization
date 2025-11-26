import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { emailSignUp } from '../firebase'
import { AuthContext } from '../App'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const cred = await emailSignUp(email, password)
      setUser(cred.user)
      navigate('/dashboard')
    } catch (err) {
      alert('Sign up failed: ' + err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="page auth">
      <div className="auth-card" style={{animation:'float-in 420ms ease'}}>
        <h3 style={{marginTop:0}}>Create account</h3>
        <form onSubmit={handleSubmit}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn primary" type="submit" disabled={loading} style={{width:'100%'}}>
            {loading ? 'Creating...' : 'Sign up'}
          </button>
        </form>
      </div>
    </div>
  )
}
