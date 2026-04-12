'use client'

import Footer from '@/components/Footer'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`

export default function RefundsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', color: '#1a1714', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`${FONTS} * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ width: 44, height: 44, background: '#ff6b00', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: '#fff' }}>Q</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 38, color: '#1a1714', letterSpacing: '-1.5px', marginBottom: 10 }}>Refund & Cancellation Policy</h1>
          <p style={{ color: '#8a7f72', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>Last updated: April 2026</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <Section title="Our role">
            <p>Quelessly is a technology platform. We do not prepare or serve food. All food orders are fulfilled by independent vendors (canteen operators). Refund eligibility depends on the nature of the issue.</p>
          </Section>

          <Section title="Eligible refund cases">
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Payment deducted, order not placed', 'Full refund within 5–7 business days.'],
                ['Vendor unable to fulfil order', 'Full refund within 5–7 business days.'],
                ['Duplicate payment charged', 'Full refund of the duplicate amount within 5–7 business days.'],
                ['Technical error during payment', 'Full refund within 5–7 business days upon verification.'],
              ].map(([bold, rest]) => (
                <li key={bold} style={{ color: '#8a7f72', fontSize: 14, lineHeight: 1.7 }}>
                  <span style={{ color: '#1a1714', fontWeight: 600 }}>{bold}:</span>{' '}{rest}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Non-eligible cases">
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Dissatisfaction with food quality, taste, or quantity — please contact the vendor directly at the canteen.',
                'Wrong items ordered by the customer.',
                'Change of mind after order is confirmed and being prepared.',
                'Orders already marked as "Ready" or "Completed".',
              ].map(item => (
                <li key={item} style={{ color: '#8a7f72', fontSize: 14, lineHeight: 1.7 }}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section title="Food quality complaints">
            <p>Quelessly does not prepare food. Any complaints regarding food quality, hygiene, or incorrect items are the responsibility of the vendor. Please raise such issues directly with the canteen staff. Quelessly will not process refunds for food quality disputes.</p>
          </Section>

          <Section title="Refund timeline">
            <p>Approved refunds are processed within <strong style={{ color: '#1a1714', fontWeight: 700 }}>5–7 business days</strong> to the original payment method (UPI, card, or net banking). Actual credit time may vary depending on your bank.</p>
          </Section>

          <Section title="How to request a refund">
            <p>Email us at <OLink href="mailto:support@quelessly.com">support@quelessly.com</OLink> with:</p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Your Order ID', 'Date and time of order', 'Reason for refund request', 'Screenshot of payment (if applicable)'].map(item => (
                <li key={item} style={{ color: '#8a7f72', fontSize: 14 }}>{item}</li>
              ))}
            </ul>
            <p>We will respond within 48 business hours.</p>
          </Section>
        </div>
      </div>
      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: '#023341', letterSpacing: '-0.3px', marginBottom: 12 }}>{title}</h2>
      <div style={{ color: '#3d3830', fontSize: 15, lineHeight: 1.85, display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </section>
  )
}

function OLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{ color: '#ff6b00', textDecoration: 'none', fontWeight: 500 }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}>
      {children}
    </a>
  )
}