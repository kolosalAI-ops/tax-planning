import { KpiItem } from '@/lib/transformers';

export default function MetricCard({ label, value, sub }: KpiItem) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 hover:shadow-md transition-shadow">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748b] mb-1">
        {label}
      </p>
      <p className="text-2xl font-extrabold tracking-tight text-[#0f172a]">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[#64748b] mt-1">{sub}</p>
      )}
    </div>
  );
}
