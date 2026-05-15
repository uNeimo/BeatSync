import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = 'ws://localhost:8001/ws/game'

// Web Audio API sound engine
let audioCtx = null
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

function playClick() {
  const ctx = getAudioCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1000, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05)
  gain.gain.setValueAtTime(0.6, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
  osc.start(); osc.stop(ctx.currentTime + 0.08)
}

function playPerfect() {
  const ctx = getAudioCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
  gain.gain.setValueAtTime(0.4, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
  osc.start(); osc.stop(ctx.currentTime + 0.15)
}

function playGood() {
  const ctx = getAudioCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(440, ctx.currentTime)
  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
  osc.start(); osc.stop(ctx.currentTime + 0.12)
}

function playMiss() {
  const ctx = getAudioCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(150, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1)
  gain.gain.setValueAtTime(0.2, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
  osc.start(); osc.stop(ctx.currentTime + 0.1)
}

const RATING_COLORS = { perfect: '#a78bfa', good: '#34d399', miss: '#f87171' }

const s = {
  page: { minHeight: 'calc(100vh - 60px)', background: '#080c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  title: { fontSize: '1.8rem', fontWeight: '800', color: '#a78bfa', marginBottom: '0.5rem' },
  sub: { color: '#6b7280', marginBottom: '2rem', fontSize: '0.95rem' },
  bpmSelect: { display: 'flex', gap: '0.8rem', marginBottom: '2rem' },
  bpmBtn: (active) => ({ padding: '0.5rem 1.2rem', borderRadius: '8px', border: `1px solid ${active ? '#7c3aed' : '#1f2937'}`, background: active ? '#7c3aed' : 'transparent', color: active ? '#fff' : '#9ca3af', cursor: 'pointer', fontWeight: '600' }),
  startBtn: { padding: '1rem 3rem', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', marginBottom: '2rem' },
  arena: { width: '500px', maxWidth: '100%' },
  beatRow: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' },
  beatDot: (active, hit, rating) => ({
    width: '28px', height: '28px', borderRadius: '50%',
    background: hit ? (RATING_COLORS[rating] || '#6b7280') : active ? '#7c3aed' : '#1f2937',
    border: `2px solid ${active ? '#a78bfa' : '#374151'}`,
    transition: 'all 0.1s',
    boxShadow: active ? '0 0 12px #7c3aed' : 'none',
  }),
  tapZone: (active) => ({
    width: '200px', height: '200px', borderRadius: '50%',
    background: active ? '#7c3aed33' : '#0d1117',
    border: `4px solid ${active ? '#a78bfa' : '#1f2937'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.5rem',
    cursor: 'pointer',
    transition: 'all 0.05s',
    boxShadow: active ? '0 0 40px #7c3aed55' : 'none',
    userSelect: 'none',
    fontSize: '1rem', color: '#6b7280', fontWeight: '600',
  }),
  feedback: (rating) => ({
    textAlign: 'center', fontSize: '1.5rem', fontWeight: '800',
    color: RATING_COLORS[rating] || 'transparent',
    height: '2rem', marginBottom: '1rem', transition: 'all 0.1s',
    letterSpacing: '2px',
  }),
  scoreRow: { display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' },
  scoreItem: { textAlign: 'center' },
  scoreVal: { fontSize: '1.8rem', fontWeight: '700', color: '#e2e8f0' },
  scoreLabel: { color: '#6b7280', fontSize: '0.8rem' },
  instructions: { color: '#374151', fontSize: '0.85rem', textAlign: 'center' },
  resultCard: { background: '#0d1117', border: '1px solid #1f2937', borderRadius: '16px', padding: '2rem', textAlign: 'center', width: '400px', maxWidth: '100%' },
  resultTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#a78bfa', marginBottom: '1.5rem' },
  resultGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' },
  resultStat: { background: '#080c14', borderRadius: '10px', padding: '1rem' },
  resultStatVal: { fontSize: '1.6rem', fontWeight: '700', color: '#e2e8f0' },
  resultStatLabel: { color: '#6b7280', fontSize: '0.8rem' },
  playAgainBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' },
}

export default function Game() {
  const [phase, setPhase] = useState('idle') // idle | countdown | playing | result
  const [bpm, setBpm] = useState(120)
  const [score, setScore] = useState(0)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [totalBeats, setTotalBeats] = useState(16)
  const [beatResults, setBeatResults] = useState({})
  const [lastRating, setLastRating] = useState(null)
  const [tapActive, setTapActive] = useState(false)
  const [result, setResult] = useState(null)
  const [countdown, setCountdown] = useState(3)

  const wsRef = useRef(null)
  const beatReceivedAtRef = useRef({}) // beat_num -> performance.now() when beat arrived
  const currentBeatRef = useRef(0)
  const ratingTimerRef = useRef(null)

  const clearRating = () => {
    if (ratingTimerRef.current) clearTimeout(ratingTimerRef.current)
    ratingTimerRef.current = setTimeout(() => setLastRating(null), 600)
  }

  const sendTap = useCallback(() => {
    if (phase !== 'playing' || !wsRef.current) return
    const now = performance.now()
    const beat = currentBeatRef.current
    const beatReceivedAt = beatReceivedAtRef.current[beat] ?? now
    const offset_ms = now - beatReceivedAt  // ms since beat arrived (0 = perfect timing)
    wsRef.current.send(JSON.stringify({
      type: 'tap',
      beat,
      offset_ms,
    }))
    setTapActive(true)
    setTimeout(() => setTapActive(false), 100)
  }, [phase])

  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Space') { e.preventDefault(); sendTap() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sendTap])

  const startGame = () => {
    const token = localStorage.getItem('bs_token')
    const ws = new WebSocket(`${WS_URL}?token=${token}&bpm=${bpm}`)
    wsRef.current = ws
    setPhase('countdown')
    setScore(0)
    setCurrentBeat(0)
    setBeatResults({})
    setResult(null)
    setLastRating(null)
    beatReceivedAtRef.current = {}

    let countVal = 3
    setCountdown(countVal)
    const cdInterval = setInterval(() => {
      countVal--
      setCountdown(countVal)
      if (countVal <= 0) clearInterval(cdInterval)
    }, 1000)

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)

      if (msg.type === 'start') {
        setTotalBeats(msg.total_beats)
        setPhase('playing')
      }

      if (msg.type === 'beat') {
        currentBeatRef.current = msg.beat
        beatReceivedAtRef.current[msg.beat] = performance.now()
        setCurrentBeat(msg.beat)
        playClick()
      }

      if (msg.type === 'result') {
        setScore(msg.score)
        setLastRating(msg.rating)
        setBeatResults(prev => ({ ...prev, [msg.beat]: msg.rating }))
        clearRating()
        if (msg.rating === 'perfect') playPerfect()
        else if (msg.rating === 'good') playGood()
        else playMiss()
      }

      if (msg.type === 'game_over') {
        setPhase('result')
        setResult(msg)
        ws.close()
      }
    }

    ws.onerror = () => { setPhase('idle') }
  }

  if (phase === 'result' && result) {
    return (
      <div style={s.page}>
        <div style={s.resultCard}>
          <div style={s.resultTitle}>🎵 Session Complete</div>
          <div style={s.resultGrid}>
            <div style={s.resultStat}><div style={{ ...s.resultStatVal, color: '#a78bfa' }}>{result.score}</div><div style={s.resultStatLabel}>Score</div></div>
            <div style={s.resultStat}><div style={s.resultStatVal}>{result.accuracy}%</div><div style={s.resultStatLabel}>Accuracy</div></div>
            <div style={s.resultStat}><div style={{ ...s.resultStatVal, color: '#a78bfa' }}>{result.perfect}</div><div style={s.resultStatLabel}>Perfect</div></div>
            <div style={s.resultStat}><div style={{ ...s.resultStatVal, color: '#34d399' }}>{result.good}</div><div style={s.resultStatLabel}>Good</div></div>
            <div style={s.resultStat}><div style={{ ...s.resultStatVal, color: '#f87171' }}>{result.miss}</div><div style={s.resultStatLabel}>Miss</div></div>
            <div style={s.resultStat}><div style={s.resultStatVal}>{Math.abs(result.avg_offset_ms).toFixed(0)}ms</div><div style={s.resultStatLabel}>Avg Offset</div></div>
          </div>
          <button style={s.playAgainBtn} onClick={() => setPhase('idle')}>Play Again</button>
        </div>
      </div>
    )
  }

  if (phase === 'countdown') {
    return (
      <div style={s.page}>
        <div style={{ fontSize: '5rem', fontWeight: '900', color: '#a78bfa' }}>{countdown > 0 ? countdown : 'GO!'}</div>
        <div style={{ color: '#6b7280', marginTop: '1rem' }}>Get ready to tap!</div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.title}>🎵 BeatSync</div>
      <div style={s.sub}>Tap the circle (or press Space) on every beat</div>

      {phase === 'idle' && (
        <>
          <div style={{ color: '#9ca3af', marginBottom: '1rem', fontSize: '0.9rem' }}>Select BPM</div>
          <div style={s.bpmSelect}>
            {[80, 100, 120, 140, 160].map(b => (
              <button key={b} style={s.bpmBtn(bpm === b)} onClick={() => setBpm(b)}>{b}</button>
            ))}
          </div>
        </>
      )}

      {phase === 'playing' && (
        <div style={s.arena}>
          <div style={s.beatRow}>
            {Array.from({ length: totalBeats }, (_, i) => i + 1).map(n => (
              <div key={n} style={s.beatDot(currentBeat === n, !!beatResults[n], beatResults[n])} />
            ))}
          </div>

          <div style={s.scoreRow}>
            <div style={s.scoreItem}><div style={s.scoreVal}>{score}</div><div style={s.scoreLabel}>Score</div></div>
            <div style={s.scoreItem}><div style={s.scoreVal}>{currentBeat}/{totalBeats}</div><div style={s.scoreLabel}>Beat</div></div>
          </div>

          <div style={s.feedback(lastRating)}>{lastRating ? lastRating.toUpperCase() : ''}</div>
        </div>
      )}

      <div style={s.tapZone(tapActive)} onClick={sendTap} onTouchStart={(e) => { e.preventDefault(); sendTap() }}>
        {phase === 'idle' ? 'TAP' : phase === 'playing' ? '●' : ''}
      </div>

      {phase === 'idle' && (
        <button style={s.startBtn} onClick={startGame}>Start Game</button>
      )}

      <div style={s.instructions}>
        {phase === 'idle' ? 'Press Start, then tap in sync with the beats' : 'Tap on every beat — Space or click the circle'}
      </div>
      {phase === 'idle' && (
        <div style={{ color: '#4b5563', fontSize: '0.8rem', marginTop: '0.8rem' }}>
          🔊 Tip: Turn up your volume to hear the beat
        </div>
      )}
    </div>
  )
}
