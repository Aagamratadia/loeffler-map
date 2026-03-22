import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super-secret-key-change-me-in-production';
const encodedKey = new TextEncoder().encode(secretKey);

// Define which paths are protected (require authentication)
// Change these to fit your app's actual protected routes
const protectedRoutes = ['/', '/results', '/admin'];
// Define which paths are specifically for unauthenticated users
const publicRoutes = ['/login', '/signup'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Skip middleware for Next.js internal routes, statics, and APIs (except if we want to protect some APIs)
  if (
      path.startsWith('/_next') ||
      path.startsWith('/api/') || // We are not protecting API routes globally here, depends on your needs
      path.includes('.') // like favicon.ico, images, etc.
  ) {
      return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some(route => 
      path === route || path.startsWith(`${route}/`)
  );
  
  const isPublicRoute = publicRoutes.some(route => 
      path === route || path.startsWith(`${route}/`)
  );

  const cookie = req.cookies.get('session');

  // Verify the JWT 
  let isValidSession = false;
  if (cookie?.value) {
      try {
          await jwtVerify(cookie.value, encodedKey, { algorithms: ['HS256'] });
          isValidSession = true;
      } catch (error) {
          // Token expired or invalid
          console.warn('Invalid or expired session token', error);
      }
  }

  // Redirect users without valid session trying to access protected routes
  if (isProtectedRoute && !isValidSession) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Redirect authenticated users trying to access login page
  if (isPublicRoute && isValidSession) {
    return NextResponse.redirect(new URL('/', req.nextUrl)); // Or redirect to dashboard/results
  }

  return NextResponse.next();
}

// Optionally, configure exactly which paths trigger the middleware
// This helps prevent middleware running on static assets unnecessarily
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
