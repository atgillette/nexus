'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import { BrainTrustLogo } from './index';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title: string;
  userAvatar?: string;
  userName?: string;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
  onLogoutClick?: () => void;
}

export function Header({
  sidebarOpen,
  setSidebarOpen,
  title,
  userAvatar,
  userName,
  onProfileClick,
  onNotificationsClick,
  onLogoutClick,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <header className="h-16 bg-background border-b border-border fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-4">
        <button
          className="md:hidden p-2 rounded-md hover:bg-accent"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex items-center">
          <div className="h-8 w-8 mr-3 flex items-center justify-center">
            <Image
              src={BrainTrustLogo}
              alt="BrainTrust"
              width={32}
              height={32}
              className="w-8 h-8 dark:invert"
            />
          </div>
          <h1 className="text-xl font-semibold text-foreground hidden md:block ml-2">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          className="p-2 rounded-full hover:bg-accent"
          onClick={onNotificationsClick}
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="relative" ref={dropdownRef}>
          <button 
            className="flex items-center hover:bg-accent rounded-lg px-2 py-1 transition-colors"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="h-8 w-8 rounded-full overflow-hidden">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName || 'User avatar'}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {userName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <svg
              className="h-4 w-4 ml-1 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onProfileClick?.();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Profile</span>
                </button>
                <div className="border-t border-border my-1"></div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogoutClick?.();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted/50 text-foreground transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}