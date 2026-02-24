'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { getRadarData } from '@/lib/transformers';
import { COUNTRY_ORDER, COUNTRY_LABELS } from '@/lib/constants';

const COLORS = ['#0f766e', '#1d4ed8', '#b45309', '#b91c1c', '#7c3aed', '#0891b2', '#64748b'];

export default function TaxBurdenRadar() {
  const rawData = getRadarData();

  // Reshape for Recharts: categories as rows, countries as keys
  const categories = ['Corporate Tax', 'VAT/GST', 'Payroll Tax', 'Dividend WHT', 'Treaty Network'];
  const chartData = categories.map((cat) => {
    const row: Record<string, string | number> = { category: cat };
    for (const item of rawData) {
      row[item.country] = (item as Record<string, string | number>)[cat] as number;
    }
    return row;
  });

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-4">
      <h3 className="text-sm font-bold text-[#0f172a] mb-4">Tax Burden Radar</h3>
      <ResponsiveContainer width="100%" height={340}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px' }} />
          {COUNTRY_ORDER.map((code, i) => (
            <Radar
              key={code}
              name={COUNTRY_LABELS[code]}
              dataKey={COUNTRY_LABELS[code]}
              stroke={COLORS[i]}
              fill={COLORS[i]}
              fillOpacity={0.05}
              strokeWidth={1.5}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: '10px' }}
            iconSize={8}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
