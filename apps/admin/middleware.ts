import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@nexus/auth/supabase/server";

export async function middleware(request: NextRequest) {
  console.log('🔄 Middleware triggered for:', request.nextUrl.pathname);
  
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Allow access to auth pages and API routes without authentication
  if (
    request.nextUrl.pathname.startsWith("/auth/") ||
    request.nextUrl.pathname.startsWith("/api/")
  ) {
    console.log('✅ Allowing access to auth/API route');
    return supabaseResponse;
  }

  // Create Supabase client
  const supabase = await createClient();

  // Check for authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('👤 User check:', user ? `Found: ${user.email}` : 'No user found');

  // Redirect to login if not authenticated
  if (!user) {
    console.log('❌ No user, redirecting to login');
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Check user role for admin access
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Only allow admin and SE users
  if (!userData || (userData.role !== "admin" && userData.role !== "se")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/unauthorized";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};