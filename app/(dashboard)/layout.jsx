'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: (a) => (<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={a ? 'var(--gold)' : 'var(--text-muted)'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 20V13h6v7" stroke={a ? 'var(--gold)' : 'var(--text-muted)'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>) },
  { to: '/log', label: 'Log', icon: (a) => (<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={a ? 'var(--gold)' : 'var(--text-muted)'} strokeWidth="1.7" /><path d="M11 7v8M7 11h8" stroke={a ? 'var(--gold)' : 'var(--text-muted)'} strokeWidth="1.7" strokeLinecap="round" /></svg>) },
  { to: '/history', label: 'History', icon: (a) => (<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h16M3 16h10" stroke={a ? 'var(--gold)' : 'var(--text-muted)'} strokeWidth="1.7" strokeLinecap="round" /></svg>) },
  { to: '/progress', label: 'Progress', icon: (a) => (<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 17l4.5-5.5 4 3 4.5-7 3-2" stroke={a ? 'var(--gold)' : 'var(--text-muted)'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>) },
]

function isActive(pathname, to) {
  return to === '/' ? pathname === '/' : pathname.startsWith(to)
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside className="sidebar-desktop" style={{ width: 'var(--sidebar-w)', background: 'var(--surface)', borderRight: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 12px', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '0 8px 28px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800', letterSpacing: '0.04em', color: 'var(--gold)', textTransform: 'uppercase' }}>Swell</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Surf session tracker</div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(pathname, item.to)
            return (
              <Link key={item.to} href={item.to} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: 'var(--radius-md)', background: active ? 'var(--gold-dim)' : 'transparent', border: active ? '0.5px solid var(--border-mid)' : '0.5px solid transparent' }}>
                {item.icon(active)}
                <span style={{ fontSize: '14px', fontWeight: '500', color: active ? 'var(--gold-text)' : 'var(--text-secondary)' }}>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div style={{ marginTop: 'auto', padding: '0 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserButton afterSignOutUrl="/sign-in" />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Account</span>
        </div>
      </aside>
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
        <div style={{ flex: 1 }}>{children}</div>
        <nav className="bottom-nav-mobile" style={{ height: 'var(--nav-h)', background: 'var(--surface)', borderTop: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', position: 'sticky', bottom: 0, zIndex: 100 }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(pathname, item.to)
            return (
              <Link key={item.to} href={item.to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: active ? 'var(--gold-dim)' : 'transparent' }}>
                {item.icon(active)}
                <span style={{ fontSize: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em', color: active ? 'var(--gold-text)' : 'var(--text-muted)' }}>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </main>
      <style>{`.sidebar-desktop{display:none!important}.bottom-nav-mobile{display:flex}.main-content{margin-left:0}@media(min-width:768px){.sidebar-desktop{display:flex!important}.bottom-nav-mobile{display:none!important}.main-content{margin-left:var(--sidebar-w)}}`}</style>
    </div>
  )
}
