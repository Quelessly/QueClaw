import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-5 py-16">
        <div className="mb-10">
          <div className="w-10 h-10 bg-lime-400 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-black font-black text-lg">Q</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-3">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: April 2026</p>
        </div>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-xl mb-3">1. Who we are</h2>
            <p>Quelessly is a proprietorship operated from Pune, Maharashtra, India. We provide a QR-based food ordering platform for college canteens. You can reach us at <a href="mailto:support@quelessly.com" className="text-lime-400 hover:underline">support@quelessly.com</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">2. Information we collect</h2>
            <p>When you use Quelessly, we may collect:</p>
            <ul className="mt-3 space-y-2 ml-4 list-disc list-outside text-zinc-400">
              <li>Order details (items ordered, quantity, total amount)</li>
              <li>Payment transaction data (processed securely via Razorpay — we do not store card details)</li>
              <li>Device and browser information for analytics</li>
            </ul>
            <p className="mt-3">We do not require you to create an account or provide personal information to browse menus or place orders.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">3. How we use your information</h2>
            <p>We use collected information to:</p>
            <ul className="mt-3 space-y-2 ml-4 list-disc list-outside text-zinc-400">
              <li>Process and fulfil your food orders</li>
              <li>Display your order status in real time</li>
              <li>Improve platform performance and reliability</li>
              <li>Resolve disputes and respond to support queries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">4. Payment data</h2>
            <p>All payments are processed by Razorpay. Quelessly does not store your card numbers, UPI IDs, or banking credentials. Razorpay's privacy policy governs payment data handling.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">5. Data sharing</h2>
            <p>We do not sell your personal data. We share order information with the relevant vendor (canteen) solely to fulfil your order. We do not share data with advertisers or third-party marketers.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">6. Data retention</h2>
            <p>Order data is retained for up to 90 days for dispute resolution purposes, after which it is deleted.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">7. Your rights</h2>
            <p>You may request deletion of your order data by emailing <a href="mailto:support@quelessly.com" className="text-lime-400 hover:underline">support@quelessly.com</a>. We will process requests within 7 business days.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">8. Changes to this policy</h2>
            <p>We may update this policy from time to time. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}