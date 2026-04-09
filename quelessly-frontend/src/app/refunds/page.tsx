import Footer from '@/components/Footer'

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-5 py-16">
        <div className="mb-10">
          <div className="w-10 h-10 bg-lime-400 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-black font-black text-lg">Q</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-3">Refund & Cancellation Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: April 2026</p>
        </div>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-xl mb-3">Our role</h2>
            <p>Quelessly is a technology platform. We do not prepare or serve food. All food orders are fulfilled by independent vendors (canteen operators). Refund eligibility depends on the nature of the issue.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">Eligible refund cases</h2>
            <ul className="space-y-3 ml-4 list-disc list-outside text-zinc-400">
              <li><span className="text-white font-semibold">Payment deducted, order not placed:</span> Full refund within 5–7 business days.</li>
              <li><span className="text-white font-semibold">Vendor unable to fulfil order:</span> Full refund within 5–7 business days.</li>
              <li><span className="text-white font-semibold">Duplicate payment charged:</span> Full refund of the duplicate amount within 5–7 business days.</li>
              <li><span className="text-white font-semibold">Technical error during payment:</span> Full refund within 5–7 business days upon verification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">Non-eligible cases</h2>
            <ul className="space-y-3 ml-4 list-disc list-outside text-zinc-400">
              <li>Dissatisfaction with food quality, taste, or quantity — please contact the vendor directly at the canteen.</li>
              <li>Wrong items ordered by the customer.</li>
              <li>Change of mind after order is confirmed and being prepared.</li>
              <li>Orders already marked as "Ready" or "Completed".</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">Food quality complaints</h2>
            <p>Quelessly does not prepare food. Any complaints regarding food quality, hygiene, or incorrect items are the responsibility of the vendor. Please raise such issues directly with the canteen staff. Quelessly will not process refunds for food quality disputes.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">Refund timeline</h2>
            <p>Approved refunds are processed within <strong className="text-white">5–7 business days</strong> to the original payment method (UPI, card, or net banking). Actual credit time may vary depending on your bank.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">How to request a refund</h2>
            <p>Email us at <a href="mailto:support@quelessly.com" className="text-lime-400 hover:underline">support@quelessly.com</a> with:</p>
            <ul className="mt-3 space-y-2 ml-4 list-disc list-outside text-zinc-400">
              <li>Your Order ID</li>
              <li>Date and time of order</li>
              <li>Reason for refund request</li>
              <li>Screenshot of payment (if applicable)</li>
            </ul>
            <p className="mt-3">We will respond within 48 business hours.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}