import Footer from '@/components/Footer'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', color: '#1a1714', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`${FONTS} * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ width: 44, height: 44, background: '#ff6b00', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: '#fff' }}>Q</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 38, color: '#1a1714', letterSpacing: '-1.5px', marginBottom: 10 }}>Privacy Policy</h1>
          <p style={{ color: '#8a7f72', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>Last updated: April 2026</p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

          <Section title="1. Who we are">
            <p>Quelessly is a proprietorship operated from Pune, Maharashtra, India. We provide a QR-based food ordering platform for college canteens. You can reach us at{' '}
              <Link href="mailto:support@quelessly.com">support@quelessly.com</Link>.
            </p>
          </Section>

          <Section title="2. Information we collect">
            <p>When you use Quelessly, we may collect:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li style={{ color: '#8a7f72', fontSize: 14 }}>Order details (items ordered, quantity, total amount)</li>
              <li style={{ color: '#8a7f72', fontSize: 14 }}>Payment transaction data (processed securely via Razorpay — we do not store card details)</li>
              <li style={{ color: '#8a7f72', fontSize: 14 }}>Device and browser information for analytics</li>
            </ul>
            <p style={{ marginTop: 12 }}>We do not require you to create an account or provide personal information to browse menus or place orders.</p>
          </Section>

          <Section title="3. How we use your information">
            <p>We use collected information to:</p>
            <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li style={{ color: '#8a7f72', fontSize: 14 }}>Process and fulfil your food orders</li>
              <li style={{ color: '#8a7f72', fontSize: 14 }}>Display your order status in real time</li>
              <li style={{ color: '#8a7f72', fontSize: 14 }}>Improve platform performance and reliability</li>
              <li style={{ color: '#8a7f72', fontSize: 14 }}>Resolve disputes and respond to support queries</li>
            </ul>
          </Section>

          <Section title="4. Payment data">
            <p>All payments are processed by Razorpay. Quelessly does not store your card numbers, UPI IDs, or banking credentials. Razorpay's privacy policy governs payment data handling.</p>
          </Section>

          <Section title="5. Data sharing">
            <p>We do not sell your personal data. We share order information with the relevant vendor (canteen) solely to fulfil your order. We do not share data with advertisers or third-party marketers.</p>
          </Section>

          <Section title="6. Data retention">
            <p>Order data is retained for up to 90 days for dispute resolution purposes, after which it is deleted.</p>
          </Section>

          <Section title="7. Your rights">
            <p>You may request deletion of your order data by emailing{' '}
              <Link href="mailto:support@quelessly.com">support@quelessly.com</Link>.
              {' '}We will process requests within 7 business days.
            </p>
          </Section>

          <Section title="8. Changes to this policy">
            <p>We may update this policy from time to time. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
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
      <div style={{ color: '#3d3830', fontSize: 15, lineHeight: 1.85, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </section>
  )
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{ color: '#ff6b00', textDecoration: 'none', fontWeight: 500 }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}>
      {children}
    </a>
  )
}