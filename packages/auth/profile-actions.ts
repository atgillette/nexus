"use server";

import { createClient } from "./supabase/server";
import { db } from "@nexus/database";
import { revalidatePath } from "next/cache";

export interface UploadProfilePictureResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

export async function uploadProfilePicture(
  formData: FormData
): Promise<UploadProfilePictureResult> {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: "File must be an image" };
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 2MB" };
    }

    // Create unique filename with user folder structure
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${user.id}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: "Failed to upload image" };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user's avatar URL in database
    await db.user.update({
      where: { id: user.id },
      data: { avatarUrl: publicUrl }
    });

    // Revalidate relevant paths
    revalidatePath('/', 'layout');

    return { success: true, avatarUrl: publicUrl };
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteProfilePicture(): Promise<UploadProfilePictureResult> {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get current user data to find existing avatar
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true }
    });

    // Delete from storage if exists
    if (userData?.avatarUrl) {
      // Extract the full path from the URL (everything after the bucket name)
      const urlParts = userData.avatarUrl.split('/avatars/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        if (filePath) {
          await supabase.storage
            .from('avatars')
            .remove([filePath]);
        }
      }
    }

    // Update user's avatar URL to null
    await db.user.update({
      where: { id: user.id },
      data: { avatarUrl: null }
    });

    // Revalidate relevant paths
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Profile picture deletion error:', error);
    return { success: false, error: "An unexpected error occurred" };
  }
}