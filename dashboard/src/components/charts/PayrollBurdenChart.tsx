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
import { getPayrollChartData } from '@/lib/transformers';

const AMBER = '#CC8727';
const AMBER_LIGHT = '#f59e0b';

export default function PayrollBurdenChart() {
  const data = getPayrollChartData();

  return (
    <div className="bg-white border border-[#E4E7E9] rounded-lg p-4">
      <h3 className="text-sm font-bold text-[#0D0E0F] mb-4">Employer Payroll Tax Burden</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E7E9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#E4E7E9' }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: '#E4E7E9' }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Employer Payroll %']}
            contentStyle={{
              border: '1px solid #E4E7E9',
              borderRadius: '6px',
              fontSize: '11px',
            }}
          />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={entry.code}
                fill={index % 2 === 0 ? AMBER : AMBER_LIGHT}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
