import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  trend?: { value: string; positive: boolean };
}

const variantStyles: Record<string, { card: string; icon: string; iconBg: string }> = {
  default: {
    card: 'bg-card border-border',
    icon: 'text-primary',
    iconBg: 'bg-secondary',
  },
  danger: {
    card: 'bg-[#FEF2F2] border-[#FECACA]',
    icon: 'text-danger',
    iconBg: 'bg-[#FEE2E2]',
  },
  warning: {
    card: 'bg-[#FFFBEB] border-[#FDE68A]',
    icon: 'text-warning',
    iconBg: 'bg-[#FEF3C7]',
  },
  success: {
    card: 'bg-[#F0FDF4] border-[#BBF7D0]',
    icon: 'text-success',
    iconBg: 'bg-[#DCFCE7]',
  },
  info: {
    card: 'bg-[#F0F9FF] border-[#BAE6FD]',
    icon: 'text-accent',
    iconBg: 'bg-[#E0F2FE]',
  },
};

export default function KpiCard({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  trend,
}: KpiCardProps) {
  const styles = variantStyles[variant];
  return (
    <div className={`card ${styles.card} p-4 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.iconBg}`}>
          <Icon size={18} className={styles.icon} />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold ${trend.positive ? 'text-success' : 'text-danger'}`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold font-tabular text-foreground leading-tight">{value}</p>
        <p className="text-xs font-medium text-muted-foreground mt-0.5 tracking-wide uppercase">
          {label}
        </p>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </div>
    </div>
  );
}