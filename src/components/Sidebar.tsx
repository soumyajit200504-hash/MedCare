'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Bell,
  Package,
  TrendingUp,
  History,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Settings,
  User,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null },
  { label: 'Alerts', href: '/alerts', icon: Bell, badge: '5' },
  { label: 'Inventory', href: '/inventory-management', icon: Package, badge: null },
  { label: 'Forecast', href: '/forecast', icon: TrendingUp, badge: null },
  { label: 'Transactions', href: '/transactions', icon: History, badge: null },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col h-screen sticky top-0 bg-card border-r border-border transition-all duration-300 ease-in-out z-30"
        style={{ width: collapsed ? '64px' : '220px', minWidth: collapsed ? '64px' : '220px' }}
      >
        {/* Logo */}
        <div
          className="flex items-center h-16 border-b border-border px-3 gap-2 overflow-hidden"
          style={{ justifyContent: collapsed ? 'center' : 'space-between' }}
        >
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <AppLogo size={28} />
              <span className="font-semibold text-sm text-foreground whitespace-nowrap truncate">
                SmartRestock
              </span>
            </div>
          )}
          {collapsed && <AppLogo size={28} />}
          {!collapsed && (
            <button
              onClick={onToggle}
              className="p-1 rounded-md hover:bg-muted transition-colors duration-150 text-muted-foreground hover:text-foreground"
              aria-label="Collapse sidebar"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>
          )}
        </div>

        {/* Collapse toggle when collapsed */}
        {collapsed && (
          <button
            onClick={onToggle}
            className="mx-auto mt-2 p-1.5 rounded-md hover:bg-muted transition-colors duration-150 text-muted-foreground hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <Menu size={16} />
          </button>
        )}

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-1 overflow-y-auto scrollbar-thin">
          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-1">
              Navigation
            </p>
          )}
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={`nav-${item.label}`}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="badge-critical text-[10px] px-1.5 py-0.5">{item.badge}</span>
                )}
                {collapsed && item.badge && (
                  <span
                    className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger"
                    aria-label={`${item.badge} alerts`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border px-2 py-3 flex flex-col gap-1">
          <button
            className={`sidebar-nav-item w-full ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings size={18} className="shrink-0" />
            {!collapsed && <span className="flex-1 text-left truncate">Settings</span>}
          </button>
          <button
            className={`sidebar-nav-item w-full ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span className="flex-1 text-left truncate">Sign Out</span>}
          </button>
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 pt-2 mt-1 border-t border-border">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <User size={14} className="text-primary-foreground" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-foreground truncate">Dr. Priya Sharma</p>
                <p className="text-[10px] text-muted-foreground truncate">Pharmacy Manager</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <MobileHeader />
    </>
  );
}

function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center px-4 gap-3 z-40">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <AppLogo size={24} />
          <span className="font-semibold text-sm text-foreground">SmartRestock</span>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-64 bg-card h-full flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AppLogo size={24} />
                <span className="font-semibold text-sm text-foreground">SmartRestock</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-3 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={`mobile-nav-${item.label}`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="badge-critical text-[10px]">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}