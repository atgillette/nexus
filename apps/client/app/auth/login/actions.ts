'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from "@nexus/auth/supabase/server";

interface LoginFormData {
  email: string;
  password: string;
}

export async function clientLogin(data: LoginFormData) {
  const supabase = await createClient();

  // Sign in with Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if user has client role and company association
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role, companyId")
    .eq("email", data.email)
    .single();

  if (userError || !userData) {
    await supabase.auth.signOut();
    return { error: "Unable to verify user access" };
  }

  if (userData.role !== "client") {
    await supabase.auth.signOut();
    return { error: "Access denied. This portal is for clients only." };
  }

  if (!userData.companyId) {
    await supabase.auth.signOut();
    return { error: "Your account is not associated with a company. Please contact support." };
  }

  // Success - revalidate and redirect
  revalidatePath('/', 'layout');
  redirect('/');
}