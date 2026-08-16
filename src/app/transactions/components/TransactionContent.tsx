'use client';

import React, { useState } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ShoppingCart, Send, Clock, Package, DollarSign, Plus,  } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface Order {
  id: string;
  type: 'placed' | 'sent' | 'pending';
  medicine: string;
  batchNo: string;
  qty: number;
  unitPrice: number;
  total: number;
  date: string;
  status: string;
  supplier: string;
}

const initialOrders: Order[] = [
  { id: 'ORD-001', type: 'placed', medicine: 'Amoxicillin 500mg', batchNo: 'BTH-2024-0041', qty: 300, unitPrice: 2.5, total: 750, date: '2026-08-15', status: 'Confirmed', supplier: 'PharmaCo Ltd.' },
  { id: 'ORD-002', type: 'placed', medicine: 'Oseltamivir 75mg', batchNo: 'BTH-2024-0103', qty: 150, unitPrice: 8.0, total: 1200, date: '2026-08-14', status: 'Confirmed', supplier: 'BioGen Pharma' },
  { id: 'ORD-003', type: 'sent', medicine: 'Fluconazole 150mg', batchNo: 'BTH-2024-0034', qty: 200, unitPrice: 3.2, total: 640, date: '2026-08-13', status: 'Shipped', supplier: 'PharmaCo Ltd.' },
  { id: 'ORD-004', type: 'sent', medicine: 'Clarithromycin 500mg', batchNo: 'BTH-2024-0023', qty: 100, unitPrice: 5.5, total: 550, date: '2026-08-12', status: 'In Transit', supplier: 'PharmaCo Ltd.' },
  { id: 'ORD-005', type: 'pending', medicine: 'Influenza Vaccine', batchNo: 'BTH-2024-0091', qty: 80, unitPrice: 15.0, total: 1200, date: '2026-08-15', status: 'Awaiting Approval', supplier: 'VaxGlobal Ltd.' },
  { id: 'ORD-006', type: 'pending', medicine: 'Azithromycin 500mg', batchNo: 'BTH-2024-0067', qty: 120, unitPrice: 4.8, total: 576, date: '2026-08-15', status: 'Awaiting Approval', supplier: 'BioGen Pharma' },
  { id: 'ORD-007', type: 'pending', medicine: 'Vitamin B12 500mcg', batchNo: 'BTH-2024-0096', qty: 200, unitPrice: 1.8, total: 360, date: '2026-08-14', status: 'Under Review', supplier: 'NutriLife Labs' },
];

const unitPrices: Record<string, number> = {
  'Amoxicillin 500mg': 2.5,
  'Paracetamol 650mg': 0.8,
  'Oseltamivir 75mg': 8.0,
  'Atorvastatin 25mg': 3.5,
  'Vitamin D3 1000IU': 1.2,
  'Influenza Vaccine': 15.0,
  'Fluconazole 150mg': 3.2,
  'Cetirizine 10mg': 0.9,
  'Azithromycin 500mg': 4.8,
  'Ibuprofen 400mg': 0.7,
  'Metformin 500mg': 1.1,
  'Vitamin B12 500mcg': 1.8,
  'Hepatitis B Vaccine': 12.0,
  'Clarithromycin 500mg': 5.5,
  'Dextromethorphan 15mg': 2.2,
};

const statusColor: Record<string, string> = {
  Confirmed: 'bg-green-100 text-green-700',
  Shipped: 'bg-blue-100 text-blue-700',
  'In Transit': 'bg-indigo-100 text-indigo-700',
  'Awaiting Approval': 'bg-yellow-100 text-yellow-700',
  'Under Review': 'bg-orange-100 text-orange-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
};

type TabType = 'all' | 'placed' | 'sent' | 'pending' | 'stock';

export default function TransactionContent() {
  const { medicines } = useInventory();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({ medicine: '', qty: '', supplier: '' });

  const tabs: { key: TabType; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'all', label: 'All Transactions', icon: Package, color: 'text-primary' },
    { key: 'placed', label: 'Placed Orders', icon: ShoppingCart, color: 'text-green-600' },
    { key: 'sent', label: 'Sent Orders', icon: Send, color: 'text-blue-600' },
    { key: 'pending', label: 'Pending Orders', icon: Clock, color: 'text-yellow-600' },
    { key: 'stock', label: 'Stock & Pricing', icon: DollarSign, color: 'text-purple-600' },
  ];

  const filteredOrders = activeTab === 'all' || activeTab === 'stock'
    ? orders
    : orders.filter((o) => o.type === activeTab);

  const totalValue = orders.reduce((sum, o) => sum + o.total, 0);
  const placedCount = orders.filter((o) => o.type === 'placed').length;
  const sentCount = orders.filter((o) => o.type === 'sent').length;
  const pendingCount = orders.filter((o) => o.type === 'pending').length;

  const handlePlaceOrder = () => {
    if (!newOrder.medicine || !newOrder.qty) return;
    const med = medicines.find((m) => m.name === newOrder.medicine);
    const price = unitPrices[newOrder.medicine] ?? 2.0;
    const qty = parseInt(newOrder.qty);
    const order: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      type: 'placed',
      medicine: newOrder.medicine,
      batchNo: med?.batchNo ?? 'BTH-NEW',
      qty,
      unitPrice: price,
      total: price * qty,
      date: '2026-08-15',
      status: 'Confirmed',
      supplier: newOrder.supplier || med?.supplier || 'Unknown',
    };
    setOrders((prev) => [order, ...prev]);
    setNewOrder({ medicine: '', qty: '', supplier: '' });
    setShowPlaceOrder(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Transaction History</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track all orders — placed, sent, and pending</p>
        </div>
        <button
          onClick={() => setShowPlaceOrder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Place New Order
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: orders.length, icon: Package, bg: 'bg-secondary', iconColor: 'text-primary' },
          { label: 'Placed Orders', value: placedCount, icon: ShoppingCart, bg: 'bg-green-50', iconColor: 'text-green-600' },
          { label: 'Sent Orders', value: sentCount, icon: Send, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
          { label: 'Pending Orders', value: pendingCount, icon: Clock, bg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={kpi.iconColor} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Value Banner */}
      <div className="card p-4 flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Transaction Value</p>
            <p className="text-xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">Aug 2026</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={13} className={activeTab === tab.key ? tab.color : ''} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Stock & Pricing Tab */}
      {activeTab === 'stock' ? (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Stock Inventory with Pricing</h3>
            <p className="text-xs text-muted-foreground">Current stock levels and unit prices</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Medicine</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Category</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Current Stock</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Unit Price</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Stock Value</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {medicines.map((med) => {
                  const price = unitPrices[med.name] ?? 2.0;
                  const stockValue = price * med.currentStock;
                  const isCritical = med.currentStock < med.threshold;
                  return (
                    <tr key={med.id} className={isCritical ? 'bg-red-50/60' : 'hover:bg-muted/20'}>
                      <td className="px-4 py-2.5 font-medium text-foreground">{med.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{med.category}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                        {med.currentStock} <span className="text-muted-foreground font-normal">{med.unit}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-foreground">${price.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-foreground">${stockValue.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          med.status === 'In Stock' ? 'bg-green-100 text-green-700' :
                          med.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' :
                          med.status === 'Critical'? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>{med.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Orders Table */
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground capitalize">
                {activeTab === 'all' ? 'All Orders' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Orders`}
              </h3>
              <p className="text-xs text-muted-foreground">{filteredOrders.length} records found</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Order ID</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Medicine</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Supplier</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Qty</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Unit Price</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground">Total</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Type</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-primary font-medium">{order.id}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      <div>{order.medicine}</div>
                      <div className="text-muted-foreground text-[10px]">{order.batchNo}</div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{order.supplier}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-foreground">{order.qty}</td>
                    <td className="px-4 py-2.5 text-right text-foreground">${order.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-foreground">${order.total.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        order.type === 'placed' ? 'bg-green-100 text-green-700' :
                        order.type === 'sent'? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.type === 'placed' && <ShoppingCart size={9} />}
                        {order.type === 'sent' && <Send size={9} />}
                        {order.type === 'pending' && <Clock size={9} />}
                        {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Place Order Modal */}
      {showPlaceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-foreground mb-4">Place New Order</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Medicine</label>
                <select
                  value={newOrder.medicine}
                  onChange={(e) => setNewOrder((p) => ({ ...p, medicine: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select medicine...</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity</label>
                <input
                  type="number"
                  value={newOrder.qty}
                  onChange={(e) => setNewOrder((p) => ({ ...p, qty: e.target.value }))}
                  placeholder="Enter quantity"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Supplier (optional)</label>
                <input
                  type="text"
                  value={newOrder.supplier}
                  onChange={(e) => setNewOrder((p) => ({ ...p, supplier: e.target.value }))}
                  placeholder="Supplier name"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {newOrder.medicine && newOrder.qty && (
                <div className="bg-secondary rounded-lg px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Estimated Total: </span>
                  <span className="font-bold text-foreground">
                    ${((unitPrices[newOrder.medicine] ?? 2.0) * parseInt(newOrder.qty || '0')).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowPlaceOrder(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
