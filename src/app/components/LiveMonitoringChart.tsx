'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useInventory } from '@/context/InventoryContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card shadow-lg p-3 text-xs">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={`tt-${entry.name}`} className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function LiveMonitoringChart() {
  const { medicines } = useInventory();

  // Dynamically build chart data from live inventory context
  const chartData = medicines.slice(0, 8).map((m) => ({
    name: m.name.split(' ')[0],
    current: m.currentStock,
    threshold: m.threshold,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          iconType="square"
          iconSize={8}
        />
        <Bar dataKey="current" name="Current Stock" fill="var(--primary)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="threshold" name="Min Threshold" fill="var(--accent)" radius={[3, 3, 0, 0]} opacity={0.5} />
      </BarChart>
    </ResponsiveContainer>
  );
}