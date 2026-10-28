import React from 'react';
import { IndianRupee, ShoppingBag, Box, Users, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { formatINR } from '../../lib/apiClient';

export function DashboardView({ analytics = {}, onNavigateTab }) {
  const {
    revenue = 88495,
    totalOrders = 12,
    totalProducts = 6,
    totalCustomers = 18,
    lowStockCount = 1,
    lowStockVariants = [
      { id: 'v-1', sku: 'NEX-HP-SLV', productName: 'Nexora Studio Pro Wireless ANC Headphones', stockQuantity: 4 },
    ],
    recentOrders = [
      { id: 'o-1', orderNumber: 'NEX-20261028-A4F102', customerName: 'Aryan Sharma', total: 18999, status: 'CONFIRMED', itemCount: 1, createdAt: new Date().toISOString() },
      { id: 'o-2', orderNumber: 'NEX-20261028-B7C911', customerName: 'Devina Kapoor', total: 27499, status: 'SHIPPED', itemCount: 1, createdAt: new Date().toISOString() },
      { id: 'o-3', orderNumber: 'NEX-20261027-E9A014', customerName: 'Rohan Mehra', total: 8499, status: 'DELIVERED', itemCount: 1, createdAt: new Date().toISOString() },
    ],
  } = analytics;

  const kpis = [
    { label: 'Gross Revenue', value: formatINR(revenue), icon: IndianRupee, change: '+18.4%', color: 'text-royal-blue', bg: 'bg-blue-50' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, change: '+12.1%', color: 'text-teal', bg: 'bg-teal-50' },
    { label: 'Active Catalog', value: `${totalProducts} Products`, icon: Box, change: '100% in stock', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Customer Base', value: totalCustomers, icon: Users, change: '+9 this week', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white rounded-card p-5 border border-border shadow-sm flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-muted block">{kpi.label}</span>
                <span className="text-2xl font-bold text-navy mt-1 block">{kpi.value}</span>
                <span className="text-[11px] font-medium text-emerald-600 mt-2 block flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{kpi.change}</span>
                </span>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Low-Stock Warning Banner if applicable */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-warning rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-navy">
                {lowStockCount} SKU Variant{lowStockCount > 1 ? 's' : ''} Running Low on Stock
              </h4>
              <p className="text-[11px] text-muted mt-0.5">
                Restock inventory before item goes into backorder state.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-3.5 py-1.5 bg-warning text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
          >
            Adjust Inventory
          </button>
        </div>
      )}

      {/* 3. Recent Orders & Stock Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-card border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-navy">Recent Customer Orders</h3>
              <p className="text-xs text-muted mt-0.5">Real-time payment and order state</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-royal-blue hover:text-navy font-semibold"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-canvas transition-colors">
                    <td className="py-3 font-mono font-bold text-navy">{ord.orderNumber}</td>
                    <td className="py-3 text-gray-700">{ord.customerName}</td>
                    <td className="py-3 font-semibold text-navy">{formatINR(ord.total)}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'CONFIRMED'
                            ? 'bg-blue-50 text-royal-blue'
                            : ord.status === 'SHIPPED'
                            ? 'bg-purple-50 text-purple-700'
                            : ord.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className="bg-white rounded-card border border-border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy mb-1">Critical Stock Levels</h3>
            <p className="text-xs text-muted mb-4">SKUs requiring replenishment</p>

            <div className="space-y-3">
              {lowStockVariants.map((item) => (
                <div key={item.id} className="p-3 bg-canvas rounded-xl border border-border">
                  <div className="flex items-center justify-between text-xs font-semibold text-navy">
                    <span className="font-mono">{item.sku}</span>
                    <span className="text-warning font-bold">{item.stockQuantity} Left</span>
                  </div>
                  <span className="text-[11px] text-muted block mt-1 line-clamp-1">
                    {item.productName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="w-full mt-6 py-2.5 bg-canvas hover:bg-gray-200 border border-border rounded-xl text-xs font-bold text-navy transition"
          >
            Manage All Inventory
          </button>
        </div>
      </div>
    </div>
  );
}
