import React from 'react';
import AlertLogFeed from './AlertLogFeed';
import ReorderSummaryPanel from './ReorderSummaryPanel';

export default function DashboardRightSidebar() {
  return (
    <div className="flex flex-col h-full divide-y divide-border">
      {/* Top Half: Alert Log */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <AlertLogFeed />
      </div>
      {/* Bottom Half: Reorder Summary */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <ReorderSummaryPanel />
      </div>
    </div>
  );
}