import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'24px' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'42px', fontWeight:'800', color:'var(--gold)', letterSpacing:'0.04em' }}>SWELL</div>
        <div style={{ fontSize:'13px', color:'var(--text-muted)', marginTop:'4px' }}>Surf session tracker</div>
      </div>
      <SignUp />
    </div>
  )
}