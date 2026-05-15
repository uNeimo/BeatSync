import { Link, useNavigate } from 'react-router-dom'

const s = {
  nav: { background: '#0d1117', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', borderBottom: '1px solid #1f2937' },
  logo: { fontSize: '1.4rem', fontWeight: '800', color: '#a78bfa', textDecoration: 'none', letterSpacing: '-0.5px' },
  links: { display: 'flex', gap: '1.5rem', listStyle: 'none' },
  link: { color: '#6b7280', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' },
  btn: { background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
}

export default function Navbar() {
  const navigate = useNavigate()
  const logout = () => { localStorage.removeItem('bs_token'); navigate('/login') }

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.logo}>🎵 BeatSync</Link>
      <ul style={s.links}>
        <li><Link to="/" style={s.link}>Play</Link></li>
        <li><Link to="/leaderboard" style={s.link}>Leaderboard</Link></li>
        <li><Link to="/stats" style={s.link}>My Stats</Link></li>
      </ul>
      <button style={s.btn} onClick={logout}>Logout</button>
    </nav>
  )
}
