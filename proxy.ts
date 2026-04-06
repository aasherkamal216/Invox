import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Only the AI endpoint needs protection
const isProtectedRoute = createRouteMatcher(["/api/invoice(.*)"]);

// When NEXT_PUBLIC_ENABLE_AUTH is not set (open-source / local dev), this
// middleware runs but never calls auth.protect(), so Clerk keys are not needed.
export default clerkMiddleware(async (auth, req) => {
  if (process.env.NEXT_PUBLIC_ENABLE_AUTH === "true" && isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
