import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';
import { cookies } from 'next/headers';

export async function middleware(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value
  const url = request.nextUrl.clone();

  if (!token && url.pathname.startsWith('/chat')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chat/:path*'],
};
