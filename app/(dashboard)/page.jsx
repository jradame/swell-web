'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SPOTS, REGIONS } from '@/lib/spots'

const mToFt = (m) => Math.round(m * 3.281)
const msToKt = (ms) => Math.round(ms * 1.944)

const getQuality = (waveHeightFt, windKt) => {
  if (waveHeightFt < 1.5) return 'Flat'
  if (windKt > 25) return 'Blown'
  if (windKt > 15 || waveHeightFt > 12) return 'Fair'
  return 'Clean'
}

async function fetchConditions(lat, lng) {
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_period,wave_direction&forecast_days=1`
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m&wind_speed_unit=ms`
  const [marineRes, weatherRes] = await Promise.all([fetch(marineUrl), fetch(weatherUrl)])
  if (!marineRes.ok || !weatherRes.ok) throw new Error('Failed')
  const [marineData, weatherData] = await Promise.all([marineRes.json(), weatherRes.json()])
  const waveHeightFt = mToFt(marineData.current.wave_height)
  const period = Math.round(marineData.current.wave_period)
  const windKt = msToKt(weatherData.current.wind_speed_10m)
  return { waveHeight: waveHeightFt, period, wind: windKt, quality: getQuality(waveHeightFt, windKt), fetchedAt: new Date() }
}

function StarRating({ rating = 0, size = 11 }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 10 10">
          <polygon points="5,0 6.2,3.5 10,3.5 7,5.7 8.1,9.5 5,7.3 1.9,9.5 3,5.7 0,3.5 3.8,3.5"
            fill={n <= rating ? 'var(--amber)' : 'var(--text-muted)'}
            opacity={n <= rating ? 1 : 0.35}/>
        </svg>
      ))}
    </div>
  )
}

function QualityBadge({ label }) {
  const colors = {
    'Clean': { bg: 'var(--green-dim)', color: 'var(--green)' },
    'Fair':  { bg: 'var(--amber-dim)', color: 'var(--amber)' },
    'Blown': { bg: 'var(--red-dim)',   color: 'var(--red)'   },
    'Flat':  { bg: 'var(--primary-dim)', color: 'var(--primary)' },
  }
  const c = colors[label] || colors['Fair']
  return (
    <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: c.bg, color: c.color }}>
      {label || '...'}
    </span>
  )
}

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState('West Coast')
  const [selectedSpotId, setSelectedSpotId] = useState('trestles')
  const [conditions, setConditions] = useState(null)
  const [condLoading, setCondLoading] = useState(true)
  const [condError, setCondError] = useState(false)
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  const regionSpots = SPOTS.filter(s => s.region === selectedRegion)
  const selectedSpot = SPOTS.find(s => s.id === selectedSpotId) || regionSpots[0]

  const handleRegionChange = (region) => {
    setSelectedRegion(region)
    const first = SPOTS.find(s => s.region === region)
    if (first) setSelectedSpotId(first.id)
  }

  useEffect(() => {
    if (!selectedSpot) return
    setCondLoading(true); setCondError(false); setConditions(null)
    fetchConditions(selectedSpot.lat, selectedSpot.lng)
      .then(d => { setConditions(d); setCondLoading(false) })
      .catch(() => { setCondError(true); setCondLoading(false) })
  }, [selectedSpotId])

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(d => { setSessions(Array.isArray(d) ? d : []); setSessionsLoading(false) })
      .catch(() => setSessionsLoading(false))
  }, [])

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  const totalSessions = sessions.length
  const thisMonth = sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const avgWave = sessions.length
    ? (sessions.reduce((acc, s) => acc + parseFloat(s.waveHeight || 0), 0) / sessions.length).toFixed(1)
    : '--'
  const recentSessions = sessions.slice(0, 4)

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ padding: '24px 20px 40px', maxWidth: '960px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{greeting}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 6vw, 48px)', fontWeight: '800', color: 'var(--gold)', textTransform: 'uppercase', lineHeight: 1 }}>
            {dayName}
          </div>
        </div>
        <div style={{ flexShrink: 0, paddingLeft: '12px', paddingTop: '4px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            {dateStr}
          </div>
        </div>
      </div>

      {/* Conditions card */}
      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border-mid)', marginBottom: '20px', overflow: 'hidden' }}>

        {/* Region tabs scrollable */}
        <div style={{ display: 'flex', gap: '6px', padding: '14px 16px 10px', overflowX: 'auto', borderBottom: '0.5px solid var(--border)' }}>
          {REGIONS.map(r => (
            <button key={r} onClick={() => handleRegionChange(r)} style={{
              padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
              whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', transition: 'all 0.12s',
              background: selectedRegion === r ? 'var(--gold-dim)' : 'transparent',
              border: selectedRegion === r ? '0.5px solid var(--gold)' : '0.5px solid var(--border)',
              color: selectedRegion === r ? 'var(--gold)' : 'var(--text-muted)',
            }}>
              {r}
            </button>
          ))}
        </div>

        {/* Spot dropdown for selected region + quality badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '260px' }}>
            <select
              value={selectedSpotId}
              onChange={e => setSelectedSpotId(e.target.value)}
              style={{
                width: '100%', background: 'var(--card-alt)', border: '0.5px solid var(--border-mid)',
                borderRadius: 'var(--radius-md)', color: 'var(--text)', fontSize: '15px',
                fontWeight: '500', fontFamily: 'var(--font-body)', padding: '7px 32px 7px 12px',
                cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', outline: 'none',
              }}
            >
              {regionSpots.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <QualityBadge label={condLoading ? '...' : condError ? 'N/A' : conditions?.quality} />
        </div>

        {/* Conditions data */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '0.5px solid var(--border)' }}>
          {[
            { val: condLoading ? '—' : condError ? '—' : `${conditions?.waveHeight}`, unit: 'ft', label: 'Wave height' },
            { val: condLoading ? '—' : condError ? '—' : `${conditions?.period}`,     unit: 's',  label: 'Period'      },
            { val: condLoading ? '—' : condError ? '—' : `${conditions?.wind}`,       unit: 'kt', label: 'Wind'        },
          ].map((c, i) => (
            <div key={i} style={{ padding: '16px 8px', textAlign: 'center', borderRight: i < 2 ? '0.5px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 5vw, 36px)', fontWeight: '800', color: condLoading ? 'var(--text-muted)' : 'var(--text)', lineHeight: 1, whiteSpace: 'nowrap' }}>
                {c.val}
                {!condLoading && !condError && <span style={{ fontSize: 'clamp(11px, 2.5vw, 14px)', color: 'var(--primary)', marginLeft: '2px', fontFamily: 'var(--font-body)' }}>{c.unit}</span>}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '8px 16px', fontSize: '10px', color: 'var(--text-muted)', borderTop: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Offshore swell · Open-Meteo Marine</span>
          {conditions?.fetchedAt && <span>Updated {conditions.fetchedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>}
        </div>
        <style>{`select option { background: #243447; color: #fff; } select:focus { border-color: var(--gold) !important; }`}</style>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {[
          { label: 'Total sessions', val: sessionsLoading ? '—' : totalSessions, sub: totalSessions === 0 ? 'Log your first' : `${thisMonth} this month` },
          { label: 'Avg wave height', val: sessionsLoading ? '—' : avgWave, sub: avgWave === '--' ? 'No data yet' : 'feet' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)', padding: '20px 24px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: '800', color: 'var(--text)', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '12px', color: 'var(--gold)', marginTop: '8px' }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <style>{`.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; } @media (min-width: 768px) { .stat-grid { gap: 16px; } }`}</style>

      {/* Recent sessions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent sessions</div>
        <Link href="/history" style={{ fontSize: '13px', color: 'var(--gold)' }}>See all →</Link>
      </div>

      {sessionsLoading ? (
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
      ) : recentSessions.length === 0 ? (
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px dashed var(--border-mid)', padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>No sessions logged yet</div>
          <Link href="/log" style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--gold)', color: 'var(--bg)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: '500' }}>Log your first session</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentSessions.map(s => (
            <div key={s.id} style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.spot}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(s.date)} · {s.duration} min</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <div style={{ fontSize: '14px', color: 'var(--primary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{s.waveHeight} ft</div>
                <StarRating rating={parseInt(s.rating) || 0} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}