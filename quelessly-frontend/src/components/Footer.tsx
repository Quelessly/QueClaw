import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black mt-16">
      <div className="max-w-4xl mx-auto px-5 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-lime-400 rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-sm">Q</span>
            </div>
            <span className="text-white font-bold tracking-tighter">quelessly.</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-zinc-500">
            <Link href="/about" className="hover:text-zinc-300 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-zinc-300 transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms & Conditions</Link>
            <Link href="/refunds" className="hover:text-zinc-300 transition-colors">Refund Policy</Link>
          </nav>
        </div>
        <p className="text-center text-zinc-700 text-xs mt-8">
          © {new Date().getFullYear()} Quelessly. All rights reserved.
        </p>
      </div>
    </footer>
  )
}