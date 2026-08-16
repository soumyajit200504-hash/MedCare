'use client';

import React, { useState } from 'react';
import { Bell, AlertTriangle, Clock, MessageCircle, Phone, CheckCircle, Send, ChevronDown, Package,  } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  medicines,
  getDaysUntilExpiry,
  alertLog,
} from '@/data/mockInventory';
import StatusBadge from '@/components/ui/StatusBadge';
import KpiCard from '@/components/ui/KpiCard';
import { toast } from 'sonner';

const criticalMeds = medicines.filter(
  (m) => m.currentStock < m.threshold || getDaysUntilExpiry(m.expiryDate) <= 30
);

const belowThreshold = medicines.filter((m) => m.currentStock < m.threshold);
const expiringSoon = medicines.filter((m) => getDaysUntilExpiry(m.expiryDate) <= 30);
const criticalPriority = medicines.filter((m) => m.status === 'Critical' || m.status === 'Out of Stock');

interface NotifyFormValues {
  recipient: string;
  channel: 'whatsapp' | 'sms' | 'both';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export default function AlertsPageContent() {
  const [resolvedAlerts, setResolvedAlerts] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotifyFormValues>({
    defaultValues: {
      recipient: '+1-555-0142',
      channel: 'both',
      message: `URGENT: SmartRestock Alert — ${criticalMeds.length} medicines require immediate attention. Critical items: ${criticalMeds
        .slice(0, 3)
        .map((m) => m.name)
        .join(', ')}. Please review and reorder.`,
      priority: 'high',
    },
  });

  const onSubmit = (data: NotifyFormValues) => {
    setSending(true);
    // Backend integration point: POST /api/alerts/send-notification with { recipient, channel, message, priority }
    setTimeout(() => {
      setSending(false);
      toast.success(
        `Alert notification sent via ${data.channel === 'both' ? 'WhatsApp & SMS' : data.channel} to ${data.recipient}`
      );
      reset({
        recipient: data.recipient,
        channel: data.channel,
        message: '',
        priority: 'medium',
      });
    }, 1600);
  };

  const handleResolve = (id: string, name: string) => {
    setResolvedAlerts((r) => [...r, id]);
    toast.success(`Alert for ${name} marked as resolved`);
  };

  const visible = criticalMeds.filter((m) => !resolvedAlerts.includes(m.id));

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Alert Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor critical stock levels and send notifications to the pharmacy team
          </p>
        </div>
        <div className="flex items-center gap-2">
          {visible.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span className="text-xs font-semibold text-danger">{visible.length} Active Alerts</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards — 4 cards → 2×2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Active Alerts"
          value={visible.length}
          subtext="Require immediate action"
          icon={Bell}
          variant="danger"
        />
        <KpiCard
          label="Critical Priority"
          value={criticalPriority.length}
          subtext="Out of stock or critical"
          icon={AlertTriangle}
          variant="danger"
          trend={{ value: 'High risk', positive: false }}
        />
        <KpiCard
          label="Expiry Warnings"
          value={expiringSoon.length}
          subtext="Expiring within 30 days"
          icon={Clock}
          variant="warning"
        />
        <KpiCard
          label="Sent Today"
          value={alertLog.filter((l) => l.timestamp.startsWith('2026-08-15')).length}
          subtext="Notifications dispatched"
          icon={Send}
          variant="info"
        />
      </div>

      {/* Alert Cards Grid */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Active Alerts
            <span className="ml-2 badge-critical">{visible.length}</span>
          </h3>
          {visible.length > 0 && (
            <button
              onClick={() => {
                setResolvedAlerts(criticalMeds.map((m) => m.id));
                toast.success('All alerts marked as resolved');
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-success hover:text-success/80 transition-colors"
            >
              <CheckCircle size={13} />
              Resolve All
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle size={40} className="text-success mb-3" />
            <p className="text-sm font-semibold text-foreground">All alerts resolved</p>
            <p className="text-xs text-muted-foreground mt-1">
              No medicines currently below threshold or nearing expiry
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {visible.map((med) => {
              const daysToExpiry = getDaysUntilExpiry(med.expiryDate);
              const isBelowThreshold = med.currentStock < med.threshold;
              const isExpirySoon = daysToExpiry <= 30;
              const isExpanded = expandedCard === med.id;
              const severity =
                med.status === 'Out of Stock' || med.status === 'Critical' ?'Critical'
                  : isExpirySoon && daysToExpiry <= 14
                  ? 'High' :'Medium';

              const severityColor =
                severity === 'Critical' ?'text-danger'
                  : severity === 'High' ?'text-warning' :'text-accent';
              const severityBg =
                severity === 'Critical' ?'bg-[#FEF2F2] border-[#FECACA]'
                  : severity === 'High' ?'bg-[#FFFBEB] border-[#FDE68A]' :'bg-[#F0F9FF] border-[#BAE6FD]';

              return (
                <div
                  key={`alert-detail-${med.id}`}
                  className={`rounded-xl border p-4 flex flex-col gap-3 transition-all duration-200 ${severityBg}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          severity === 'Critical' ?'bg-[#FEE2E2]'
                            : severity === 'High' ?'bg-[#FEF3C7]' :'bg-[#E0F2FE]'
                        }`}
                      >
                        <AlertTriangle size={15} className={severityColor} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{med.name}</p>
                        <p className="text-[10px] text-muted-foreground">{med.batchNo}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] font-bold ${severityColor}`}>{severity}</span>
                      <StatusBadge status={med.status} size="sm" />
                    </div>
                  </div>

                  {/* Alert Details */}
                  <div className="flex flex-col gap-1.5">
                    {isBelowThreshold && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Stock Level</span>
                        <span className="font-semibold text-danger">
                          {med.currentStock} / {med.threshold} min ({med.unit})
                        </span>
                      </div>
                    )}
                    {isExpirySoon && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Expires</span>
                        <span className={`font-semibold ${daysToExpiry <= 14 ? 'text-danger' : 'text-warning'}`}>
                          {med.expiryDate} ({daysToExpiry}d)
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Daily Demand</span>
                      <span className="font-medium text-foreground">{med.dailyDemand} {med.unit}/day</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Coverage</span>
                      <span className={`font-semibold ${med.currentStock === 0 ? 'text-danger' : 'text-warning'}`}>
                        {med.currentStock > 0 ? `${Math.floor(med.currentStock / med.dailyDemand)}d remaining` : 'Depleted'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Supplier</span>
                      <span className="text-foreground">{med.supplier}</span>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-current/10 flex flex-col gap-1 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Product No.</span>
                        <span className="font-tabular text-foreground">{med.productNo}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span className="text-foreground">{med.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Mfg Date</span>
                        <span className="font-tabular text-foreground">{med.mfgDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Reorder Qty</span>
                        <span className="font-semibold text-primary">
                          {Math.ceil(med.threshold - med.currentStock + med.dailyDemand * 14)} {med.unit}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleResolve(med.id, med.name)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold bg-success text-white hover:bg-[#15803D] transition-all duration-150 active:scale-95"
                    >
                      <CheckCircle size={11} />
                      Resolve
                    </button>
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : med.id)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-[10px] font-medium border border-current/20 text-foreground hover:bg-white/50 transition-all duration-150"
                    >
                      Details
                      <ChevronDown
                        size={10}
                        className={`transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notification Trigger Form */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center">
            <Send size={15} className="text-success" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Send Alert Notification</h3>
            <p className="text-xs text-muted-foreground">
              Manually trigger WhatsApp or SMS alerts to the pharmacy team
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recipient */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Recipient Number
            </label>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Include country code (e.g. +1-555-0142)
            </p>
            <input
              type="tel"
              {...register('recipient', {
                required: 'Recipient number is required',
                pattern: {
                  value: /^\+?[\d\s\-().]{7,20}$/,
                  message: 'Enter a valid phone number with country code',
                },
              })}
              className="px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="+1-555-0142"
            />
            {errors.recipient && (
              <p className="text-[10px] text-danger font-medium">{errors.recipient.message}</p>
            )}
          </div>

          {/* Channel */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Notification Channel
            </label>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Select how the alert should be delivered
            </p>
            <select
              {...register('channel', { required: true })}
              className="px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="both">WhatsApp + SMS (Recommended)</option>
              <option value="whatsapp">WhatsApp Only</option>
              <option value="sms">SMS Only</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Alert Priority</label>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Sets urgency level in the notification header
            </p>
            <select
              {...register('priority')}
              className="px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="high">🔴 High — Immediate action required</option><option value="medium">🟡 Medium — Action needed within 24h</option>
              <option value="low">🟢 Low — Informational update</option>
            </select>
          </div>

          {/* Summary of critical items */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Alert Summary</label>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Auto-populated with current critical items
            </p>
            <div className="px-3 py-2 text-[10px] rounded-lg border border-border bg-muted/30 text-muted-foreground">
              {visible.length > 0
                ? `${visible.length} item(s) critical: ${visible.slice(0, 3).map((m) => m.name).join(', ')}${visible.length > 3 ? ` +${visible.length - 3} more` : ''}`
                : 'No active alerts — all items within safe thresholds'}
            </div>
          </div>

          {/* Message */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              Notification Message
            </label>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Customize the message body sent to the recipient
            </p>
            <textarea
              {...register('message', {
                required: 'Message body is required',
                minLength: { value: 20, message: 'Message must be at least 20 characters' },
              })}
              rows={4}
              className="px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Enter the alert message to send..."
            />
            {errors.message && (
              <p className="text-[10px] text-danger font-medium">{errors.message.message}</p>
            )}
          </div>

          {/* Channel preview */}
          <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#DCFCE7] flex items-center justify-center">
                <MessageCircle size={12} className="text-[#25D366]" />
              </div>
              <span className="text-[10px] text-muted-foreground">WhatsApp delivery ~2s</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#F0F9FF] flex items-center justify-center">
                <Phone size={12} className="text-accent" />
              </div>
              <span className="text-[10px] text-muted-foreground">SMS delivery ~5s</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <span className="text-[10px] text-muted-foreground">
              Logs saved to Alert Log automatically
            </span>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-border bg-muted text-foreground hover:bg-background transition-colors"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-[#1D4ED8] active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px] justify-center"
            >
              {sending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Alert...
                </>
              ) : (
                <>
                  <Send size={13} />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Below-Threshold Details Table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={15} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Below-Threshold Detail View</h3>
          </div>
          <span className="badge-critical">{belowThreshold.length} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Medicine</th>
                <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Category</th>
                <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Batch No.</th>
                <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap">Current Stock</th>
                <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap">Threshold</th>
                <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap">Deficit</th>
                <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap">Coverage</th>
                <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Supplier</th>
                <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {belowThreshold.map((med, i) => {
                const deficit = med.threshold - med.currentStock;
                const coverage = med.currentStock > 0 ? Math.floor(med.currentStock / med.dailyDemand) : 0;
                return (
                  <tr
                    key={`bt-row-${med.id}`}
                    className={`border-b border-border last:border-0 hover:bg-[#EFF6FF] transition-colors ${
                      med.status === 'Out of Stock' || med.status === 'Critical' ?'row-critical'
                        : i % 2 === 0
                        ? 'bg-white' :'bg-muted/20'
                    }`}
                  >
                    <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{med.name}</td>
                    <td className="px-3 py-2.5">
                      <span className="badge-info text-[10px]">{med.category}</span>
                    </td>
                    <td className="px-3 py-2.5 font-tabular text-muted-foreground whitespace-nowrap">{med.batchNo}</td>
                    <td className="px-3 py-2.5 text-right font-tabular font-semibold text-danger">{med.currentStock}</td>
                    <td className="px-3 py-2.5 text-right font-tabular text-muted-foreground">{med.threshold}</td>
                    <td className="px-3 py-2.5 text-right font-tabular font-bold text-danger">-{deficit}</td>
                    <td className={`px-3 py-2.5 text-right font-tabular font-semibold ${coverage === 0 ? 'text-danger' : coverage <= 3 ? 'text-danger' : 'text-warning'}`}>
                      {coverage}d
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{med.supplier}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={med.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}