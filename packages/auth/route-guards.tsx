import { redirect } from 'next/navigation';
import { createClient } from "./supabase/server";

interface AdminGuardProps {
  children: React.ReactNode;
}

export async function AdminGuard({ children }: AdminGuardProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check user role for admin access
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Only allow admin and SE users
  if (!userData || (userData.role !== "admin" && userData.role !== "se")) {
    redirect('/auth/unauthorized');
  }

  return <>{children}</>;
}

interface ClientGuardProps {
  children: React.ReactNode;
}

export async function ClientGuard({ children }: ClientGuardProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check user role for client access
  const { data: userData } = await supabase
    .from("users")
    .select("role, companyId")
    .eq("id", user.id)
    .single();

  // Only allow client users with a company
  if (!userData || userData.role !== "client" || !userData.companyId) {
    redirect('/auth/unauthorized');
  }

  return <>{children}</>;
}