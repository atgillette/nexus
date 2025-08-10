'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from "@nexus/auth/supabase/server";

interface LoginFormData {
  email: string;
  password: string;
}

export async function adminLogin(data: LoginFormData) {
  const supabase = await createClient();

  // Sign in with Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if user has admin or SE role
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("email", data.email)
    .single();

  if (userError || !userData) {
    await supabase.auth.signOut();
    return { error: "Unable to verify user role" };
  }

  if (userData.role !== "admin" && userData.role !== "se") {
    await supabase.auth.signOut();
    return { error: "Access denied. This portal is for administrators only." };
  }

  // Success - revalidate and redirect
  revalidatePath('/', 'layout');
  redirect('/');
}