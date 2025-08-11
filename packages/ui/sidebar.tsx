'use client';

import { 
  BarChart3, 
  Users, 
  Briefcase, 
  CreditCard, 
  RefreshCcw,
  MessageSquare,
  FileBarChart,
  AlertTriangle,
  TrendingUp,
  Key,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { cn } from './utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BrainTrustLogo } from './index';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  active?: boolean;
  adminOnly?: boolean;
  clientOnly?: boolean;
}

const adminNavItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    href: '/',
    active: false,
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    href: '/users',
    active: false,
    adminOnly: true,
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Briefcase,
    href: '/clients',
    active: false,
    adminOnly: true,
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    href: '/billing',
    active: false,
    adminOnly: true,
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: RefreshCcw,
    href: '/subscriptions',
    active: false,
    adminOnly: true,
  },
  {
    id: 'messaging',
    label: 'Messaging',
    icon: MessageSquare,
    href: '/messaging',
    active: false,
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: FileBarChart,
    href: '/reporting',
    active: false,
  },
  {
    id: 'exceptions',
    label: 'Exceptions',
    icon: AlertTriangle,
    href: '/exceptions',
    active: false,
  },
];

const clientNavItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    href: '/',
    active: false,
  },
  {
    id: 'workflow-roi',
    label: 'Workflow ROI',
    icon: TrendingUp,
    href: '/workflow-roi',
    active: false,
    clientOnly: true,
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: FileBarChart,
    href: '/reporting',
    active: false,
  },
  {
    id: 'credentials',
    label: 'Credentials',
    icon: Key,
    href: '/credentials',
    active: false,
    clientOnly: true,
  },
  {
    id: 'exceptions',
    label: 'Exceptions',
    icon: AlertTriangle,
    href: '/exceptions',
    active: false,
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    href: '/users',
    active: false,
    clientOnly: true,
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    href: '/billing',
    active: false,
    clientOnly: true,
  },
  {
    id: 'messaging',
    label: 'Messaging',
    icon: MessageSquare,
    href: '/messaging',
    active: false,
  },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  userRole?: 'admin' | 'se' | 'client';
}

export function Sidebar({ open, setOpen, activeItem, onItemClick, userRole = 'admin' }: SidebarProps) {
  const navItems = userRole === 'client' ? clientNavItems : adminNavItems;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch by waiting for component to mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <>
      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 flex items-center justify-center">
                <Image
                  src={BrainTrustLogo}
                  alt="BrainTrust"
                  width={32}
                  height={32}
                  className="w-8 h-8 dark:invert"
                />
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = activeItem === item.id;
                const Icon = item.icon;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onItemClick?.(item)}
                      className={cn(
                        'w-full flex items-center px-4 py-3 text-sm rounded-md',
                        isActive
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {mounted ? (
                theme === 'light' ? (
                  <Sun className="h-5 w-5 mr-3" />
                ) : (
                  <Moon className="h-5 w-5 mr-3" />
                )
              ) : (
                <div className="h-5 w-5 mr-3" />
              )}
              Theme
            </button>
          </div>
        </div>
      </aside>
      
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 bottom-0 z-10 flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 flex items-center justify-center">
              <Image
                src={BrainTrustLogo}
                alt="BrainTrust"
                width={32}
                height={32}
                className="w-8 h-8 dark:invert"
              />
            </div>
          </div>
        </div>
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = activeItem === item.id;
              const Icon = item.icon;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onItemClick?.(item)}
                    className={cn(
                      'w-full flex items-center px-4 py-3 text-sm rounded-md',
                      isActive
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    )}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {mounted ? (
              theme === 'light' ? (
                <Sun className="h-5 w-5 mr-3" />
              ) : (
                <Moon className="h-5 w-5 mr-3" />
              )
            ) : (
              <div className="h-5 w-5 mr-3" />
            )}
            Theme
          </button>
        </div>
      </aside>
    </>
  );
}