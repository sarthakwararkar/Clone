'use client'

import dynamic from 'next/dynamic'

const ButterflyOverlay = dynamic(() => import('@/components/home/ButterflyOverlay'), { ssr: false })

export default function ClientButterflyOverlay() {
  return <ButterflyOverlay />
}
