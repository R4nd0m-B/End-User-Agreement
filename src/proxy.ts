import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { NextURL } from 'next/dist/server/web/next-url';

export const config = {
  matcher: [
    '/admin/:path*',
    '/security-console/:path*',
  ],
};

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const adminPath = 'security-console';

  // Handle custom admin path requests
  if (pathname === `/${adminPath}` || pathname.startsWith(`/${adminPath}/`)) {
    // Rewrite the request to /admin
    // If pathname is exactly /${adminPath}, rewrite to /admin
    // If pathname is /${adminPath}/..., rewrite to /admin/...
    let newPathname = pathname.replace(`/${adminPath}`, '/admin');
    if (newPathname === '') {
      newPathname = '/admin';
    }

    const newUrl = new NextURL(newPathname, request.url);

    // Copy search params
    searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });

    return NextResponse.rewrite(newUrl);
  }

  // Block direct /admin access — must use /security-console
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
