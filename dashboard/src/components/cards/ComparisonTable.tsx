import { TableRow } from '@/lib/types';

interface ComparisonTableProps {
  title: string;
  data: TableRow[];
}

export default function ComparisonTable({ title, data }: ComparisonTableProps) {
  if (!data.length) return null;

  const columns = Object.keys(data[0]).filter((k) => k !== 'metric');

  return (
    <div className="bg-white border border-[#E4E7E9] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E4E7E9]">
        <h3 className="text-sm font-bold text-[#0D0E0F]">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-[#0D0E0F] text-white">
              <th className="px-3 py-2 text-left font-semibold">Metric</th>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.metric}
                className={i % 2 === 0 ? 'bg-white' : 'bg-[#F1F3F4]'}
              >
                <td className="px-3 py-2 font-semibold text-[#0D0E0F] whitespace-nowrap">
                  {row.metric}
                </td>
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-right text-[#0D0E0F] font-mono whitespace-nowrap">
                    {row[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
