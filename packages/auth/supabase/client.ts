import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  }

  // Validate JWT format for the anon key
  if (!supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.includes(' ') || supabaseAnonKey.includes('\n')) {
    console.error('Invalid Supabase anon key format detected');
    throw new Error('Invalid Supabase anon key format');
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
