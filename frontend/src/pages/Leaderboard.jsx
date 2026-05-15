import { useState, useEffect } from 'react'
import api from '../api/client'

const s = {
  page: { padding: '2rem', minHeight: 'calc(100vh - 60px)', background: '#080c14', maxWidth: '700px', margin: '0 auto' },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#a78bfa', marginBottom: '1.5rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', color: '#6b7280', fontSize: '0.8rem', padding: '0.7rem 1rem', borderBottom: '1px solid #1f2937', textTransform: 'uppercase', letterSpacing: '1px' },
  tr: (i) => ({ background: i % 2 === 0 ? '#0d1117' : 'transparent' }),
  td: { padding: '0.9rem 1rem', color: '#e2e8f0', fontSize: '0.95rem', borderBottom: '1px solid #111827' },
  rank: (r) => ({ fontWeight: '800', color: r === 1 ? '#fbbf24' : r === 2 ? '#9ca3af' : r === 3 ? '#b45309' : '#6b7280' }),
  empty: { color: '#374151', textAlign: 'center', padding: '3rem', fontSize: '1rem' },
}

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leaderboard/').then(r => { setEntries(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div style={s.page}>
      <div style={s.title}>🏆 Leaderboard</div>
      {loading ? <div style={s.empty}>Loading...</div> : entries.length === 0 ? (
        <div style={s.empty}>No scores yet. Be the first to play!</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Rank</th>
              <th style={s.th}>Player</th>
              <th style={s.th}>Score</th>
              <th style={s.th}>Accuracy</th>
              <th style={s.th}>Perfects</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} style={s.tr(i)}>
                <td style={{ ...s.td, ...s.rank(e.rank) }}>
                  {e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : `#${e.rank}`}
                </td>
                <td style={s.td}>{e.username}</td>
                <td style={{ ...s.td, color: '#a78bfa', fontWeight: '700' }}>{e.score.toLocaleString()}</td>
                <td style={s.td}>{e.accuracy}%</td>
                <td style={{ ...s.td, color: '#a78bfa' }}>{e.perfect_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
