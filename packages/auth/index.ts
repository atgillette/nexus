// Re-export browser client only to avoid server imports in client components
export { createClient as createBrowserClient } from "./supabase/client";

// Re-export route guards
export { AdminGuard, ClientGuard } from "./route-guards";

// Re-export types
export type { UserRole, User } from "@nexus/types";

// Server-only exports should be imported directly from their files:
// - import { createClient as createServerClient } from "@nexus/auth/supabase/server";
// - import { updateSession } from "@nexus/auth/supabase/middleware";
// - import { uploadProfilePicture, deleteProfilePicture } from "@nexus/auth/profile-actions";