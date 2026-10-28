import React, { useState } from 'react';
import { Tag, Plus, CheckCircle, Clock } from 'lucide-react';

export function CouponsView({ coupons = [], onCreateCoupon }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [value, setValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(1000);
  const [usageLimit, setUsageLimit] = useState(200);

  const defaultCoupons =
    coupons.length > 0
      ? coupons
      : [
          { id: 'cp-1', code: 'NEXORA10', discountType: 'PERCENTAGE', value: 10, minOrderAmount: 1000, usageLimit: 1000, usedCount: 14, active: true, expiresAt: '2027-10-28T00:00:00.000Z' },
          { id: 'cp-2', code: 'WELCOME500', discountType: 'FIXED_AMOUNT', value: 500, minOrderAmount: 2500, usageLimit: 500, usedCount: 8, active: true, expiresAt: '2027-04-28T00:00:00.000Z' },
        ];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!code) return;
    const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 6 months
    onCreateCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount),
      usageLimit: Number(usageLimit),
      expiresAt,
    });
    setModalOpen(false);
    setCode('');
  };

  return (
    <div className="bg-white rounded-card border border-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-navy">Promotional Coupons & Campaigns</h3>
          <p className="text-xs text-muted mt-0.5">
            Configure promotional discount codes with server-authoritative thresholds.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-royal-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border text-muted uppercase tracking-wider text-[10px]">
            <tr>
              <th className="pb-3 font-semibold">Code</th>
              <th className="pb-3 font-semibold">Discount Type</th>
              <th className="pb-3 font-semibold">Discount Value</th>
              <th className="pb-3 font-semibold">Min Order</th>
              <th className="pb-3 font-semibold">Redemptions</th>
              <th className="pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {defaultCoupons.map((c) => (
              <tr key={c.id} className="hover:bg-canvas transition-colors">
                <td className="py-3.5 font-mono font-bold text-navy">{c.code}</td>
                <td className="py-3.5 text-muted">{c.discountType}</td>
                <td className="py-3.5 font-bold text-navy">
                  {c.discountType === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} FLAT`}
                </td>
                <td className="py-3.5 text-gray-700">₹{c.minOrderAmount || 0}</td>
                <td className="py-3.5 text-muted">
                  <span className="font-semibold text-navy">{c.usedCount || 0}</span> / {c.usageLimit || '∞'}
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4"
          >
            <h4 className="text-sm font-bold text-navy">Create Promotional Coupon</h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-navy block mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. FESTIVE25"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2 bg-canvas border border-border rounded-xl font-mono uppercase focus:outline-none focus:ring-1 focus:ring-royal-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-navy block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded-xl focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-navy block mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-canvas border border-border rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-navy block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-navy block mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-canvas border border-border rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-muted hover:text-navy"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-royal-blue text-white text-xs font-bold rounded-xl shadow hover:bg-blue-600 transition"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
