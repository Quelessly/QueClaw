import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-5 py-16">
        <div className="mb-10">
          <div className="w-10 h-10 bg-lime-400 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-black font-black text-lg">Q</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-3">Terms & Conditions</h1>
          <p className="text-zinc-500 text-sm">Last updated: April 2026</p>
        </div>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-xl mb-3">1. Platform nature</h2>
            <p>Quelessly is a technology platform that facilitates food ordering between students and canteen vendors. Quelessly is not a food provider, restaurant, or delivery service. We do not prepare, cook, handle, or deliver any food items.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">2. Vendor responsibility</h2>
            <p>All food preparation, quality, hygiene, and service is the sole responsibility of the vendor (canteen operator) listed on the platform. Quelessly makes no warranties regarding food quality, preparation standards, or allergen information. Any disputes regarding food quality, missing items, or wrong orders must be raised directly with the vendor.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">3. Limitation of liability</h2>
            <p>Quelessly shall not be held liable for any harm, illness, loss, or damage arising from food consumed that was ordered through the platform. Our liability is strictly limited to the technology service we provide. In no event shall Quelessly's liability exceed the transaction amount of the specific order in question.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">4. Payments</h2>
            <p>Payments are processed securely via Razorpay. By placing an order, you authorise Quelessly to charge the displayed amount. Prices displayed are set by vendors and may change without prior notice.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">5. Order cancellations</h2>
            <p>Once an order is placed and payment is confirmed, cancellations are subject to the vendor's acceptance. If a vendor is unable to fulfil an order, a full refund will be processed. See our Refund Policy for details.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">6. Acceptable use</h2>
            <p>You agree not to misuse the platform, place fraudulent orders, or attempt to manipulate the payment system. Quelessly reserves the right to block access to users who violate these terms.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">7. Governing law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Pune, Maharashtra.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">8. Contact</h2>
            <p>For any queries regarding these terms, contact us at <a href="mailto:support@quelessly.com" className="text-lime-400 hover:underline">support@quelessly.com</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}