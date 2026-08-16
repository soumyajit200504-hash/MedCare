'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { isRowCritical, getDaysUntilExpiry } from '@/data/mockInventory';
import { useInventory } from '@/context/InventoryContext';
import StatusBadge from '@/components/ui/StatusBadge';

type SortKey = 'name' | 'currentStock' | 'dailyDemand' | 'threshold';
type SortDir = 'asc' | 'desc';

export default function InventoryStatsTable() {
  const { medicines } = useInventory();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('currentStock');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = medicines
    .filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.batchNo.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="inline-flex flex-col ml-1">
      <ChevronUp
        size={8}
        className={sortKey === col && sortDir === 'asc' ? 'text-primary' : 'text-muted-foreground/40'}
      />
      <ChevronDown
        size={8}
        className={sortKey === col && sortDir === 'desc' ? 'text-primary' : 'text-muted-foreground/40'}
      />
    </span>
  );

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Inventory Stats</h3>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-ring w-44"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                Process ID
              </th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                Batch No.
              </th>
              <th
                className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground"
                onClick={() => handleSort('name')}
              >
                Medicine <SortIcon col="name" />
              </th>
              <th
                className="px-3 py-2 text-right font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground"
                onClick={() => handleSort('currentStock')}
              >
                Current Stock <SortIcon col="currentStock" />
              </th>
              <th
                className="px-3 py-2 text-right font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground"
                onClick={() => handleSort('dailyDemand')}
              >
                Daily Demand <SortIcon col="dailyDemand" />
              </th>
              <th
                className="px-3 py-2 text-right font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground"
                onClick={() => handleSort('threshold')}
              >
                Threshold <SortIcon col="threshold" />
              </th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                Mfg Date
              </th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                Expiry Date
              </th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((med, i) => {
              const critical = isRowCritical(med);
              const daysToExpiry = getDaysUntilExpiry(med.expiryDate);
              const expiryWarning = daysToExpiry <= 30 && daysToExpiry > 0;
              return (
                <tr
                  key={`stats-row-${med.id}`}
                  className={`border-b border-border last:border-0 transition-colors ${
                    critical ? 'row-critical' : i % 2 === 0 ? 'bg-white' : 'bg-muted/20'
                  } hover:bg-[#EFF6FF]`}
                >
                  <td className="px-3 py-2 font-tabular text-muted-foreground">{med.productNo}</td>
                  <td className="px-3 py-2 font-tabular text-muted-foreground whitespace-nowrap">{med.batchNo}</td>
                  <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{med.name}</td>
                  <td className={`px-3 py-2 text-right font-tabular font-semibold ${med.currentStock < med.threshold ? 'text-danger' : 'text-foreground'}`}>
                    {med.currentStock}
                  </td>
                  <td className="px-3 py-2 text-right font-tabular text-foreground">{med.dailyDemand}</td>
                  <td className="px-3 py-2 text-right font-tabular text-muted-foreground">{med.threshold}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{med.mfgDate}</td>
                  <td className={`px-3 py-2 whitespace-nowrap font-tabular ${expiryWarning ? 'text-warning font-semibold' : 'text-muted-foreground'}`}>
                    {med.expiryDate}
                    {expiryWarning && (
                      <span className="ml-1 text-[9px] text-warning">({daysToExpiry}d)</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={med.status} size="sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}