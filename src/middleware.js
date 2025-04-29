import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const user = verifyToken(token);

  const url = request.nextUrl.clone();

  if (!user && url.pathname.startsWith('/chat')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/chatss/:path*'],
};
