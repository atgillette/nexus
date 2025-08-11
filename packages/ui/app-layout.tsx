'use client';

import { useState } from 'react';
import { Header } from './header';
import { Sidebar, NavigationItem } from './sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  activeNavItem?: string;
  userRole?: 'admin' | 'se' | 'client';
  userAvatar?: string;
  userName?: string;
  onNavigate?: (href: string) => void;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
  onLogoutClick?: () => void;
}

export function AppLayout({
  children,
  title,
  activeNavItem,
  userRole = 'admin',
  userAvatar,
  userName,
  onNavigate,
  onProfileClick,
  onNotificationsClick,
  onLogoutClick,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleNavItemClick = (item: NavigationItem) => {
    onNavigate?.(item.href);
    setSidebarOpen(false); // Close mobile sidebar after navigation
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        title={title}
        userAvatar={userAvatar}
        userName={userName}
        onProfileClick={onProfileClick}
        onNotificationsClick={onNotificationsClick}
        onLogoutClick={onLogoutClick}
      />
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        activeItem={activeNavItem}
        onItemClick={handleNavItemClick}
        userRole={userRole}
      />
      <div className="md:pl-64">
        {children}
      </div>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}