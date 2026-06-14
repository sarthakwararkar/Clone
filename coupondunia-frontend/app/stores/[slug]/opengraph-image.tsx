import { ImageResponse } from 'next/og'
import { api } from '@/lib/api'

export const runtime = 'edge'
export const alt = 'Store Coupons & Deals — DealDhamal'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  let storeName = 'Store'
  let cashbackRate: string | null = null

  try {
    const storeDetail = await api.getStore(params.slug)
    storeName = storeDetail.store.name
    cashbackRate = storeDetail.store.cashback_rate
  } catch (error) {
    console.error('Failed to fetch store details for OG image:', error)
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #E84141 0%, #FF6B35 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, color: 'white', marginBottom: 16 }}>
          {storeName}
        </div>
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: 800, marginBottom: 24 }}>
          Verified Coupons & Deals on DealDhamal
        </div>
        {cashbackRate ? (
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 16,
              padding: '12px 32px',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
            }}
          >
            Up to {cashbackRate} Cashback
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 16,
              padding: '12px 32px',
              fontSize: 24,
              color: 'white',
              fontWeight: 600,
            }}
          >
            500+ Stores · Verified Daily · 100% Free
          </div>
        )}
      </div>
    ),
    { ...size }
  )
}
