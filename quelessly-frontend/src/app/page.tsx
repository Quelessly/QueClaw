// src/app/page.tsx
'use client'

import dynamic from 'next/dynamic'

const QuelesslyCanvas = dynamic(
  () => import('@/components/Canvas'),
  { ssr: false },
)

export default function Home() {
  return <QuelesslyCanvas />
}