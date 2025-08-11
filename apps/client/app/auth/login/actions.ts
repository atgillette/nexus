'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from "@nexus/auth/supabase/server";
import { db } from "@nexus/database";

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

  // Get the authenticated user ID
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();
  
  if (sessionError || !user) {
    await supabase.auth.signOut();
    return { error: "Unable to get user session" };
  }

  // Check if user has client role and company association using Prisma
  try {
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: { role: true, companyId: true }
    });

    if (!userData) {
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
  } catch (dbError) {
    console.error('Database error during login:', dbError);
    await supabase.auth.signOut();
    return { error: "Unable to verify user access" };
  }

  // Success - revalidate and redirect
  revalidatePath('/', 'layout');
  redirect('/');
}