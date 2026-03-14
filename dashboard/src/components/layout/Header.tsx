'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from './Sidebar';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/compare': 'Country Comparison',
  '/investors': 'International Investors',
  '/deductions': 'Deductions & Allowances',
  '/pipeline': 'Tax Pipeline',
  '/cases': 'Case Studies',
};

export default function Header() {
  const pathname = usePathname();
  const { toggle } = useSidebar();

  const title = PAGE_TITLES[pathname] ?? 'Tax Planning Dashboard';

  return (
    <header className="sticky top-0 z-20 backdrop-blur-sm bg-white/95 border-b border-[#E4E7E9] px-4 md:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggle}
          className="md:hidden p-1.5 -ml-1.5 rounded-md text-[#6A6F73] hover:text-[#0D0E0F] hover:bg-[#F1F3F4] transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <h2 className="text-[17px] font-bold text-[#0D0E0F] tracking-[-0.02em]">{title}</h2>
          <p className="text-[12px] text-[#6A6F73]">
            Kolosal Tax Advisory — 7-Country Analysis
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono font-medium text-[#6A6F73] bg-[#EBEDEE] px-2 py-1 rounded">
          2024/2025
        </span>
      </div>
    </header>
  );
}
