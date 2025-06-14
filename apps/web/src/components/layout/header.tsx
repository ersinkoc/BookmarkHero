'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Search could go here in the future */}
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 hover:bg-accent rounded-md">
              {theme === 'dark' ? (
                <MoonIcon className="w-5 h-5" />
              ) : theme === 'light' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <ComputerDesktopIcon className="w-5 h-5" />
              )}
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setTheme('light')}
                        className={cn(
                          'flex items-center w-full px-4 py-2 text-sm',
                          active ? 'bg-accent' : '',
                          theme === 'light' ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        <SunIcon className="w-4 h-4 mr-2" />
                        Light
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                          'flex items-center w-full px-4 py-2 text-sm',
                          active ? 'bg-accent' : '',
                          theme === 'dark' ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        <MoonIcon className="w-4 h-4 mr-2" />
                        Dark
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setTheme('system')}
                        className={cn(
                          'flex items-center w-full px-4 py-2 text-sm',
                          active ? 'bg-accent' : '',
                          theme === 'system' ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        <ComputerDesktopIcon className="w-4 h-4 mr-2" />
                        System
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || user.email}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <UserCircleIcon className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">{user?.name || user?.email}</span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={cn(
                          'flex items-center w-full px-4 py-2 text-sm',
                          active ? 'bg-accent' : 'text-foreground'
                        )}
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-2" />
                        Settings
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={cn(
                          'flex items-center w-full px-4 py-2 text-sm',
                          active ? 'bg-accent' : 'text-foreground'
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}