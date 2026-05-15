import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../api/client'

const s = {
  page: { padding: '2rem', minHeight: 'calc(100vh - 60px)', background: '#080c14' },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#a78bfa', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { background: '#0d1117', borderRadius: '12px', padding: '1.2rem', border: '1px solid #1f2937' },
  cardVal: { fontSize: '1.8rem', fontWeight: '700', color: '#e2e8f0' },
  cardLabel: { color: '#6b7280', fontSize: '0.8rem', marginTop: '0.3rem' },
  chartCard: { background: '#0d1117', borderRadius: '12px', padding: '1.5rem', border: '1px solid #1f2937', marginBottom: '1.5rem' },
  chartTitle: { color: '#9ca3af', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' },
  empty: { color: '#374151', textAlign: 'center', padding: '3rem' },
}

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leaderboard/stats').then(r => { setStats(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ ...s.page, color: '#6b7280' }}>Loading stats...</div>
  if (!stats || stats.total_sessions === 0) return (
    <div style={s.page}>
      <div style={s.title}>📊 My Stats</div>
      <div style={s.empty}>No sessions yet. Play a game to see your stats!</div>
    </div>
  )

  const chartData = [...stats.recent_sessions].reverse().map((s, i) => ({
    session: `#${i + 1}`,
    score: s.score,
    accuracy: s.accuracy,
  }))

  return (
    <div style={s.page}>
      <div style={s.title}>📊 My Stats</div>

      <div style={s.grid}>
        <div style={s.card}><div style={{ ...s.cardVal, color: '#a78bfa' }}>{stats.best_score.toLocaleString()}</div><div style={s.cardLabel}>Best Score</div></div>
        <div style={s.card}><div style={s.cardVal}>{stats.avg_accuracy}%</div><div style={s.cardLabel}>Avg Accuracy</div></div>
        <div style={s.card}><div style={s.cardVal}>{stats.total_sessions}</div><div style={s.cardLabel}>Sessions Played</div></div>
        <div style={s.card}><div style={{ ...s.cardVal, color: '#a78bfa' }}>{stats.total_perfects}</div><div style={s.cardLabel}>Total Perfects</div></div>
        <div style={s.card}><div style={{ ...s.cardVal, color: '#34d399' }}>{stats.total_goods}</div><div style={s.cardLabel}>Total Goods</div></div>
        <div style={s.card}><div style={{ ...s.cardVal, color: '#f87171' }}>{stats.total_misses}</div><div style={s.cardLabel}>Total Misses</div></div>
        <div style={s.card}><div style={s.cardVal}>{Math.abs(stats.avg_offset_ms).toFixed(0)}ms</div><div style={s.cardLabel}>Avg Timing Offset</div></div>
      </div>

      {chartData.length > 1 && (
        <>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>Score History</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} /><stop offset="95%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="session" stroke="#374151" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis stroke="#374151" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1f2937', borderRadius: '8px', color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="score" stroke="#7c3aed" fill="url(#scoreGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={s.chartCard}>
            <div style={s.chartTitle}>Accuracy History (%)</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs><linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.4} /><stop offset="95%" stopColor="#34d399" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="session" stroke="#374151" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis stroke="#374151" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1f2937', borderRadius: '8px', color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="accuracy" stroke="#34d399" fill="url(#accGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
