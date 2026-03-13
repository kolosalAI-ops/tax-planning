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
import { getCorporateRatesChartData } from '@/lib/transformers';
import ChartContainer from './ChartContainer';

const COLORS = ['#0052C4', '#4D94E8', '#0052C4', '#4D94E8', '#0052C4', '#4D94E8', '#0052C4'];

export default function CorporateTaxRatesChart() {
  const data = getCorporateRatesChartData();

  return (
    <ChartContainer title="Corporate Tax Rates" height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E7E9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#6A6F73' }}
            tickLine={false}
            axisLine={{ stroke: '#E4E7E9' }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#6A6F73' }}
            tickLine={false}
            axisLine={{ stroke: '#E4E7E9' }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'CIT Rate']}
            contentStyle={{
              border: '1px solid #E4E7E9',
              borderRadius: '6px',
              fontSize: '11px',
            }}
          />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.code} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
