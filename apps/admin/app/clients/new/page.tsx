"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  AppLayout, 
  Input, 
  Label, 
  Button, 
  Card, 
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox
} from "@nexus/ui";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { api } from "@nexus/trpc/react";
import type { 
  DepartmentFormValues, 
  ClientUserFormValues,
  SolutionsEngineerFormValues 
} from "../validation";

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("https://");
  const [departments, setDepartments] = useState<DepartmentFormValues[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [users, setUsers] = useState<ClientUserFormValues[]>([]);
  const [solutionsEngineers, setSolutionsEngineers] = useState<SolutionsEngineerFormValues[]>([]);
  
  // Fetch data
  const { data: profileData } = api.profile.getProfile.useQuery();
  const { data: seUsers } = api.users.getUsers.useQuery({ role: "se" });

  const createCompanyMutation = api.companies.create.useMutation({
    onSuccess: () => {
      router.push("/clients");
    },
    onError: (error) => {
      setIsSubmitting(false);
      alert(`Error creating client: ${error.message}`);
    },
  });

  // Department management
  const handleAddDepartment = () => {
    if (newDepartment.trim()) {
      setDepartments([...departments, { 
        id: `temp-${Date.now()}`, 
        name: newDepartment.trim() 
      }]);
      setNewDepartment("");
    }
  };

  const handleRemoveDepartment = (index: number) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  // User management
  const handleAddUser = () => {
    setUsers([...users, {
      id: `temp-${Date.now()}`,
      name: "",
      email: "",
      phone: "",
      departmentId: "",
      emailNotifications: false,
      smsNotifications: false,
      billingAccess: false,
      adminAccess: false,
    }]);
  };

  const handleUpdateUser = (index: number, field: keyof ClientUserFormValues, value: string | boolean) => {
    const updatedUsers = [...users];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    setUsers(updatedUsers);
  };

  const handleRemoveUser = (index: number) => {
    setUsers(users.filter((_, i) => i !== index));
  };

  // Solutions Engineer management
  const handleAddSolutionsEngineer = () => {
    setSolutionsEngineers([...solutionsEngineers, {
      userId: "",
      email: "",
    }]);
  };

  const handleUpdateSolutionsEngineer = (index: number, field: keyof SolutionsEngineerFormValues, value: string) => {
    const updated = [...solutionsEngineers];
    updated[index] = { ...updated[index], [field]: value };
    
    // If SE is selected, auto-fill email
    if (field === "userId" && seUsers) {
      const selectedSE = seUsers.find(se => se.id === value);
      if (selectedSE) {
        updated[index].email = selectedSE.email;
      }
    }
    
    setSolutionsEngineers(updated);
  };

  const handleRemoveSolutionsEngineer = (index: number) => {
    setSolutionsEngineers(solutionsEngineers.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!companyName.trim() || !companyUrl.trim() || companyUrl === "https://") {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    // Extract domain from URL
    const domain = companyUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    
    // Prepare departments data
    const departmentsData = departments.map(dept => ({
      name: dept.name,
    }));
    
    // Prepare users data with department names
    const usersData = users.filter(user => user.name && user.email).map(user => {
      const department = departments.find(d => d.id === user.departmentId);
      // Split name into first and last name
      const nameParts = user.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        firstName,
        lastName,
        email: user.email,
        phone: user.phone || undefined,
        departmentName: department?.name || undefined,
        emailNotifications: user.emailNotifications,
        smsNotifications: user.smsNotifications,
        billingAccess: user.billingAccess,
        adminAccess: user.adminAccess,
      };
    });
    
    // Prepare SE assignments data
    const seData = solutionsEngineers.filter(se => se.userId).map((se, index) => ({
      userId: se.userId,
      isPrimary: index === 0, // First SE is primary
    }));
    
    createCompanyMutation.mutate({
      name: companyName,
      domain: domain,
      industry: undefined,
      departments: departmentsData.length > 0 ? departmentsData : undefined,
      users: usersData.length > 0 ? usersData : undefined,
      solutionsEngineers: seData.length > 0 ? seData : undefined,
    });
  };

  return (
    <AppLayout
      title="Add New Client"
      activeNavItem="clients"
      userRole="admin"
      userAvatar={profileData?.avatarUrl || undefined}
      userName={profileData ? `${profileData.firstName} ${profileData.lastName}` : undefined}
      onNavigate={(href) => router.push(href)}
      onProfileClick={() => router.push('/profile')}
      onNotificationsClick={() => console.log('Notifications clicked')}
    >
      <div className="pt-16">
        <div className="px-4 py-6 max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.push("/clients")}
            className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </button>

          <Card>
            <CardContent className="p-8">
              <h1 className="text-2xl font-semibold mb-8">Add New Client</h1>
              
              <div className="space-y-8">
                {/* Company Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companyName">
                      Company Name<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyUrl">
                      Company URL<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="companyUrl"
                      type="text"
                      value={companyUrl}
                      onChange={(e) => setCompanyUrl(e.target.value)}
                      placeholder="https://"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Manage Departments */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Manage Departments</h2>
                  <div className="space-y-3">
                    {departments.map((dept, index) => (
                      <div key={dept.id} className="flex items-center gap-2">
                        <Input
                          value={dept.name}
                          onChange={(e) => {
                            const updated = [...departments];
                            updated[index] = { ...dept, name: e.target.value };
                            setDepartments(updated);
                          }}
                          placeholder="Department name"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDepartment(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
                        placeholder="Department name"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddDepartment}
                        className="whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Department
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Users */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Users</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-3 font-medium">Name</th>
                          <th className="text-left pb-3 font-medium">Email</th>
                          <th className="text-left pb-3 font-medium">Phone</th>
                          <th className="text-left pb-3 font-medium">Department</th>
                          <th className="text-left pb-3 font-medium">Exceptions</th>
                          <th className="text-left pb-3 font-medium">Access</th>
                          <th className="pb-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, index) => (
                          <tr key={user.id} className="border-b">
                            <td className="py-3 pr-3">
                              <Input
                                value={user.name}
                                onChange={(e) => handleUpdateUser(index, 'name', e.target.value)}
                                placeholder="Full name"
                                className="w-full min-w-[150px]"
                              />
                            </td>
                            <td className="py-3 pr-3">
                              <Input
                                type="email"
                                value={user.email}
                                onChange={(e) => handleUpdateUser(index, 'email', e.target.value)}
                                placeholder="Email"
                                className="w-full min-w-[150px]"
                              />
                            </td>
                            <td className="py-3 pr-3">
                              <Input
                                value={user.phone || ""}
                                onChange={(e) => handleUpdateUser(index, 'phone', e.target.value)}
                                placeholder="Phone"
                                className="w-full min-w-[120px]"
                              />
                            </td>
                            <td className="py-3 pr-3">
                              <Select
                                value={user.departmentId}
                                onValueChange={(value) => handleUpdateUser(index, 'departmentId', value)}
                              >
                                <SelectTrigger className="w-full min-w-[150px]">
                                  <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                  {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id || ""}>
                                      {dept.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`email-${user.id}`}
                                    checked={user.emailNotifications}
                                    onCheckedChange={(checked) => 
                                      handleUpdateUser(index, 'emailNotifications', checked)
                                    }
                                  />
                                  <Label htmlFor={`email-${user.id}`} className="text-sm">
                                    Email
                                  </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`sms-${user.id}`}
                                    checked={user.smsNotifications}
                                    onCheckedChange={(checked) => 
                                      handleUpdateUser(index, 'smsNotifications', checked)
                                    }
                                  />
                                  <Label htmlFor={`sms-${user.id}`} className="text-sm">
                                    SMS
                                  </Label>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-3">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`billing-${user.id}`}
                                    checked={user.billingAccess}
                                    onCheckedChange={(checked) => 
                                      handleUpdateUser(index, 'billingAccess', checked)
                                    }
                                  />
                                  <Label htmlFor={`billing-${user.id}`} className="text-sm whitespace-nowrap">
                                    Billing Access
                                  </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`admin-${user.id}`}
                                    checked={user.adminAccess}
                                    onCheckedChange={(checked) => 
                                      handleUpdateUser(index, 'adminAccess', checked)
                                    }
                                  />
                                  <Label htmlFor={`admin-${user.id}`} className="text-sm whitespace-nowrap">
                                    Admin Access
                                  </Label>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveUser(index)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddUser}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>

                {/* Assign Solutions Engineers */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Assign Solutions Engineers</h2>
                  <div className="space-y-3">
                    {solutionsEngineers.map((se, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label className="sr-only">Name</Label>
                          <Select
                            value={se.userId}
                            onValueChange={(value) => handleUpdateSolutionsEngineer(index, 'userId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select SE" />
                            </SelectTrigger>
                            <SelectContent>
                              {seUsers?.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.firstName} {user.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Label className="sr-only">Email</Label>
                          <Input
                            type="email"
                            value={se.email}
                            onChange={(e) => handleUpdateSolutionsEngineer(index, 'email', e.target.value)}
                            placeholder="email@example.com"
                            readOnly={!!se.userId}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSolutionsEngineer(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSolutionsEngineer}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Solutions Engineer
                    </Button>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/clients")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Client"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}