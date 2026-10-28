import React from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import { formatINR } from '../../lib/apiClient';

export function CustomersView({ customers = [] }) {
  const defaultCustomers =
    customers.length > 0
      ? customers
      : [
          { id: 'c-1', name: 'Aryan Sharma', email: 'aryan@example.com', phone: '+91 98765 43210', orderCount: 3, totalSpent: 46497, joinedAt: '2026-10-27T00:00:00.000Z' },
          { id: 'c-2', name: 'Devina Kapoor', email: 'devina@example.com', phone: '+91 98111 22334', orderCount: 2, totalSpent: 35998, joinedAt: '2026-10-26T00:00:00.000Z' },
          { id: 'c-3', name: 'Rohan Mehra', email: 'rohan@example.com', phone: '+91 97222 33445', orderCount: 1, totalSpent: 8499, joinedAt: '2026-10-25T00:00:00.000Z' },
        ];

  return (
    <div className="bg-white rounded-card border border-border p-6 shadow-sm space-y-6">
      <div className="pb-4 border-b border-border">
        <h3 className="text-base font-bold text-navy">Customer Directory & Lifetime Value</h3>
        <p className="text-xs text-muted mt-0.5">
          View customer profiles, verified contact information, and cumulative spending.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border text-muted uppercase tracking-wider text-[10px]">
            <tr>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold">Contact Email</th>
              <th className="pb-3 font-semibold">Phone</th>
              <th className="pb-3 font-semibold">Lifetime Orders</th>
              <th className="pb-3 font-semibold">Cumulative Spend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {defaultCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-canvas transition-colors">
                <td className="py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-navy/10 text-navy font-bold text-xs flex items-center justify-center">
                      {c.name[0]}
                    </div>
                    <span className="font-semibold text-gray-900">{c.name}</span>
                  </div>
                </td>
                <td className="py-3.5 text-muted font-mono">{c.email}</td>
                <td className="py-3.5 text-gray-700">{c.phone || 'N/A'}</td>
                <td className="py-3.5 font-semibold text-navy">{c.orderCount} order(s)</td>
                <td className="py-3.5 font-bold text-royal-blue">{formatINR(c.totalSpent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
