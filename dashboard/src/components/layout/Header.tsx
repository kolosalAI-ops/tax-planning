'use client';

import { usePathname } from 'next/navigation';

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

  const title = PAGE_TITLES[pathname] ?? 'Tax Planning Dashboard';

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#e2e8f0] px-4 md:px-8 py-3 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-[#0f172a] tracking-tight">{title}</h2>
        <p className="text-[11px] text-[#64748b]">
          Kolosal Tax Advisory — 7-Country Analysis
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded">
          2024/2025
        </span>
      </div>
    </header>
  );
}
