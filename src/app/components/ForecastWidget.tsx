'use client';

import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { TrendingUp, CloudRain, Sun, Snowflake } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const radarData = [
  { subject: 'Flu Meds', current: 92 },
  { subject: 'Antibiotics', current: 78 },
  { subject: 'Antiviral', current: 85 },
  { subject: 'Analgesics', current: 60 },
  { subject: 'Vitamins', current: 45 },
  { subject: 'Vaccines', current: 70 },
];

const seasonTips = [
  { icon: CloudRain, label: 'Rainy Season Active', color: 'text-accent', bg: 'bg-[#F0F9FF]' },
  { icon: TrendingUp, label: 'Flu demand +38%', color: 'text-danger', bg: 'bg-[#FEF2F2]' },
  { icon: Snowflake, label: 'Winter prep in 14 wks', color: 'text-primary', bg: 'bg-secondary' },
  { icon: Sun, label: 'Summer meds surplus', color: 'text-warning', bg: 'bg-[#FFFBEB]' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card shadow p-2 text-xs">
        <p className="font-semibold">{payload[0]?.payload?.subject}</p>
        <p className="text-muted-foreground">Demand Index: <span className="font-bold text-foreground">{payload[0]?.value}</span></p>
      </div>
    );
  }
  return null;
};

export default function ForecastWidget() {
  return (
    <div className="h-full flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={180}>
        <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
          <Radar
            name="Demand"
            dataKey="current"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-1.5">
        {seasonTips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div
              key={`tip-${tip.label}`}
              className={`${tip.bg} rounded-lg px-2 py-1.5 flex items-center gap-1.5`}
            >
              <Icon size={12} className={tip.color} />
              <span className="text-[10px] font-medium text-foreground leading-tight">{tip.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}