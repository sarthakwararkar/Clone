import { NextResponse } from 'next/server'

async function signHS256(payload: any, secretStr: string): Promise<string> {
  const encoder = new TextEncoder()
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const header = { alg: 'HS256', typ: 'JWT' }
  
  // Helper to base64Url encode a string
  const base64UrlEncode = (str: string) => {
    return btoa(str)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  }

  // Helper to base64Url encode an ArrayBuffer
  const base64UrlEncodeBuffer = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    secretKey,
    encoder.encode(`${encodedHeader}.${encodedPayload}`)
  )

  const encodedSignature = base64UrlEncodeBuffer(signatureBuffer)

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
}

async function getDeterministicUuid(email: string): Promise<string> {
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(email.toLowerCase()))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  // format as uuid: 8-4-4-4-12
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name, type, provider } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const secret = process.env.FIREBASE_MOCK_JWT_SECRET
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'coupondunia-mock'

    if (!secret) {
      return NextResponse.json({ error: 'FIREBASE_MOCK_JWT_SECRET environment variable is missing' }, { status: 500 })
    }

    const sub = await getDeterministicUuid(email)
    const role = 'user' // default role

    // Sign a mock Firebase JWT token
    const now = Math.floor(Date.now() / 1000)
    const jwtPayload = {
      sub,
      email,
      aud: projectId,
      iss: `https://securetoken.google.com/${projectId}`,
      iat: now,
      exp: now + 60 * 60 * 24 * 7, // 7 days expiration
      name: name || email.split('@')[0],
      picture: provider === 'google.com' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' : null,
      role: role,
      firebase: {
        sign_in_provider: provider === 'google.com' ? 'google.com' : 'password',
        identities: {
          email: [email]
        }
      }
    }

    const access_token = await signHS256(jwtPayload, secret)

    const session = {
      access_token,
      user: {
        id: sub,
        supabase_uid: sub, // kept for type compatibility
        email,
        name: name || email.split('@')[0],
        avatar_url: null,
        role: role,
        created_at: new Date().toISOString()
      }
    }

    return NextResponse.json({ success: true, session })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
