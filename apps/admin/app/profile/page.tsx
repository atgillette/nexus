"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, ProfilePictureUpload } from "@nexus/ui";
import { api } from "@nexus/trpc/react";

export default function ProfilePage() {
  const { data: profile, isLoading } = api.profile.getProfile.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  const userInitials = `${profile.firstName[0]}${profile.lastName[0]}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Profile Picture Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a profile picture. Supported formats: JPG, PNG, GIF. Max size: 2MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ProfilePictureUpload
                currentAvatarUrl={profile.avatarUrl}
                userInitials={userInitials}
                size="lg"
                showControls={true}
              />
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {profile.firstName} {profile.lastName}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {profile.email}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 capitalize">
                  {profile.role}
                </p>
              </div>

              {profile.company && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {profile.company.name}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Member Since
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}