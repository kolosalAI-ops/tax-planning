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
      className="block bg-white border border-[#E4E7E9] rounded-lg p-3 hover:shadow-md hover:border-[#0052C4]/30 transition-all group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{COUNTRY_FLAGS[code]}</span>
        <div>
          <p className="text-xs font-bold text-[#0D0E0F] leading-tight group-hover:text-[#0052C4] transition-colors">
            {COUNTRY_LABELS[code]}
          </p>
          <p className="text-[10px] text-[#6A6F73] font-mono">{code}</p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-[#6A6F73]">CIT</span>
          <span className="font-semibold text-[#0D0E0F]">{summary.corporateRate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#6A6F73]">VAT</span>
          <span className="font-semibold text-[#0D0E0F]">{summary.vatRate.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-[#6A6F73]">Payroll</span>
          <span className="font-semibold text-[#0D0E0F]">{summary.payrollRate.toFixed(1)}%</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-[#E4E7E9]">
        <div className="flex justify-between text-[10px]">
          <span className="text-[#6A6F73]">Treaties</span>
          <span className="font-mono font-bold text-[#0052C4]">{summary.treatyCount}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#0052C4] opacity-0 group-hover:opacity-100 transition-opacity">
          View Details →
        </span>
      </div>
    </Link>
  );
}
