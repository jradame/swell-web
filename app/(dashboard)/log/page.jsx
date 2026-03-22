'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SPOTS, REGIONS } from '@/lib/spots'

const BOARDS = ["5'10 shortboard","6'0 thruster","6'2 shortboard","6'4 step-up","7'6 funboard","8'0 mini-mal","9'0 longboard","9'0 gun","Bodyboard","Other"]

const inputStyle = {
  width: '100%', background: 'var(--card)', border: '0.5px solid var(--border-mid)',
  borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: '14px',
  color: 'var(--text)', outline: 'none', appearance: 'none', WebkitAppearance: 'none',
}

function FieldWrapper({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{label}</label>
      {children}
    </div>
  )
}

export default function LogSession() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ spot: '', date: today, waveHeight: '', duration: '', board: '', rating: 0, notes: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const handleSubmit = async () => {
    if (!form.spot || !form.date || !form.waveHeight || !form.duration) return
    setSaving(true)
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaved(true)
    setTimeout(() => router.push('/history'), 900)
  }

  if (saved) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--green-dim)', border: '1.5px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Session saved</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>Heading to your history...</div>
      </div>
    )
  }

  const canSave = form.spot && form.date && form.waveHeight && form.duration

  return (
    <div style={{ padding: '32px 20px 48px', maxWidth: '600px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '800', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1 }}>Log session</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>How was it out there?</div>
      </div>

      {/* Spot - grouped by region */}
      <FieldWrapper label="Spot">
        <div style={{ position: 'relative' }}>
          <select
            value={form.spot}
            onChange={e => set('spot', e.target.value)}
            required
            style={{ ...inputStyle, paddingRight: '36px', cursor: 'pointer' }}
          >
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
      </FieldWrapper>

      <FieldWrapper label="Date">
        <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required style={inputStyle}/>
      </FieldWrapper>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <FieldWrapper label="Wave height (ft)">
          <input type="number" min="0" max="50" step="0.5" placeholder="e.g. 4" value={form.waveHeight} onChange={e => set('waveHeight', e.target.value)} required style={inputStyle}/>
        </FieldWrapper>
        <FieldWrapper label="Duration (min)">
          <input type="number" min="0" max="480" placeholder="e.g. 90" value={form.duration} onChange={e => set('duration', e.target.value)} required style={inputStyle}/>
        </FieldWrapper>
      </div>

      <FieldWrapper label="Board">
        <div style={{ position: 'relative' }}>
          <select value={form.board} onChange={e => set('board', e.target.value)} style={{ ...inputStyle, paddingRight: '36px', cursor: 'pointer' }}>
            <option value="">Select a board (optional)</option>
            {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </FieldWrapper>

      <FieldWrapper label="Session rating">
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => set('rating', n)} style={{
              flex: 1, padding: '12px 4px',
              background: form.rating >= n ? 'var(--gold-dim)' : 'var(--card)',
              border: form.rating >= n ? '0.5px solid var(--gold)' : '0.5px solid var(--border)',
              borderRadius: 'var(--radius-md)', fontSize: '18px', transition: 'all 0.12s', lineHeight: 1,
              color: form.rating >= n ? 'var(--gold)' : 'var(--text-muted)',
            }}>
              {form.rating >= n ? '★' : '☆'}
            </button>
          ))}
        </div>
      </FieldWrapper>

      <FieldWrapper label="Notes">
        <textarea rows={4} placeholder="How were the conditions? Anything notable?" value={form.notes} onChange={e => set('notes', e.target.value)} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}/>
      </FieldWrapper>

      <button onClick={handleSubmit} disabled={!canSave || saving} style={{
        width: '100%', padding: '16px',
        background: canSave && !saving ? 'var(--gold)' : 'var(--card)',
        color: canSave && !saving ? 'var(--bg)' : 'var(--text-muted)',
        borderRadius: 'var(--radius-lg)', fontSize: '15px', fontWeight: '500',
        fontFamily: 'var(--font-body)', transition: 'all 0.15s',
        cursor: canSave && !saving ? 'pointer' : 'not-allowed',
      }}>
        {saving ? 'Saving...' : 'Save session'}
      </button>

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
        select option { background: #1B2D3F; color: #f1f5f9; }
        optgroup { color: #94a3b8; font-size: 11px; }
        input::placeholder, textarea::placeholder { color: var(--text-muted); }
        input:focus, select:focus, textarea:focus { border-color: var(--gold) !important; }
      `}</style>
    </div>
  )
}