import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/(marketing)(.*)',
  '/about',
  '/contact',
  '/features',
  '/privacy-policy',
  '/terms-of-service',
  '/api-reference',
  '/search',
  '/chat',
  '/channel/(.*)',
  '/changelog',
  '/api/youtube/(.*)',
  '/api/channel/(.*)',
  '/api/v1/(.*)',
  '/api/summarize(.*)',
  '/api/chat(.*)',
  '/api/beta(.*)',
  '/api/checkout(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Protect dashboard routes - redirect to sign-in if not authenticated
  if (isProtectedRoute(request)) {
    const { userId } = await auth()

    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
