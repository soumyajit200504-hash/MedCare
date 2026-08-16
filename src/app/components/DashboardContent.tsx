'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { getDaysUntilExpiry } from '@/data/mockInventory';
import { useInventory } from '@/context/InventoryContext';
import KpiCard from '@/components/ui/KpiCard';
import AlertsSection from './AlertsSection';
import InventoryStatsTable from './InventoryStatsTable';
import ReorderRecommendation from './ReorderRecommendation';
import ForecastWidget from './ForecastWidget';
import {
  Package,
  AlertTriangle,
  Clock,
  ShoppingCart,
  Activity,
  TrendingUp,
} from 'lucide-react';

const LiveMonitoringChart = dynamic(() => import('./LiveMonitoringChart'), { ssr: false });

export default function DashboardContent() {
  const { medicines } = useInventory();

  const totalSKUs = medicines?.length ?? 0;
  const criticalItems = medicines?.filter((m) => m?.status === 'Critical' || m?.status === 'Out of Stock')?.length ?? 0;
  const expiringSoon = medicines?.filter((m) => getDaysUntilExpiry(m?.expiryDate) <= 30)?.length ?? 0;
  const pendingReorders = medicines?.filter((m) => m?.currentStock < m?.threshold)?.length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Inventory Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            SmartRestock · Last updated: Aug 15, 2026 at 10:52 AM
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0]">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">Live Monitoring</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total SKUs"
          value={totalSKUs}
          subtext="Unique medicines tracked"
          icon={Package}
          variant="default"
        />
        <KpiCard
          label="Critical Items"
          value={criticalItems}
          subtext="Below threshold or OOS"
          icon={AlertTriangle}
          variant="danger"
          trend={{ value: '+2 today', positive: false }}
        />
        <KpiCard
          label="Expiring ≤30 Days"
          value={expiringSoon}
          subtext="Batches nearing expiry"
          icon={Clock}
          variant="warning"
        />
        <KpiCard
          label="Pending Reorders"
          value={pendingReorders}
          subtext="Below threshold"
          icon={ShoppingCart}
          variant="info"
        />
      </div>

      {/* Row 1: Live Monitoring + Forecast — equal height, aligned */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <div className="card p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Activity size={14} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Live Stock Monitoring</h3>
              <p className="text-xs text-muted-foreground">Current stock vs minimum threshold</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <LiveMonitoringChart />
          </div>
        </div>
        <div className="card p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-[#F0F9FF] flex items-center justify-center shrink-0">
              <TrendingUp size={14} className="text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Seasonal Forecast</h3>
              <p className="text-xs text-muted-foreground">Rainy season demand index</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ForecastWidget />
          </div>
        </div>
      </div>

      {/* Row 2: Actionable Alerts */}
      <AlertsSection />

      {/* Row 3: Inventory Stats Table */}
      <InventoryStatsTable />

      {/* Row 4: Reorder Recommendation */}
      <ReorderRecommendation />
    </div>
  );
}