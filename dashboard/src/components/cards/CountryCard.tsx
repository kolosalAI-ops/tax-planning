import Link from 'next/link';
import { CountryCode } from '@/lib/types';
import { COUNTRY_LABELS, COUNTRY_FLAGS } from '@/lib/constants';
import { getCountrySummary } from '@/lib/transformers';

interface CountryCardProps {
  code: CountryCode;
}

export default function CountryCard({ code }: CountryCardProps) {
  const summary = getCountrySummary(code);

  return (
    <Link
      href={`/countries/${code}`}
      className="block bg-white border border-[#e2e8f0] rounded-lg p-3 hover:shadow-md hover:border-[#0f766e]/30 transition-all group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{COUNTRY_FLAGS[code]}</span>
        <div>
          <p className="text-xs font-bold text-[#0f172a] leading-tight group-hover:text-[#0f766e] transition-colors">
            {COUNTRY_LABELS[code]}
          </p>
          <p className="text-[10px] text-[#64748b] font-mono">{code}</p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-[#64748b]">CIT</span>
          <span className="font-semibold text-[#0f172a]">{summary.corporateRate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#64748b]">VAT</span>
          <span className="font-semibold text-[#0f172a]">{summary.vatRate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#64748b]">Payroll</span>
          <span className="font-semibold text-[#0f172a]">{summary.payrollRate.toFixed(1)}%</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-[#e2e8f0]">
        <div className="flex justify-between text-[10px]">
          <span className="text-[#64748b]">Treaties</span>
          <span className="font-mono font-bold text-[#0f766e]">{summary.treatyCount}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#0f766e] opacity-0 group-hover:opacity-100 transition-opacity">
          View Details →
        </span>
      </div>
    </Link>
  );
}
