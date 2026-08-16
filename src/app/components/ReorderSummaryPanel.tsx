import React from 'react';
import { reorderSummary } from '@/data/mockInventory';
import StatusBadge from '@/components/ui/StatusBadge';
import { Package } from 'lucide-react';

export default function ReorderSummaryPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Reorder Summary</h3>
        <p className="text-xs text-muted-foreground">Recent & pending reorders</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
        {reorderSummary?.map((ro) => (
          <div key={`ro-panel-${ro?.id}`} className="px-4 py-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <Package size={13} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs font-semibold text-foreground truncate">{ro?.medicine}</p>
                  <StatusBadge status={ro?.status} size="sm" />
                </div>
                <p className="text-[10px] text-muted-foreground">{ro?.batchNo}</p>
                <div className="grid grid-cols-2 gap-x-3 mt-1.5">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Current Stock</p>
                    <p className={`text-xs font-semibold font-tabular ${ro?.currentStock === 0 ? 'text-danger' : 'text-warning'}`}>
                      {ro?.currentStock} units
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Order Qty</p>
                    <p className="text-xs font-semibold font-tabular text-foreground">{ro?.orderQty} units</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Mfg Date</p>
                    <p className="text-[10px] text-muted-foreground">{ro?.mfgDate}</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Order Date</p>
                    <p className="text-[10px] text-muted-foreground">{ro?.orderDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}