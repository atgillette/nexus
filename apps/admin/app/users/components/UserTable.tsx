"use client";

import type { User, UserRole } from "../types";
import { UserTableRow } from "./UserTableRow";

interface UserTableProps {
  users: User[] | undefined;
  activeTab: UserRole;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export function UserTable({
  users,
  activeTab,
  onEditUser,
  onDeleteUser,
}: UserTableProps) {
  const formatCurrency = (amount: number | null | undefined): string => {
    if (!amount) return "N/A";
    return `$${amount}/hr`;
  };

  const formatPhoneNumber = (phone: string | null | undefined): string => {
    return phone || "N/A";
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-border">
              <th className="px-6 py-3 text-muted-foreground font-medium text-sm">
                Name
              </th>
              <th className="px-6 py-3 text-muted-foreground font-medium text-sm">
                Email
              </th>
              <th className="px-6 py-3 text-muted-foreground font-medium text-sm">
                Phone
              </th>
              <th className="px-6 py-3 text-muted-foreground font-medium text-sm">
                Cost Rate
              </th>
              <th className="px-6 py-3 text-muted-foreground font-medium text-sm">
                Bill Rate
              </th>
              <th className="px-6 py-3 text-muted-foreground font-medium text-sm">
                Assigned Clients
              </th>
              <th className="px-6 py-3 text-muted-foreground font-medium text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onEdit={onEditUser}
                  onDelete={onDeleteUser}
                  formatCurrency={formatCurrency}
                  formatPhoneNumber={formatPhoneNumber}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No {activeTab} users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}