import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DealDhamal — Best Coupons & Deals in India'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
          🎟️ DealDhamal
        </div>
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: 800 }}>
          Best Coupons, Promo Codes & Cashback Deals in India
        </div>
        <div
          style={{
            marginTop: 40,
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
      </div>
    ),
    { ...size }
  )
}
