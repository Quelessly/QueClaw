import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Mono, Fraunces } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'QueLessly',
  description: 'QR-based food ordering for college canteens',
}

export const viewport: Viewport = {
  themeColor: '#09090b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${dmSans.variable} ${dmMono.variable} ${fraunces.variable}`}>
      <body className={`antialiased bg-zinc-950 text-white`}>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  )
}