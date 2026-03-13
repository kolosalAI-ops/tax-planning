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

const COLORS = ['#0052C4', '#0052C4', '#CC8727', '#CC2727', '#7c3aed', '#0891b2', '#6A6F73'];

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
    <div className="bg-white border border-[#E4E7E9] rounded-lg p-4">
      <h3 className="text-sm font-bold text-[#0D0E0F] mb-4">Tax Burden Radar</h3>
      <ResponsiveContainer width="100%" height={340}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#E4E7E9" />
          <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ border: '1px solid #E4E7E9', borderRadius: '6px', fontSize: '11px' }} />
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
