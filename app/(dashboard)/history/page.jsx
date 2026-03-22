'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const FILTERS = ['All', 'This month', 'Best rated', 'Biggest waves']

function StarRating({ rating = 0, size = 10 }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 10 10">
          <polygon points="5,0 6.2,3.5 10,3.5 7,5.7 8.1,9.5 5,7.3 1.9,9.5 3,5.7 0,3.5 3.8,3.5"
            fill={n <= rating ? 'var(--amber)' : 'var(--text-muted)'} opacity={n <= rating ? 1 : 0.35}/>
        </svg>
      ))}
    </div>
  )
}

function Pill({ children, color = 'primary' }) {
  const colors = {
    primary: { bg: 'var(--primary-dim)', color: 'var(--primary)' },
    green:   { bg: 'var(--green-dim)',   color: 'var(--green)'   },
    amber:   { bg: 'var(--amber-dim)',   color: 'var(--amber)'   },
  }
  const c = colors[color] || colors.primary
  return (
    <span style={{ fontSize: '11px', fontWeight: '500', padding: '4px 10px', borderRadius: '20px', background: c.bg, color: c.color, fontFamily: 'var(--font-mono)' }}>
      {children}
    </span>
  )
}

export default function History() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const loadSessions = () => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(d => { setSessions(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { loadSessions() }, [])

  const handleDelete = async (id) => {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    setSessions(prev => prev.filter(s => s.id !== id))
    setConfirmDelete(null)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filtered = (() => {
    let list = [...sessions]
    if (filter === 'This month') {
      const now = new Date()
      list = list.filter(s => { const d = new Date(s.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
    } else if (filter === 'Best rated') {
      list = list.slice().sort((a, b) => (parseInt(b.rating) || 0) - (parseInt(a.rating) || 0))
    } else if (filter === 'Biggest waves') {
      list = list.slice().sort((a, b) => parseFloat(b.waveHeight) - parseFloat(a.waveHeight))
    }
    return list
  })()

  const ratingColor = (r) => { const n = parseInt(r) || 0; return n >= 4 ? 'green' : n >= 3 ? 'amber' : 'primary' }

  return (
    <div style={{ padding: '32px 0 40px', maxWidth: '960px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '800', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1 }}>History</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{sessions.length} session{sessions.length !== 1 ? 's' : ''} logged</div>
        </div>
        <Link href="/log" style={{ padding: '9px 16px', background: 'var(--gold)', color: 'var(--bg)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: '500' }}>+ Log</Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '0 20px 16px', overflowX: 'auto' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0,
            background: filter === f ? 'var(--gold-dim)' : 'var(--card)',
            border: filter === f ? '0.5px solid var(--gold)' : '0.5px solid var(--border)',
            color: filter === f ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer',
          }}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ margin: '0 20px', background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px dashed var(--border-mid)', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{sessions.length === 0 ? 'No sessions yet' : 'No sessions match this filter'}</div>
          {sessions.length === 0 && (
            <Link href="/log" style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--gold)', color: 'var(--bg)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: '500' }}>
              Log your first session
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 20px' }}>
          {filtered.map(s => (
            <div key={s.id} style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text)' }}>{s.spot}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{formatDate(s.date)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StarRating rating={parseInt(s.rating) || 0} />
                  <button onClick={() => setConfirmDelete(s.id)} style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.5 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M11 3.5l-.7 7.5a1 1 0 01-1 .9H4.7a1 1 0 01-1-.9L3 3.5" stroke="var(--red)" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <Pill>{s.waveHeight} ft</Pill>
                <Pill>{s.duration} min</Pill>
                {s.rating > 0 && <Pill color={ratingColor(s.rating)}>{s.rating}/5</Pill>}
                {s.board && <Pill>{s.board}</Pill>}
              </div>
              {s.notes && (
                <div style={{ marginTop: '10px', padding: '10px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, borderLeft: '2px solid var(--gold)' }}>
                  {s.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--border-mid)', padding: '24px', maxWidth: '320px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text)', marginBottom: '8px' }}>Delete session?</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>This can't be undone.</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '12px', background: 'var(--card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, padding: '12px', background: 'var(--red-dim)', border: '0.5px solid var(--red)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--red)', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
