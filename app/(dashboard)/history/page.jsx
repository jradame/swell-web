'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SPOTS, REGIONS } from '@/lib/spots'

const BOARDS = ["5'10 shortboard","6'0 thruster","6'2 shortboard","6'4 step-up","7'6 funboard","8'0 mini-mal","9'0 longboard","9'0 gun","Bodyboard","Other"]

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

const fieldLabelStyle = {
  display: 'block', fontSize: '11px', color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px',
}

const inputStyle = {
  width: '100%', background: 'var(--card)', border: '0.5px solid var(--border-mid)',
  borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: '14px',
  color: 'var(--text)', outline: 'none', appearance: 'none', WebkitAppearance: 'none',
}

export default function History() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editSession, setEditSession] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editSaving, setEditSaving] = useState(false)

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

  const openEdit = (s) => {
    setEditSession(s)
    setEditForm({
      spot: s.spot,
      date: s.date,
      waveHeight: s.waveHeight,
      duration: s.duration,
      board: s.board || '',
      rating: parseInt(s.rating) || 0,
      notes: s.notes || '',
    })
  }

  const setField = (field, val) => setEditForm(prev => ({ ...prev, [field]: val }))

  const handleEditSubmit = async () => {
    if (!editForm.spot || !editForm.date || !editForm.waveHeight || !editForm.duration) return
    setEditSaving(true)
    await fetch(`/api/sessions/${editSession.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setSessions(prev => prev.map(s => s.id === editSession.id ? { ...s, ...editForm } : s))
    setEditSession(null)
    setEditSaving(false)
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
  const canSave = editForm.spot && editForm.date && editForm.waveHeight && editForm.duration

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
            color: filter === f ? 'var(--gold-text)' : 'var(--text-muted)', cursor: 'pointer',
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
                  <button onClick={() => openEdit(s)} style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.5 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
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

      {editSession && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}
          onClick={e => { if (e.target === e.currentTarget) setEditSession(null) }}
        >
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', border: '0.5px solid var(--border-mid)', padding: '24px 20px 48px', width: '100%', maxWidth: '600px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Edit session</div>
              <button onClick={() => setEditSession(null)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.7 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={fieldLabelStyle}>Spot</label>
              <div style={{ position: 'relative' }}>
                <select value={editForm.spot} onChange={e => setField('spot', e.target.value)} style={{ ...inputStyle, paddingRight: '36px', cursor: 'pointer' }}>
                  <option value="" disabled>Select a spot</option>
                  {REGIONS.map(region => (
                    <optgroup key={region} label={region}>
                      {SPOTS.filter(s => s.region === region).map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 5l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={fieldLabelStyle}>Date</label>
              <input type="date" value={editForm.date} onChange={e => setField('date', e.target.value)} style={inputStyle}/>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={fieldLabelStyle}>Wave height (ft)</label>
                <input type="number" min="0" max="50" step="0.5" placeholder="e.g. 4" value={editForm.waveHeight} onChange={e => setField('waveHeight', e.target.value)} style={inputStyle}/>
              </div>
              <div>
                <label style={fieldLabelStyle}>Duration (min)</label>
                <input type="number" min="0" max="480" placeholder="e.g. 90" value={editForm.duration} onChange={e => setField('duration', e.target.value)} style={inputStyle}/>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={fieldLabelStyle}>Board</label>
              <div style={{ position: 'relative' }}>
                <select value={editForm.board} onChange={e => setField('board', e.target.value)} style={{ ...inputStyle, paddingRight: '36px', cursor: 'pointer' }}>
                  <option value="">Select a board (optional)</option>
                  {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 5l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={fieldLabelStyle}>Session rating</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setField('rating', n)} style={{
                    flex: 1, padding: '12px 4px',
                    background: editForm.rating >= n ? 'var(--gold-dim)' : 'var(--card)',
                    border: editForm.rating >= n ? '0.5px solid var(--gold)' : '0.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)', fontSize: '18px', transition: 'all 0.12s', lineHeight: 1,
                    color: editForm.rating >= n ? 'var(--gold)' : 'var(--text-muted)',
                  }}>
                    {editForm.rating >= n ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={fieldLabelStyle}>Notes</label>
              <textarea rows={3} placeholder="How were the conditions?" value={editForm.notes} onChange={e => setField('notes', e.target.value)} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}/>
            </div>

            <button onClick={handleEditSubmit} disabled={!canSave || editSaving} style={{
              width: '100%', padding: '16px',
              background: canSave && !editSaving ? 'var(--gold)' : 'var(--card)',
              color: canSave && !editSaving ? 'var(--bg)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-lg)', fontSize: '15px', fontWeight: '500',
              fontFamily: 'var(--font-body)', transition: 'all 0.15s',
              cursor: canSave && !editSaving ? 'pointer' : 'not-allowed',
            }}>
              {editSaving ? 'Saving...' : 'Save changes'}
            </button>

            <style>{`
              input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
              select option { background: #1B2D3F; color: #f1f5f9; }
              optgroup { color: #94a3b8; font-size: 11px; }
              input::placeholder, textarea::placeholder { color: var(--text-muted); }
              input:focus, select:focus, textarea:focus { border-color: var(--gold) !important; }
            `}</style>
          </div>
        </div>
      )}
    </div>
  )
}
