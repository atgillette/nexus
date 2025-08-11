"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { uploadProfilePicture, deleteProfilePicture } from "@nexus/auth/profile-actions";
import { api } from "@nexus/trpc/react";

interface ProfilePictureProps {
  currentAvatarUrl?: string | null;
  userInitials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-24 w-24 text-xl",
};

export function ProfilePicture({ 
  currentAvatarUrl, 
  userInitials, 
  size = "md", 
  className = "" 
}: ProfilePictureProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const utils = api.useUtils();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProfilePicture(formData);

      if (result.success) {
        // Invalidate profile queries to refetch with new avatar
        await utils.profile.getProfile.invalidate();
        setPreviewUrl(null);
      } else {
        setError(result.error || 'Upload failed');
        setPreviewUrl(null);
      }
    } catch (err) {
      setError('Upload failed');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await deleteProfilePicture();

      if (result.success) {
        await utils.profile.getProfile.invalidate();
      } else {
        setError(result.error || 'Delete failed');
      }
    } catch (err) {
      setError('Delete failed');
    } finally {
      setIsUploading(false);
    }
  };

  const avatarUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={`relative ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        rounded-full 
        overflow-hidden 
        bg-gradient-to-br 
        from-blue-500 
        to-purple-600 
        flex 
        items-center 
        justify-center 
        text-white 
        font-semibold
        ${isUploading ? 'opacity-50' : ''}
      `}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{userInitials}</span>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute top-full mt-2 text-xs text-red-600 whitespace-nowrap">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string | null;
  userInitials: string;
  size?: "sm" | "md" | "lg";
  showControls?: boolean;
}

export function ProfilePictureUpload({ 
  currentAvatarUrl, 
  userInitials, 
  size = "lg",
  showControls = true 
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const utils = api.useUtils();

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProfilePicture(formData);

      if (result.success) {
        await utils.profile.getProfile.invalidate();
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await deleteProfilePicture();

      if (result.success) {
        await utils.profile.getProfile.invalidate();
      } else {
        setError(result.error || 'Delete failed');
      }
    } catch (err) {
      setError('Delete failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <ProfilePicture
        currentAvatarUrl={currentAvatarUrl}
        userInitials={userInitials}
        size={size}
      />

      {showControls && (
        <div className="flex space-x-2">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            size="sm"
            variant="outline"
          >
            {isUploading ? 'Uploading...' : 'Change Photo'}
          </Button>

          {currentAvatarUrl && (
            <Button
              onClick={handleDelete}
              disabled={isUploading}
              size="sm"
              variant="ghost"
            >
              Remove
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}