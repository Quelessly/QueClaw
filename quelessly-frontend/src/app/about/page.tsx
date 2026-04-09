import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-5 py-16">
        <div className="mb-10">
          <div className="w-10 h-10 bg-lime-400 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-black font-black text-lg">Q</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-3">About Quelessly</h1>
          <p className="text-zinc-400 text-lg">QR-based food ordering for college canteens.</p>
        </div>

        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-xl mb-3">What we do</h2>
            <p>Quelessly is a digital platform that enables students to discover menus, place food orders, and make payments at their college canteen — all by scanning a QR code. No app download required, no standing in queues.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">How it works</h2>
            <p>Each vendor (canteen) on Quelessly gets a unique QR code. Students scan it, browse the menu, add items to cart, and pay via UPI or card. The vendor receives the order instantly on their dashboard and prepares it. Students are notified when their order is ready.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">Our role</h2>
            <p>Quelessly is a technology platform. We connect students with canteen vendors. We do not prepare, handle, or deliver any food. All food preparation and service is carried out solely by the respective vendors listed on the platform.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">Who we are</h2>
            <p>Quelessly is operated as a proprietorship based in Pune, Maharashtra, India. We are a student-built startup focused on making campus food ordering effortless.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl mb-3">Contact</h2>
            <p>For any questions, write to us at <a href="mailto:support@quelessly.com" className="text-lime-400 hover:underline">support@quelessly.com</a></p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}