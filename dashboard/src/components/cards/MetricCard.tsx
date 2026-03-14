import { KpiItem } from '@/lib/transformers';

export default function MetricCard({ label, value, sub }: KpiItem) {
  return (
    <div className="bg-white border border-[#E4E7E9] rounded-lg p-4 hover:shadow-md transition-shadow cursor-default">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5A5E62] mb-1">
        {label}
      </p>
      <p className="text-2xl font-extrabold tracking-tight text-[#0D0E0F]">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[#5A5E62] mt-1">{sub}</p>
      )}
    </div>
  );
}
