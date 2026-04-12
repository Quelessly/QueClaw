'use client'

import Footer from '@/components/Footer'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', color: '#1a1714', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`${FONTS} * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ width: 44, height: 44, background: '#ff6b00', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: '#fff' }}>Q</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 38, color: '#1a1714', letterSpacing: '-1.5px', marginBottom: 10 }}>About Quelessly</h1>
          <p style={{ color: '#8a7f72', fontSize: 17, lineHeight: 1.6 }}>QR-based food ordering for college canteens.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <Section title="What we do">
            <p>Quelessly is a digital platform that enables students to discover menus, place food orders, and make payments at their college canteen — all by scanning a QR code. No app download required, no standing in queues.</p>
          </Section>
          <Section title="How it works">
            <p>Each vendor (canteen) on Quelessly gets a unique QR code. Students scan it, browse the menu, add items to cart, and pay via UPI or card. The vendor receives the order instantly on their dashboard and prepares it. Students are notified when their order is ready.</p>
          </Section>
          <Section title="Our role">
            <p>Quelessly is a technology platform. We connect students with canteen vendors. We do not prepare, handle, or deliver any food. All food preparation and service is carried out solely by the respective vendors listed on the platform.</p>
          </Section>
          <Section title="Who we are">
            <p>Quelessly is operated as a proprietorship based in Pune, Maharashtra, India. We are a student-built startup focused on making campus food ordering effortless.</p>
          </Section>
          <Section title="Contact">
            <p>For any questions, write to us at <OLink href="mailto:support@quelessly.com">support@quelessly.com</OLink></p>
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
      <h2 style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: '#023341', letterSpacing: '-0.3px', marginBottom: 10 }}>{title}</h2>
      <div style={{ color: '#3d3830', fontSize: 15, lineHeight: 1.85 }}>{children}</div>
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