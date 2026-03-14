'use client';

import { NAV_ITEMS, COUNTRY_NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useState, useCallback } from 'react';

// Context to allow Header to toggle the mobile sidebar
type SidebarContextType = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  open: false,
  toggle: () => {},
  close: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);
  return (
    <SidebarContext.Provider value={{ open, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#3C3E40]">
        <h1 className="text-base font-extrabold tracking-[-0.03em]">
          <span className="text-[#0066F5]">Kolosal</span>{' '}
          <span className="text-[#DDE1E3]">Tax</span>
        </h1>
        <p className="text-[10px] text-[#6A6F73] mt-0.5">7-Country Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <p className="px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9C9FA1] mb-2">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`block px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-[#0052C4]/90 text-white'
                      : 'text-[#DDE1E3] hover:bg-[#1a1b1d] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-2 mt-5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9C9FA1] mb-2">
          Countries
        </p>
        <ul className="space-y-0.5">
          {COUNTRY_NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.code}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-[#0052C4]/90 text-white'
                      : 'text-[#DDE1E3] hover:bg-[#1a1b1d] hover:text-white'
                  }`}
                >
                  <span className="font-mono text-[11px] text-[#9C9FA1] w-5">{item.code}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#3C3E40]">
        <p className="text-[11px] text-[#9C9FA1]">Tax Year 2024/2025</p>
      </div>
    </>
  );
}

export default function Sidebar() {
  const { open, close } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 bg-[#0D0E0F] text-white z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={close}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="relative flex flex-col w-72 h-full bg-[#0D0E0F] text-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-3 text-[#6A6F73] hover:text-white p-1"
              aria-label="Close sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <SidebarContent onNavigate={close} />
          </aside>
        </div>
      )}
    </>
  );
}
