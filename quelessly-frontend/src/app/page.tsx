import dynamic from 'next/dynamic'

// Canvas must be client-only:
// 1. Uses localStorage (SSR/CSR mismatch)
// 2. Posts to window.parent at mount (edit-mode protocol)
// 3. Uses IntersectionObserver, scroll events, window.animate
const QuelesslyCanvas = dynamic(
  () => import('@/components/quelessly/Canvas'),
  { ssr: false },
)

export default function Home() {
  return <QuelesslyCanvas />
}