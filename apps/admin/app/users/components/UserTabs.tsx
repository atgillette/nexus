"use client";

import type { UserRole } from "../types";

interface UserTabsProps {
  activeTab: UserRole;
  onTabChange: (tab: UserRole) => void;
}

export function UserTabs({ activeTab, onTabChange }: UserTabsProps) {
  return (
    <div className="flex space-x-2 mb-6">
      <button
        className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
          activeTab === "admin"
            ? "bg-primary text-primary-foreground"
            : "bg-background text-foreground border border-border hover:bg-accent hover:text-accent-foreground"
        }`}
        onClick={() => onTabChange("admin")}
      >
        Admin Users
      </button>
      <button
        className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
          activeTab === "se"
            ? "bg-primary text-primary-foreground"
            : "bg-background text-foreground border border-border hover:bg-accent hover:text-accent-foreground"
        }`}
        onClick={() => onTabChange("se")}
      >
        SE Users
      </button>
    </div>
  );
}