import React from 'react';
import type { MedicineStatus } from '@/data/mockInventory';

interface StatusBadgeProps {
  status: MedicineStatus | string;
  size?: 'sm' | 'md';
}

const statusMap: Record<string, string> = {
  'In Stock': 'badge-success',
  'Low Stock': 'badge-warning',
  Critical: 'badge-critical',
  'Out of Stock': 'badge-critical',
  Sent: 'badge-success',
  Acknowledged: 'badge-info',
  Pending: 'badge-warning',
  Processing: 'badge-info',
  Shipped: 'badge-success',
  Resolved: 'badge-muted',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cls = statusMap[status] ?? 'badge-muted';
  return (
    <span
      className={`${cls} inline-flex items-center whitespace-nowrap ${size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : ''}`}
    >
      {status}
    </span>
  );
}