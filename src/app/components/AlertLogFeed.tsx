import React from 'react';
import { alertLog } from '@/data/mockInventory';
import StatusBadge from '@/components/ui/StatusBadge';
import { MessageCircle, Phone, Bell } from 'lucide-react';

const typeColor: Record<string, string> = {
  'Low Stock': 'text-warning',
  'Out of Stock': 'text-danger',
  'Expiry Warning': 'text-warning',
  Critical: 'text-danger',
};

export default function AlertLogFeed() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Alert Log</h3>
        <p className="text-xs text-muted-foreground">Recent notifications sent</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
        {alertLog.map((log) => (
          <div key={`feed-${log.id}`} className="px-4 py-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <Bell size={11} className={typeColor[log.type] ?? 'text-muted-foreground'} />
                <p className="text-xs font-semibold text-foreground truncate">{log.medicine}</p>
              </div>
              <StatusBadge status={log.status} size="sm" />
            </div>
            <p className="text-[10px] text-muted-foreground mb-1">{log.batchNo}</p>
            <p className="text-[10px] text-foreground leading-relaxed">{log.message}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                {log.channel === 'WhatsApp' ? (
                  <MessageCircle size={9} className="text-[#25D366]" />
                ) : (
                  <Phone size={9} className="text-accent" />
                )}
                {log.channel} · {log.recipient}
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground/70 mt-1">{log.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}