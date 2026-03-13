'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  height?: number;
  children: ReactNode;
}

export default function ChartContainer({ title, height = 280, children }: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white border border-[#E4E7E9] rounded-lg p-4">
      <h3 className="text-sm font-bold text-[#0D0E0F] mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>
        {mounted ? children : (
          <div
            className="w-full bg-[#F1F3F4] rounded animate-pulse"
            style={{ height }}
          />
        )}
      </div>
    </div>
  );
}
