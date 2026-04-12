import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(26,23,20,0.08)', background: '#023341', marginTop: 64 }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#ff6b00', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 14, color: '#fff' }}>Q</span>
            </div>
            <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-0.3px' }}>quelessly.</span>
          </div>

          {/* Nav links */}
          <nav style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 24px' }}>
            {[
              ['About', '/about'],
              ['Contact', '/contact'],
              ['Privacy Policy', '/privacy'],
              ['Terms & Conditions', '/terms'],
              ['Refund Policy', '/refunds'],
            ].map(([label, href]) => (
              <Link key={label} href={href}
                style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Mono', monospace" }}>
            © {new Date().getFullYear()} Quelessly. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  )
}