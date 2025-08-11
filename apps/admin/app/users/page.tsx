"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AppLayout, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label } from "@nexus/ui";
import { Edit, Trash2, Plus } from "lucide-react";
import { api } from "@nexus/trpc/react";

type UserRole = 'admin' | 'se';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string | null;
  costRate?: number | null;
  billRate?: number | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  assignedClients: string[];
  companyAssignments: {
    companyId: string;
    companyName: string;
  }[];
}

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string;
  costRate: string;
  billRate: string;
  companyAssignments: string[];
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserRole>('admin');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'se',
    phone: '',
    costRate: '',
    billRate: '',
    companyAssignments: [],
  });

  const router = useRouter();
  
  // Get users based on active tab
  const { data: users, isLoading, error, refetch } = api.users.getUsers.useQuery({
    role: activeTab
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
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: activeTab,
      phone: '',
      costRate: '',
      billRate: '',
      companyAssignments: [],
    });
    setIsModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone || '',
      costRate: user.costRate?.toString() || '',
      billRate: user.billRate?.toString() || '',
      companyAssignments: user.companyAssignments.map(c => c.companyId),
    });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      costRate: formData.costRate ? parseFloat(formData.costRate) : undefined,
      billRate: formData.billRate ? parseFloat(formData.billRate) : undefined,
      phone: formData.phone || undefined,
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

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if user has admin access
  if (profileData && profileData.role !== 'admin') {
    return (
      <AppLayout title="Access Denied" activeNavItem="users">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Access denied. Admin privileges required.</p>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
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
            <p className="text-red-600">Error loading users: {error.message}</p>
            <button 
              onClick={() => refetch()} 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const formatCurrency = (amount: number | null | undefined): string => {
    if (!amount) return 'N/A';
    return `$${amount}/hr`;
  };

  const formatPhoneNumber = (phone: string | null | undefined): string => {
    return phone || 'N/A';
  };

  return (
    <AppLayout
      title="Manage Users"
      activeNavItem="users"
      userRole="admin"
      userAvatar={profileData?.avatarUrl || undefined}
      userName={profileData ? `${profileData.firstName} ${profileData.lastName}` : undefined}
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
    >
      <div className="pt-16">
        <div className="px-4 py-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold">Manage Users</h1>
            <button 
              className="px-4 py-2 bg-gray-900 text-white rounded-md flex items-center text-sm hover:bg-gray-800"
              onClick={openAddUserModal}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            <button
              className={`px-5 py-2 rounded-full text-sm font-medium ${
                activeTab === 'admin'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('admin')}
            >
              Admin Users
            </button>
            <button
              className={`px-5 py-2 rounded-full text-sm font-medium ${
                activeTab === 'se'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('se')}
            >
              SE Users
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
                      Name
                    </th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
                      Email
                    </th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
                      Cost Rate
                    </th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
                      Bill Rate
                    </th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
                      Assigned Clients
                    </th>
                    <th className="px-6 py-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.length > 0 ? (
                    users.map((user: User) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              {user.avatarUrl ? (
                                <Image
                                  src={user.avatarUrl}
                                  alt={`${user.firstName} ${user.lastName} avatar`}
                                  className="h-full w-full object-cover"
                                  width={32}
                                  height={32}
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </span>
                              )}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                          {formatPhoneNumber(user.phone)}
                        </td>
                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                          {formatCurrency(user.costRate)}
                        </td>
                        <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                          {formatCurrency(user.billRate)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {user.assignedClients.length > 0 ? (
                              user.assignedClients.map((client, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs rounded-full"
                                >
                                  {client}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm">
                                None assigned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            <button 
                              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              title="Edit user"
                              onClick={() => openEditUserModal(user)}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                              title="Delete user"
                              onClick={() => openDeleteModal(user)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No {activeTab} users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="se">Sales Engineer</option>
                </select>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costRate">Cost Rate ($/hr)</Label>
                <Input
                  id="costRate"
                  type="number"
                  step="0.01"
                  value={formData.costRate}
                  onChange={(e) => handleInputChange('costRate', e.target.value)}
                  placeholder="75.00"
                />
              </div>
              <div>
                <Label htmlFor="billRate">Bill Rate ($/hr)</Label>
                <Input
                  id="billRate"
                  type="number"
                  step="0.01"
                  value={formData.billRate}
                  onChange={(e) => handleInputChange('billRate', e.target.value)}
                  placeholder="150.00"
                />
              </div>
            </div>

            <div>
              <Label>Assigned Companies</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {companies?.map((company) => (
                  <label key={company.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.companyAssignments.includes(company.id)}
                      onChange={(e) => {
                        const updatedAssignments = e.target.checked
                          ? [...formData.companyAssignments, company.id]
                          : formData.companyAssignments.filter(id => id !== company.id);
                        setFormData(prev => ({ ...prev, companyAssignments: updatedAssignments }));
                      }}
                      className="mr-2"
                    />
                    {company.name}
                  </label>
                ))}
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModal}
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              {createUserMutation.isPending || updateUserMutation.isPending ? 'Saving...' : 
               editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete user{' '}
            <span className="font-semibold">
              {userToDelete?.firstName} {userToDelete?.lastName}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleDelete}
              disabled={deleteUserMutation.isPending}
              variant="destructive"
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}