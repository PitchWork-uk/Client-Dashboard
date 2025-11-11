import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Only process dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const email = request.nextUrl.searchParams.get("email");
    
    // If email is present, add it to a custom header for the layout to read
    if (email) {
      const response = NextResponse.next();
      response.headers.set("x-email", email);
      return response;
    }
    
    // If no email and trying to access dashboard, redirect to homepage
    if (!email) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};

