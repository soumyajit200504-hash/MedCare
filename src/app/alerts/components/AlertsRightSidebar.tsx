'use client';

import React, { useState } from 'react';
import { alertLog, medicines, getDaysUntilExpiry } from '@/data/mockInventory';
import StatusBadge from '@/components/ui/StatusBadge';
import { Bell, MessageCircle, Phone, Clock, CheckCircle } from 'lucide-react';

const typeColor: Record<string, string> = {
  'Low Stock': 'text-warning',
  'Out of Stock': 'text-danger',
  'Expiry Warning': 'text-warning',
  Critical: 'text-danger',
};

const typeBg: Record<string, string> = {
  'Low Stock': 'bg-[#FEF3C7]',
  'Out of Stock': 'bg-[#FEE2E2]',
  'Expiry Warning': 'bg-[#FEF3C7]',
  Critical: 'bg-[#FEE2E2]',
};

const expiryItems = medicines
  .filter((m) => getDaysUntilExpiry(m.expiryDate) <= 30)
  .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate));

export default function AlertsRightSidebar() {
  const [logFilter, setLogFilter] = useState<'All' | 'Sent' | 'Acknowledged'>('All');

  const filteredLog = alertLog.filter(
    (l) => logFilter === 'All' || l.status === logFilter
  );

  return (
    <div className="flex flex-col h-full divide-y divide-border">
      {/* Top: Full Alert Log */}
      <div className="flex flex-col" style={{ flex: '1 1 55%', minHeight: 0, overflow: 'hidden' }}>
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Full Alert Log</h3>
            <span className="badge-muted text-[10px]">{alertLog.length} entries</span>
          </div>
          <div className="flex items-center gap-1">
            {(['All', 'Sent', 'Acknowledged'] as const).map((f) => (
              <button
                key={`log-filter-${f}`}
                onClick={() => setLogFilter(f)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  logFilter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
          {filteredLog.map((log) => (
            <div key={`full-log-${log.id}`} className="px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-2 mb-1">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${typeBg[log.type] ?? 'bg-muted'}`}>
                  <Bell size={9} className={typeColor[log.type] ?? 'text-muted-foreground'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-[11px] font-semibold text-foreground truncate">{log.medicine}</p>
                    <StatusBadge status={log.status} size="sm" />
                  </div>
                  <p className="text-[9px] text-muted-foreground">{log.batchNo}</p>
                </div>
              </div>
              <p className="text-[10px] text-foreground leading-relaxed ml-7 mb-1.5">{log.message}</p>
              <div className="ml-7 flex items-center gap-3">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  {log.channel === 'WhatsApp' ? (
                    <MessageCircle size={9} className="text-[#25D366]" />
                  ) : (
                    <Phone size={9} className="text-accent" />
                  )}
                  {log.channel} · {log.recipient}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <Clock size={9} />
                  {log.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: Expiry Timeline */}
      <div className="flex flex-col" style={{ flex: '1 1 45%', minHeight: 0, overflow: 'hidden' }}>
        <div className="px-4 py-3 border-b border-border shrink-0">
          <h3 className="text-sm font-semibold text-foreground">Expiry Timeline</h3>
          <p className="text-xs text-muted-foreground">Batches expiring within 30 days</p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
          {expiryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <CheckCircle size={28} className="text-success mb-2" />
              <p className="text-xs font-medium text-foreground">No expiry warnings</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                All batches have more than 30 days remaining
              </p>
            </div>
          ) : (
            expiryItems.map((med) => {
              const days = getDaysUntilExpiry(med.expiryDate);
              const urgency = days <= 7 ? 'danger' : days <= 14 ? 'warning' : 'muted';
              const barWidth = Math.max(5, Math.min(100, (days / 30) * 100));
              const barColor =
                urgency === 'danger' ?'bg-danger'
                  : urgency === 'warning' ?'bg-warning' :'bg-accent';

              return (
                <div key={`expiry-${med.id}`} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">{med.name}</p>
                      <p className="text-[9px] text-muted-foreground">{med.batchNo}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-bold font-tabular ${urgency === 'danger' ? 'text-danger' : urgency === 'warning' ? 'text-warning' : 'text-muted-foreground'}`}>
                        {days}d
                      </p>
                      <p className="text-[9px] text-muted-foreground">{med.expiryDate}</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">0d</span>
                    <span className="text-[9px] text-muted-foreground">30d</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}