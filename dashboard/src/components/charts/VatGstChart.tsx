'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getVatChartData } from '@/lib/transformers';

const BLUE = '#1d4ed8';
const BLUE_LIGHT = '#60a5fa';

export default function VatGstChart() {
  const data = getVatChartData();

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-4">
      <h3 className="text-sm font-bold text-[#0f172a] mb-4">VAT / GST Rates</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'VAT/GST Rate']}
            contentStyle={{
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '11px',
            }}
          />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={entry.code}
                fill={index % 2 === 0 ? BLUE : BLUE_LIGHT}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
