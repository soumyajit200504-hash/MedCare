'use client';

import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, Package } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { toast } from 'sonner';

export default function ReorderRecommendation() {
  const { medicines } = useInventory();
  const [ordered, setOrdered] = useState<string[]>([]);

  const lowItems = medicines
    .filter((m) => m.currentStock < m.threshold)
    .map((m) => ({
      ...m,
      recommendedQty: Math.ceil((m.threshold - m.currentStock + m.dailyDemand * 14)),
      coverageDays: m.currentStock > 0 ? Math.floor(m.currentStock / m.dailyDemand) : 0,
    }));

  const handleOrder = (id: string, name: string) => {
    setOrdered((o) => [...o, id]);
    toast.success(`Reorder placed for ${name}`);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <ShoppingCart size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Reorder Recommendations</h3>
          <p className="text-xs text-muted-foreground">Optimal quantities for 14-day coverage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
        {lowItems.map((med) => {
          const isOrdered = ordered.includes(med.id);
          return (
            <div
              key={`reorder-${med.id}`}
              className={`rounded-lg border p-3 flex flex-col gap-2 transition-all duration-200 ${
                isOrdered ? 'border-[#BBF7D0] bg-[#F0FDF4]' : 'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <Package size={12} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{med.name}</p>
                  <p className="text-[10px] text-muted-foreground">{med.category}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">Recommend</p>
                  <p className="text-sm font-bold font-tabular text-foreground">{med.recommendedQty} {med.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Coverage</p>
                  <p className={`text-xs font-semibold font-tabular ${med.coverageDays < 3 ? 'text-danger' : 'text-warning'}`}>
                    {med.coverageDays}d left
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOrder(med.id, med.name)}
                disabled={isOrdered}
                className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 active:scale-95 ${
                  isOrdered
                    ? 'bg-[#DCFCE7] text-success cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-[#1D4ED8]'
                }`}
              >
                {isOrdered ? (
                  <>
                    <CheckCircle size={12} />
                    Order Placed
                  </>
                ) : (
                  <>
                    <ShoppingCart size={12} />
                    Place Reorder
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}