'use client';

import React, { useState } from 'react';
import { Bell, MessageCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { getDaysUntilExpiry } from '@/data/mockInventory';
import { useInventory } from '@/context/InventoryContext';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function AlertsSection() {
  const { medicines } = useInventory();
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const criticalMeds = medicines.filter(
    (m) => m.currentStock < m.threshold || getDaysUntilExpiry(m.expiryDate) <= 30
  );

  const visible = criticalMeds.filter((m) => !dismissed.includes(m.id));

  const handleSendAlert = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success(`Alert sent for ${visible.length} critical items via WhatsApp & SMS`);
    }, 1500);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center">
            <AlertTriangle size={16} className="text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Actionable Alerts</h3>
            <p className="text-xs text-muted-foreground">{visible.length} items require immediate attention</p>
          </div>
        </div>
        <button
          onClick={handleSendAlert}
          disabled={sending || visible.length === 0}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-[#25D366] text-white hover:bg-[#1DAB56] active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MessageCircle size={14} />
              Send Alert (WhatsApp/SMS)
            </>
          )}
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle size={32} className="text-success mb-2" />
          <p className="text-sm font-medium text-foreground">All items within safe thresholds</p>
          <p className="text-xs text-muted-foreground mt-1">No alerts require immediate action</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {visible.slice(0, 6).map((med) => {
            const daysToExpiry = getDaysUntilExpiry(med.expiryDate);
            const isExpirySoon = daysToExpiry <= 30;
            const isBelowThreshold = med.currentStock < med.threshold;
            return (
              <div
                key={`alert-card-${med.id}`}
                className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 relative"
              >
                <button
                  onClick={() => setDismissed((d) => [...d, med.id])}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X size={12} />
                </button>
                <div className="flex items-start gap-2 pr-4">
                  <div className="w-6 h-6 rounded-md bg-[#FEE2E2] flex items-center justify-center shrink-0 mt-0.5">
                    <Bell size={12} className="text-danger" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{med.name}</p>
                    <p className="text-[10px] text-muted-foreground">{med.batchNo}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-col gap-0.5">
                  {isBelowThreshold && (
                    <p className="text-[10px] text-danger font-medium">
                      Stock: {med.currentStock} / Threshold: {med.threshold}
                    </p>
                  )}
                  {isExpirySoon && (
                    <p className="text-[10px] text-warning font-medium">
                      Expires in {daysToExpiry} day{daysToExpiry !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="mt-2">
                  <StatusBadge status={med.status} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}