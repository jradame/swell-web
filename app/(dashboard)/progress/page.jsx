'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function StatCard({ label, value, sub, accent = 'var(--gold)' }) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)', padding: '16px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '800', color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: accent, marginTop: '6px' }}>{sub}</div>}
    </div>
  )
}

export default function Progress() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(d => { setSessions(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const now = new Date()

  const thisMonthSessions = sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const avgRating = sessions.length ? (sessions.reduce((acc, s) => acc + (parseInt(s.rating) || 0), 0) / sessions.length).toFixed(1) : '--'
  const avgWave = sessions.length ? (sessions.reduce((acc, s) => acc + parseFloat(s.waveHeight || 0), 0) / sessions.length).toFixed(1) : '--'
  const maxWave = sessions.length ? Math.max(...sessions.map(s => parseFloat(s.waveHeight || 0))) : '--'
  const totalMinutes = sessions.reduce((acc, s) => acc + parseInt(s.duration || 0), 0)
  const totalHours = totalMinutes > 0 ? (totalMinutes / 60).toFixed(1) : '--'

  const calcStreak = () => {
    if (!sessions.length) return 0
    const dates = [...new Set(sessions.map(s => s.date))].sort().reverse()
    let streak = 0
    let current = new Date(); current.setHours(0,0,0,0)
    for (const dateStr of dates) {
      const d = new Date(dateStr + 'T00:00:00'); d.setHours(0,0,0,0)
      const diff = (current - d) / (1000*60*60*24)
      if (diff <= 1) { streak++; current = d } else break
    }
    return streak
  }
  const streak = calcStreak()

  const spotCounts = sessions.reduce((acc, s) => { if (s.spot) acc[s.spot] = (acc[s.spot] || 0) + 1; return acc }, {})
  const topSpots = Object.entries(spotCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCount = topSpots.length ? topSpots[0][1] : 1

  const monthlyData = (() => {
    const months = []
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString('en-US', { month: 'short' })
      const count = sessions.filter(s => { const sd = new Date(s.date); return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear() }).length
      months.push({ label, count })
    }
    return months
  })()
  const maxMonthly = Math.max(...monthlyData.map(m => m.count), 1)

  return (
    <div style={{ padding: '32px 20px 48px', maxWidth: '960px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '800', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1 }}>Progress</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>{now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
      ) : sessions.length === 0 ? (
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px dashed var(--border-mid)', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Log some sessions to see your progress</div>
          <Link href="/log" style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--gold)', color: 'var(--bg)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: '500' }}>Log a session</Link>
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border-mid)', padding: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '56px', fontWeight: '800', color: streak > 0 ? 'var(--primary)' : 'var(--text-muted)', lineHeight: 1, minWidth: '80px' }}>{streak}</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text)' }}>Day streak</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{streak > 0 ? 'Keep it going' : 'Log a session today to start a streak'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <StatCard label="Sessions total" value={sessions.length} sub={`${thisMonthSessions.length} this month`} />
            <StatCard label="Avg rating" value={avgRating} sub="out of 5" accent="var(--amber)" />
            <StatCard label="Avg wave height" value={avgWave !== '--' ? `${avgWave} ft` : '--'} sub={maxWave !== '--' ? `Best: ${maxWave} ft` : ''} accent="var(--primary)" />
            <StatCard label="Time in water" value={totalHours !== '--' ? `${totalHours}h` : '--'} sub={`${totalMinutes} minutes total`} />
          </div>

          <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Sessions by month</div>
            <div style={{ display: 'flex', gap: '12px', height: '80px', alignItems: 'flex-end' }}>
              {monthlyData.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.count > 0 ? m.count : ''}</div>
                  <div style={{ width: '100%', height: m.count > 0 ? `${Math.max((m.count / maxMonthly) * 52, 6)}px` : '4px', background: i === 3 ? 'var(--primary)' : 'var(--primary-dim)', borderRadius: '4px 4px 0 0', border: m.count === 0 ? '0.5px solid var(--border)' : 'none' }}/>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {topSpots.length > 0 && (
            <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Top spots</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topSpots.map(([spot, count]) => (
                  <div key={spot}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text)' }}>{spot}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{count} session{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(count / maxCount) * 100}%`, background: 'var(--primary)', borderRadius: '3px' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
