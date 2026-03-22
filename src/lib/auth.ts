import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserRole } from '@/models/User';

const secretKey = process.env.JWT_SECRET || 'super-secret-key-change-me-in-production';
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  phoneNumber: string;
  role: UserRole;
  expiresAt: Date;
}

export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  const token = await new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);

  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession() {
  const cookie = cookies().get('session')?.value;
  
  if (!cookie) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ['HS256'],
    });
    
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error('Failed to verify session', error);
    return null;
  }
}

export function deleteSession() {
  cookies().delete('session');
}
