// Re-export Supabase clients with specific names to avoid conflicts
export { createClient as createBrowserClient } from "./supabase/client";
export { createClient as createServerClient } from "./supabase/server";
export { updateSession } from "./supabase/middleware";

// Re-export types
export type { UserRole, User } from "@nexus/types";