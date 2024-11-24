import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/',                    // Landing page
  '/api/chatbot',         // Public chatbot API
  '/api/create-thread',   // Public thread creation
  '/api/answer-user',     // Public message handling
  '/login',              // Auth0 login
  '/api/auth/callback',   // Auth0 callback
];

// Add security headers to all responses
function addSecurityHeaders(response: NextResponse) {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable strict XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  return response;
}

// Rate limiting configuration
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
};

// Check if path is public
function isPublicPath(path: string) {
  return publicPaths.some(publicPath => 
    path.startsWith(publicPath) || 
    path.includes('/assets/') ||
    path.includes('/_next/') ||
    path.includes('/favicon.ico')
  );
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public paths
  if (isPublicPath(path)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // For API routes that require authentication
  if (path.startsWith('/api/')) {
    // Verify API key for chatbot-specific endpoints
    if (path.includes('/api/chatbot/')) {
      const apiKey = request.headers.get('x-api-key');
      if (!apiKey) {
        return new NextResponse(
          JSON.stringify({ error: 'API key is required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      // In production, verify API key against database
    }

    // Add rate limiting for API routes
    // In production, implement proper rate limiting with Redis
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // For dashboard and other protected routes
  const session = request.cookies.get('appSession');
  if (!session) {
    const loginUrl = new URL('/api/auth/login', request.url);
    loginUrl.searchParams.set('returnTo', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
