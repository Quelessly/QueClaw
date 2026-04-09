import Footer from '@/components/Footer'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-5 py-16">
        <div className="mb-10">
          <div className="w-10 h-10 bg-lime-400 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-black font-black text-lg">Q</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-3">Contact Us</h1>
          <p className="text-zinc-400">We're here to help. Reach out anytime.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Email</p>
              <a href="mailto:support@quelessly.com" className="text-lime-400 hover:underline text-lg font-mono">
                support@quelessly.com
              </a>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Response Time</p>
              <p className="text-zinc-300">We typically respond within 24–48 business hours.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Business Hours</p>
              <p className="text-zinc-300">Monday – Saturday, 9:00 AM – 6:00 PM IST</p>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Location</p>
              <p className="text-zinc-300">Pune, Maharashtra, India</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">For order issues</p>
            <p className="text-zinc-300 text-sm leading-relaxed">
              If you have an issue with a specific order — wrong items, quality concerns, or missing food — please contact the vendor directly at the canteen. Quelessly is a technology platform and does not handle food preparation or delivery. For payment-related issues, write to us at <a href="mailto:support@quelessly.com" className="text-lime-400 hover:underline">support@quelessly.com</a> with your order ID.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}