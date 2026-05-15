import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c14' },
  card: { background: '#0d1117', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid #1f2937' },
  title: { fontSize: '2rem', fontWeight: '800', color: '#a78bfa', marginBottom: '0.3rem' },
  sub: { color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' },
  label: { display: 'block', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #1f2937', background: '#080c14', color: '#e2e8f0', fontSize: '0.95rem', marginBottom: '1.2rem', outline: 'none' },
  btn: { width: '100%', padding: '0.8rem', background: '#7c3aed', color: '#fff', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' },
  err: { color: '#f87171', marginBottom: '1rem', fontSize: '0.9rem' },
  footer: { textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', fontSize: '0.9rem' },
  link: { color: '#a78bfa', textDecoration: 'none' },
}

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await api.post('/auth/register', form)
      const res = await api.post('/auth/login', { email: form.email, password: form.password })
      localStorage.setItem('bs_token', res.data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.title}>🎵 BeatSync</div>
        <div style={s.sub}>Create your account</div>
        {error && <div style={s.err}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <label style={s.label}>Username</label>
          <input style={s.input} type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <div style={s.footer}>Have an account? <Link to="/login" style={s.link}>Sign in</Link></div>
      </div>
    </div>
  )
}
