'use client'

import Footer from '@/components/Footer'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', color: '#1a1714', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`${FONTS} * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ width: 44, height: 44, background: '#ff6b00', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: '#fff' }}>Q</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 38, color: '#1a1714', letterSpacing: '-1.5px', marginBottom: 10 }}>Terms & Conditions</h1>
          <p style={{ color: '#8a7f72', fontSize: 13, fontFamily: "'DM Mono', monospace" }}>Last updated: April 2026</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <Section title="1. Platform nature">
            <p>Quelessly is a technology platform that facilitates food ordering between students and canteen vendors. Quelessly is not a food provider, restaurant, or delivery service. We do not prepare, cook, handle, or deliver any food items.</p>
          </Section>

          <Section title="2. Vendor responsibility">
            <p>All food preparation, quality, hygiene, and service is the sole responsibility of the vendor (canteen operator) listed on the platform. Quelessly makes no warranties regarding food quality, preparation standards, or allergen information. Any disputes regarding food quality, missing items, or wrong orders must be raised directly with the vendor.</p>
          </Section>

          <Section title="3. Limitation of liability">
            <p>Quelessly shall not be held liable for any harm, illness, loss, or damage arising from food consumed that was ordered through the platform. Our liability is strictly limited to the technology service we provide. In no event shall Quelessly's liability exceed the transaction amount of the specific order in question.</p>
          </Section>

          <Section title="4. Payments">
            <p>Payments are processed securely via Razorpay. By placing an order, you authorise Quelessly to charge the displayed amount. Prices displayed are set by vendors and may change without prior notice.</p>
          </Section>

          <Section title="5. Order cancellations">
            <p>Once an order is placed and payment is confirmed, cancellations are subject to the vendor's acceptance. If a vendor is unable to fulfil an order, a full refund will be processed. See our Refund Policy for details.</p>
          </Section>

          <Section title="6. Acceptable use">
            <p>You agree not to misuse the platform, place fraudulent orders, or attempt to manipulate the payment system. Quelessly reserves the right to block access to users who violate these terms.</p>
          </Section>

          <Section title="7. Governing law">
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Pune, Maharashtra.</p>
          </Section>

          <Section title="8. Contact">
            <p>For any queries regarding these terms, contact us at <OLink href="mailto:support@quelessly.com">support@quelessly.com</OLink>.</p>
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

function OLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{ color: '#ff6b00', textDecoration: 'none', fontWeight: 500 }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}>
      {children}
    </a>
  )
}