'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Zap,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tenants / Companies', href: '/tenants', icon: Building2 },
  { label: 'Platform Roles', href: '/roles', icon: ShieldCheck },
];

export function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex flex-col h-full bg-surface border-r border-border w-64 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary-glow">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">ELIJAH AI</span>
            <span className="text-[10px] font-semibold tracking-wider text-accent uppercase block -mt-1">
              SuperAdmin
            </span>
          </div>
        </Link>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-muted hover:text-white rounded-lg hover:bg-surface-elevated"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-subtle px-3 py-2 uppercase tracking-wider">
          Management
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-accent border border-primary/30 font-semibold'
                  : 'text-muted hover:bg-surface-elevated hover:text-slate-100'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-accent' : 'text-subtle')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/80">
        <div className="bg-surface-elevated rounded-lg p-3 border border-border">
          <p className="text-xs font-medium text-slate-200">Production Engine</p>
          <p className="text-[11px] text-muted mt-0.5">PostgreSQL + Docker Active</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">{content}</aside>

      {/* Mobile Drawer (Overlay) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">{content}</div>
        </div>
      )}
    </>
  );
}

