'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ReferenceLine,  } from 'recharts';
import { TrendingUp, Brain, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import Icon from '@/components/ui/AppIcon';


// Historical demand data (past 12 months)
const historicalData = [
  { month: 'Sep 25', historical: 820, predicted: null, season: 'Post-Rainy' },
  { month: 'Oct 25', historical: 910, predicted: null, season: 'Post-Rainy' },
  { month: 'Nov 25', historical: 780, predicted: null, season: 'Post-Rainy' },
  { month: 'Dec 25', historical: 1050, predicted: null, season: 'Winter' },
  { month: 'Jan 26', historical: 1120, predicted: null, season: 'Winter' },
  { month: 'Feb 26', historical: 980, predicted: null, season: 'Winter' },
  { month: 'Mar 26', historical: 720, predicted: null, season: 'Spring' },
  { month: 'Apr 26', historical: 650, predicted: null, season: 'Spring' },
  { month: 'May 26', historical: 690, predicted: null, season: 'Spring' },
  { month: 'Jun 26', historical: 580, predicted: null, season: 'Summer' },
  { month: 'Jul 26', historical: 540, predicted: null, season: 'Summer' },
  { month: 'Aug 26', historical: 860, predicted: 860, season: 'Rainy' }, // current month — overlap
  { month: 'Sep 26', historical: null, predicted: 940, season: 'Rainy' },
  { month: 'Oct 26', historical: null, predicted: 1010, season: 'Rainy' },
  { month: 'Nov 26', historical: null, predicted: 820, season: 'Post-Rainy' },
  { month: 'Dec 26', historical: null, predicted: 1080, season: 'Winter' },
  { month: 'Jan 27', historical: null, predicted: 1150, season: 'Winter' },
  { month: 'Feb 27', historical: null, predicted: 1020, season: 'Winter' },
];

// Per-category forecast
const categoryForecast = [
  { category: 'Antibiotics', current: 78, forecast: 95, trend: 'up', reason: 'Rainy season spike' },
  { category: 'Antiviral', current: 85, forecast: 112, trend: 'up', reason: 'Flu season onset' },
  { category: 'Analgesics', current: 60, forecast: 72, trend: 'up', reason: 'Seasonal demand' },
  { category: 'Vaccines', current: 70, forecast: 88, trend: 'up', reason: 'Preventive care surge' },
  { category: 'Vitamins', current: 45, forecast: 38, trend: 'down', reason: 'Post-summer decline' },
  { category: 'Cardiovascular', current: 55, forecast: 60, trend: 'up', reason: 'Stable growth' },
  { category: 'Antifungal', current: 30, forecast: 42, trend: 'up', reason: 'Humidity-related' },
  { category: 'Antihistamine', current: 65, forecast: 58, trend: 'down', reason: 'Pollen season ending' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card shadow-lg p-3 text-xs min-w-[160px]">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any) => (
          entry.value !== null && (
            <div key={entry.name} className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold text-foreground">{entry.value}</span>
            </div>
          )
        ))}
      </div>
    );
  }
  return null;
};

export default function ForecastContent() {
  const { medicines } = useInventory();

  // Compute dynamic insights from inventory
  const criticalItems = medicines.filter((m) => m.status === 'Critical' || m.status === 'Out of Stock');
  const avgDailyDemand = Math.round(medicines.reduce((s, m) => s + m.dailyDemand, 0) / medicines.length);
  const projectedMonthlyDemand = avgDailyDemand * 30;

  const insights = [
    { label: 'Avg Daily Demand', value: `${avgDailyDemand} units`, icon: TrendingUp, color: 'text-primary', bg: 'bg-secondary' },
    { label: 'Projected Monthly', value: `${projectedMonthlyDemand.toLocaleString()} units`, icon: Brain, color: 'text-accent', bg: 'bg-[#F0F9FF]' },
    { label: 'Critical Items', value: `${criticalItems.length} medicines`, icon: AlertTriangle, color: 'text-danger', bg: 'bg-[#FEF2F2]' },
    { label: 'Season', value: 'Rainy (Active)', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Demand Forecast</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Historical demand vs AI-predicted future demand</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0]">
          <Brain size={13} className="text-success" />
          <span className="text-xs font-medium text-success">Trend-Based Prediction</span>
        </div>
      </div>

      {/* Insight KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={item.color} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{item.value}</p>
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Combined Chart */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Historical vs Predicted Demand</h3>
            <p className="text-xs text-muted-foreground">Sep 2025 – Feb 2027 · Shaded area = future prediction zone</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block rounded" /> Historical</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-orange-400 inline-block rounded border-dashed border-b" /> Predicted</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={historicalData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="square" iconSize={8} />
            <ReferenceLine x="Aug 26" stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: 'Today', position: 'top', fontSize: 10, fill: 'var(--muted-foreground)' }} />
            <Area type="monotone" dataKey="historical" name="Historical Demand" stroke="var(--primary)" strokeWidth={2} fill="url(#historicalGrad)" connectNulls={false} dot={false} />
            <Area type="monotone" dataKey="predicted" name="Predicted Demand" stroke="#f97316" strokeWidth={2} strokeDasharray="5 3" fill="url(#predictedGrad)" connectNulls={false} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Category Forecast Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Category-Level Demand Forecast</h3>
          <p className="text-xs text-muted-foreground">Current demand index vs next-month prediction</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40">
                <th className="text-left px-5 py-2.5 font-semibold text-muted-foreground">Category</th>
                <th className="text-right px-5 py-2.5 font-semibold text-muted-foreground">Current Index</th>
                <th className="text-right px-5 py-2.5 font-semibold text-muted-foreground">Forecast Index</th>
                <th className="text-right px-5 py-2.5 font-semibold text-muted-foreground">Change</th>
                <th className="text-left px-5 py-2.5 font-semibold text-muted-foreground">Demand Bar</th>
                <th className="text-left px-5 py-2.5 font-semibold text-muted-foreground">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categoryForecast.map((row) => {
                const change = row.forecast - row.current;
                const pct = Math.round((change / row.current) * 100);
                return (
                  <tr key={row.category} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{row.category}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{row.current}</td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">{row.forecast}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex items-center gap-0.5 font-semibold ${row.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                        {row.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(pct)}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[120px]">
                          <div
                            className={`h-full rounded-full ${row.trend === 'up' ? 'bg-primary' : 'bg-muted-foreground'}`}
                            style={{ width: `${Math.min(100, (row.forecast / 150) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{row.forecast}/150</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{row.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prediction Methodology Note */}
      <div className="card p-4 bg-[#F0F9FF] border-accent/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
            <Brain size={15} className="text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Prediction Methodology</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Future demand is predicted using seasonal trend analysis — comparing the same period across prior years, 
              weighted by current inventory depletion rates and daily demand data. Rainy season (Aug–Oct) historically 
              shows a <strong className="text-foreground">+18–22% spike</strong> in antiviral and antibiotic demand. 
              Winter months show elevated analgesic and flu medication consumption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
