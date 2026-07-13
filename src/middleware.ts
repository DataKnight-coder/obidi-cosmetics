import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnAdmin = req.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = req.nextUrl.pathname === '/admin/login';

  if (isOnAdmin) {
    if (isLoggedIn && isLoginPage) {
      return Response.redirect(new URL('/admin', req.nextUrl));
    }
    if (!isLoggedIn && !isLoginPage) {
      return Response.redirect(new URL('/admin/login', req.nextUrl));
    }
    return undefined; // allow through
  }
  
  return undefined;
});

export const config = {
  runtime: 'experimental-edge',
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico).*)'],
};
