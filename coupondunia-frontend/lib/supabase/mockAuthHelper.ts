export const MOCK_SESSION_KEY = 'sb-mock-session';

export interface MockSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string;
    confirmed_at: string;
    last_sign_in_at: string;
    user_metadata: {
      name?: string;
      role?: string;
      [key: string]: any;
    };
    app_metadata: {
      provider: string;
      providers: string[];
      [key: string]: any;
    };
    created_at: string;
    updated_at: string;
  };
}

// Client-side: Set mock session in localStorage and cookie
export function setClientMockSession(session: MockSession) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
    // Set cookie with 7 days expiration
    document.cookie = `${MOCK_SESSION_KEY}=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=604800; SameSite=Lax; Secure`;
  } catch (err) {
    console.error('Error setting client mock session:', err);
  }
}

// Client-side: Get mock session
export function getClientMockSession(): MockSession | null {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first
  const local = localStorage.getItem(MOCK_SESSION_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // ignore
    }
  }

  // Try cookie
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + MOCK_SESSION_KEY + '\\s*=\\s*([^;]+)'));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch {
      // ignore
    }
  }

  return null;
}

// Client-side: Clear mock session
export function clearClientMockSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(MOCK_SESSION_KEY);
    document.cookie = `${MOCK_SESSION_KEY}=; path=/; max-age=0; SameSite=Lax; Secure`;
  } catch (err) {
    console.error('Error clearing client mock session:', err);
  }
}

// Server-side / Client-side: Verify JWT locally using Web Crypto HMAC SHA-256
export async function verifyJWT(token: string, secretStr: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const base64urlDecode = (str: string) => {
      let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return atob(b64);
    };

    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretStr),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBinary = base64urlDecode(signatureB64);
    const sigBuffer = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBuffer[i] = sigBinary.charCodeAt(i);
    }

    const dataBuffer = encoder.encode(`${headerB64}.${payloadB64}`);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      secretKey,
      sigBuffer,
      dataBuffer
    );

    if (!isValid) return null;

    const payloadStr = base64urlDecode(payloadB64);
    const payload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error('verifyJWT error:', err);
    return null;
  }
}
