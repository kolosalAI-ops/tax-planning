'use client';

import { NAV_ITEMS, COUNTRY_NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-56 md:fixed md:inset-y-0 bg-[#0f172a] text-white z-30">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#1e293b]">
        <h1 className="text-base font-extrabold tracking-tight">
          <span className="text-[#14b8a6]">Kolosal</span> Tax
        </h1>
        <p className="text-[10px] text-[#64748b] mt-0.5">7-Country Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <p className="px-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-2">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#0f766e] text-white'
                      : 'text-[#cbd5e1] hover:bg-[#1e293b] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-2 mt-5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-2">
          Countries
        </p>
        <ul className="space-y-0.5">
          {COUNTRY_NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.code}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#0f766e] text-white'
                      : 'text-[#cbd5e1] hover:bg-[#1e293b] hover:text-white'
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#64748b] w-5">{item.code}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#1e293b]">
        <p className="text-[10px] text-[#64748b]">Tax Year 2024/2025</p>
      </div>
    </aside>
  );
}
