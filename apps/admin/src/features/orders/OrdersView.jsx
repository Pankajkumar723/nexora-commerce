import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, Clock, Truck, Check, XCircle } from 'lucide-react';
import { formatINR } from '../../lib/apiClient';

export function OrdersView({ orders = [], onUpdateStatus }) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  const filteredOrders =
    selectedStatusFilter === 'ALL'
      ? orders
      : orders.filter((o) => o.status === selectedStatusFilter);

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="bg-white rounded-card border border-border p-6 shadow-sm space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-navy">Order Fulfillment & Management</h3>
          <p className="text-xs text-muted mt-0.5">
            Update order dispatch and tracking status across store lifecycle.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedStatusFilter === st
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-canvas text-muted hover:text-navy'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border text-muted uppercase tracking-wider text-[10px]">
            <tr>
              <th className="pb-3 font-semibold">Order ID</th>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold">Items</th>
              <th className="pb-3 font-semibold">Total Amount</th>
              <th className="pb-3 font-semibold">Payment</th>
              <th className="pb-3 font-semibold">Status Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-muted">
                  No orders found in status "{selectedStatusFilter}".
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-canvas transition-colors">
                  <td className="py-3.5 font-mono font-bold text-navy">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-gray-900 block">{ord.customerName}</span>
                    <span className="text-[10px] text-muted block">{ord.customerPhone || 'Verified'}</span>
                  </td>
                  <td className="py-3.5 text-gray-700 font-medium">{ord.itemCount} item(s)</td>
                  <td className="py-3.5 font-bold text-navy">{formatINR(ord.total)}</td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.paymentStatus === 'CAPTURED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-warning'
                      }`}
                    >
                      {ord.paymentStatus || 'CAPTURED'}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <select
                      value={ord.status}
                      onChange={(e) => onUpdateStatus(ord.id, e.target.value)}
                      className="text-xs font-semibold border border-border rounded-lg px-2.5 py-1 bg-white text-navy focus:outline-none focus:ring-1 focus:ring-royal-blue cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
