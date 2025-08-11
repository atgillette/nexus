"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@nexus/ui";
import { Plus } from "lucide-react";
import { api } from "@nexus/trpc/react";
import {
  UserTable,
  UserForm,
  DeleteUserDialog,
  UserTabs,
} from "./components";
import type { User, UserRole } from "./types";
import type { UserFormValues } from "./validation";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserRole>("admin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const router = useRouter();

  // Get users based on active tab
  const { data: users, isLoading, error, refetch } = api.users.getUsers.useQuery({
    role: activeTab,
  });

  const { data: profileData } = api.profile.getProfile.useQuery();

  // Get companies for the form dropdown
  const { data: companies } = api.users.getCompanies.useQuery();

  // Mutations
  const createUserMutation = api.users.createUser.useMutation({
    onSuccess: () => {
      refetch();
      closeModal();
    },
  });

  const updateUserMutation = api.users.updateUser.useMutation({
    onSuccess: () => {
      refetch();
      closeModal();
    },
  });

  const deleteUserMutation = api.users.deleteUser.useMutation({
    onSuccess: () => {
      refetch();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    },
  });

  // Handler functions
  const openAddUserModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (data: UserFormValues) => {
    const submitData = {
      ...data,
      costRate: data.costRate ? parseFloat(data.costRate) : undefined,
      billRate: data.billRate ? parseFloat(data.billRate) : undefined,
      phone: data.phone || undefined,
    };

    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        ...submitData,
      });
    } else {
      createUserMutation.mutate(submitData);
    }
  };

  const handleDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate({ id: userToDelete.id });
    }
  };

  // Check if user has admin access
  if (profileData && profileData.role !== "admin") {
    return (
      <AppLayout title="Access Denied" activeNavItem="users">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">
              Access denied. Admin privileges required.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout title="Manage Users" activeNavItem="users">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Manage Users" activeNavItem="users">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">
              Error loading users: {error.message}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Manage Users"
      activeNavItem="users"
      userRole="admin"
      userAvatar={profileData?.avatarUrl || undefined}
      userName={
        profileData
          ? `${profileData.firstName} ${profileData.lastName}`
          : undefined
      }
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push("/profile")}
      onNotificationsClick={() => console.log("Notifications clicked")}
    >
      <div className="pt-16">
        <div className="px-4 py-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold">Manage Users</h1>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center text-sm hover:bg-primary/90"
              onClick={openAddUserModal}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </button>
          </div>

          {/* Tabs */}
          <UserTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Users Table */}
          <UserTable
            users={users}
            activeTab={activeTab}
            onEditUser={openEditUserModal}
            onDeleteUser={openDeleteModal}
          />
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <UserForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingUser={editingUser}
        companies={companies}
        onSubmit={handleSubmit}
        isSubmitting={
          createUserMutation.isPending || updateUserMutation.isPending
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteUserDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        userToDelete={userToDelete}
        onConfirmDelete={handleDelete}
        isDeleting={deleteUserMutation.isPending}
      />
    </AppLayout>
  );
}