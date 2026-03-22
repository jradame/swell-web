// Reusable grouped spot selector
// Usage: <SpotSelect value={spotId} onChange={setSpotId} />
// For LogSession (returns spot name): <SpotSelect value={spotName} onChange={setSpotName} nameMode />

import { SPOTS, REGIONS } from '@/lib/spots'

const selectStyle = {
  width: '100%',
  background: 'var(--card-alt)',
  border: '0.5px solid var(--border-mid)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text)',
  fontSize: '15px',
  fontWeight: '500',
  fontFamily: 'var(--font-body)',
  padding: '7px 32px 7px 12px',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  outline: 'none',
}

export default function SpotSelect({ value, onChange, nameMode = false }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={selectStyle}
      >
        <option value="" disabled>Select a spot</option>
        {REGIONS.map(region => (
          <optgroup key={region} label={region}>
            {SPOTS.filter(s => s.region === region).map(s => (
              <option key={s.id} value={nameMode ? s.name : s.id}>
                {s.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <svg
        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        width="12" height="12" viewBox="0 0 12 12" fill="none"
      >
        <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <style>{`select option { background: #243447; color: #fff; } optgroup { color: var(--text-muted); font-size: 11px; } select:focus { border-color: var(--gold) !important; }`}</style>
    </div>
  )
}