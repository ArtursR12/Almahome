import { defineMiddleware } from 'astro:middleware';

// Constant-time comparison so a wrong password doesn't leak length-based timing.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function checkBasicAuth(authHeader: string | null): boolean {
  if (!authHeader) return false;
  const [scheme, encoded] = authHeader.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }
  const sep = decoded.indexOf(':');
  if (sep < 0) return false;
  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);

  const expectedUser = import.meta.env.ADMIN_USERNAME;
  const expectedPass = import.meta.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) return false;
  return timingSafeEqual(user, expectedUser) && timingSafeEqual(pass, expectedPass);
}

const REALM = 'AlmaHome Admin';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    if (!checkBasicAuth(context.request.headers.get('authorization'))) {
      return new Response('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': `Basic realm="${REALM}"`,
          'Cache-Control': 'no-store',
        },
      });
    }
  }
  return next();
});
