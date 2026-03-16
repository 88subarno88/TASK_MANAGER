'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    href: '/dashboard/tasks',
    label: 'All Tasks',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  },
];

const statusFilters = [
  { href: '/dashboard/tasks?status=todo', label: 'To Do', dot: 'bg-slate-400' },
  { href: '/dashboard/tasks?status=in-progress', label: 'In Progress', dot: 'bg-blue-400' },
  { href: '/dashboard/tasks?status=review', label: 'In Review', dot: 'bg-amber-400' },
  { href: '/dashboard/tasks?status=done', label: 'Done', dot: 'bg-emerald-400' },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center transition-all group-hover:glow-cyan-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span className="font-display text-lg font-bold">Task<span className="text-cyan">Flow</span></span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href.split('?')[0]));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-cyan/10 text-cyan border border-cyan/20'
                  : 'text-slate-text hover:text-white hover:bg-panel'}`}>
              <span className={isActive ? 'text-cyan' : 'text-muted group-hover:text-slate-text'}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="text-xs font-mono text-muted px-3 mb-2 uppercase tracking-widest">Filter by status</p>
          {statusFilters.map(f => (
            <Link key={f.href} href={f.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-text hover:text-white hover:bg-panel transition-all">
              <span className={`w-2 h-2 rounded-full ${f.dot}`} />
              {f.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Encryption badge */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan/5 border border-cyan/10">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span className="text-xs text-cyan/60 font-mono">E2E Encrypted</span>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan/30 to-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan font-display font-bold text-sm">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-xs text-slate-text truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-text hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {loggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
