
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user');
  const { pathname } = request.nextUrl;

  const authenticatedRoutes = [
    '/home',
    '/blackjack',
    '/dice-roller',
    '/fortune-apple',
    '/poker',
    '/slot-machine',
    '/profile',
    '/wallet'
  ];

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  
  // If user is trying to access login/register but is already logged in, redirect to home
  if (userCookie && isAuthRoute) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // If user is trying to access a protected route without being logged in, redirect to login
  if (!userCookie && authenticatedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is at root, decide where to send them
  if (pathname === '/') {
      if (userCookie) {
          return NextResponse.redirect(new URL('/home', request.url));
      } else {
          return NextResponse.redirect(new URL('/login', request.url));
      }
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/home',
    '/blackjack',
    '/dice-roller',
    '/fortune-apple',
    '/poker',
    '/slot-machine',
    '/login',
    '/register',
    '/profile',
    '/wallet'
  ],
};
