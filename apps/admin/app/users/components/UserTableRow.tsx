"use client";

import Image from "next/image";
import { Badge } from "@nexus/ui";
import { Edit, Trash2 } from "lucide-react";
import type { User } from "../types";

interface UserTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  formatCurrency: (amount: number | null | undefined) => string;
  formatPhoneNumber: (phone: string | null | undefined) => string;
}

export function UserTableRow({
  user,
  onEdit,
  onDelete,
  formatCurrency,
  formatPhoneNumber,
}: UserTableRowProps) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full overflow-hidden mr-3 bg-muted flex items-center justify-center">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName} avatar`}
                className="h-full w-full object-cover"
                width={32}
                height={32}
              />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            )}
          </div>
          <span className="font-medium text-foreground">
            {user.firstName} {user.lastName}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-foreground">{user.email}</td>
      <td className="px-6 py-4 text-foreground">
        {formatPhoneNumber(user.phone)}
      </td>
      <td className="px-6 py-4 text-foreground">
        {formatCurrency(user.costRate)}
      </td>
      <td className="px-6 py-4 text-foreground">
        {formatCurrency(user.billRate)}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {user.assignedClients.length > 0 ? (
            user.assignedClients.map((client, index) => (
              <Badge key={index} variant="secondary">
                {client}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">
              None assigned
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-3">
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Edit user"
            onClick={() => onEdit(user)}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Delete user"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}