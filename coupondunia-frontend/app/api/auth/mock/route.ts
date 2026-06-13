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
    const { email, password, name, type } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const secret = process.env.SUPABASE_JWT_SECRET
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

    if (!secret) {
      return NextResponse.json({ error: 'SUPABASE_JWT_SECRET environment variable is missing' }, { status: 500 })
    }

    if (!supabaseUrl) {
      return NextResponse.json({ error: 'SUPABASE_URL environment variable is missing' }, { status: 500 })
    }

    const sub = await getDeterministicUuid(email)
    const role = 'user' // default role

    // Sign a mock Supabase JWT token
    const now = Math.floor(Date.now() / 1000)
    const jwtPayload = {
      sub,
      email,
      role: 'authenticated',
      aud: 'authenticated',
      iss: `${supabaseUrl}/auth/v1`,
      iat: now,
      exp: now + 60 * 60 * 24 * 7, // 7 days expiration
      user_metadata: {
        name: name || email.split('@')[0],
        role: role,
      },
      app_metadata: {
        provider: 'email',
        providers: ['email'],
      },
    }

    const access_token = await signHS256(jwtPayload, secret)

    const session = {
      access_token,
      token_type: 'bearer',
      expires_in: 604800,
      refresh_token: 'mock_refresh_token_value',
      user: {
        id: sub,
        aud: 'authenticated',
        role: 'authenticated',
        email,
        email_confirmed_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        user_metadata: {
          name: name || email.split('@')[0],
          role: role,
        },
        app_metadata: {
          provider: 'email',
          providers: ['email'],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }

    return NextResponse.json({ success: true, session })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
