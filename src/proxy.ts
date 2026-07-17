import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'attendancepro-super-secret-key-987654321-safe'
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. If trying to access login page, always allow access without auto-redirects
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // 2. Protect roles paths
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const role = payload.role as string;

    // Check authorization for paths
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/teacher') && role !== 'teacher') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*', '/login'],
};
