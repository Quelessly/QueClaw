'use client'

import Footer from '@/components/Footer'


export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', color: '#1a1714', fontFamily: "var(--font-dm-sans), sans-serif" }}>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, background: '#ff6b00', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <span style={{ fontFamily: "var(--font-fraunces), serif", fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: '#fff' }}>Q</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-fraunces), serif", fontStyle: 'italic', fontWeight: 700, fontSize: 38, color: '#1a1714', letterSpacing: '-1.5px', marginBottom: 10 }}>Contact Us</h1>
          <p style={{ color: '#8a7f72', fontSize: 16 }}>We're here to help. Reach out anytime.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid rgba(26,23,20,0.07)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Email', content: <OLink href="mailto:support@quelessly.com" large>support@quelessly.com</OLink> },
              { label: 'Response Time', content: <p style={{ color: '#3d3830', fontSize: 15 }}>We typically respond within 24–48 business hours.</p> },
              { label: 'Business Hours', content: <p style={{ color: '#3d3830', fontSize: 15 }}>Monday – Saturday, 9:00 AM – 6:00 PM IST</p> },
              { label: 'Location', content: <p style={{ color: '#3d3830', fontSize: 15 }}>Pune, Maharashtra, India</p> },
            ].map(({ label, content }, i, arr) => (
              <div key={label}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#8a7f72', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, fontFamily: "var(--font-dm-mono), monospace" }}>{label}</p>
                {content}
                {i < arr.length - 1 && <div style={{ borderBottom: '1px solid rgba(26,23,20,0.06)', marginTop: 20 }} />}
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid rgba(26,23,20,0.07)', borderRadius: 20, padding: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#8a7f72', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, fontFamily: "var(--font-dm-mono), monospace" }}>For order issues</p>
            <p style={{ color: '#3d3830', fontSize: 14, lineHeight: 1.85 }}>
              If you have an issue with a specific order — wrong items, quality concerns, or missing food — please contact the vendor directly at the canteen. Quelessly is a technology platform and does not handle food preparation or delivery. For payment-related issues, write to us at{' '}
              <OLink href="mailto:support@quelessly.com">support@quelessly.com</OLink>{' '}
              with your order ID.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function OLink({ href, children, large }: { href: string; children: React.ReactNode; large?: boolean }) {
  return (
    <a href={href}
      style={{ color: '#ff6b00', textDecoration: 'none', fontWeight: 500, fontSize: large ? 17 : undefined, fontFamily: large ? "var(--font-dm-mono), monospace" : undefined }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}>
      {children}
    </a>
  )
}