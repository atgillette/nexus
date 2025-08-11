import { createClient } from "@nexus/auth/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    // Use the request URL to maintain the same domain
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
  } catch (error) {
    console.error('Logout error:', error);
    // Use the request URL to maintain the same domain even on error
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
  }
}