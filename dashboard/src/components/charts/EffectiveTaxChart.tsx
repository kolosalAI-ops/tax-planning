'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ChartContainer from './ChartContainer';
import { getEffectiveTaxData } from '@/lib/transformers';

export default function EffectiveTaxChart() {
  const data = getEffectiveTaxData();

  return (
    <ChartContainer title="Total Tax Burden Breakdown (CIT + Payroll + Dividend WHT)" height={300}>
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
            formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
            contentStyle={{
              border: '1px solid #E4E7E9',
              borderRadius: '6px',
              fontSize: '11px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
          />
          <Bar dataKey="cit" name="Corporate Tax" stackId="a" fill="#0052C4" radius={[0, 0, 0, 0]} />
          <Bar dataKey="payroll" name="Payroll Tax" stackId="a" fill="#4D94E8" />
          <Bar dataKey="divWht" name="Dividend WHT" stackId="a" fill="#CC8727" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
