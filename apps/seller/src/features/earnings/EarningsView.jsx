import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  Percent,
  Clock,
  CheckCircle,
  ArrowDownToLine,
  RefreshCw,
  Building,
  ShieldCheck,
  X,
  CreditCard,
} from 'lucide-react';
import { sellerRequest, formatINR } from '../../lib/apiClient';

export function EarningsView({ sellerProfile }) {
  const [summary, setSummary] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [subTab, setSubTab] = useState('ledger'); // 'ledger' | 'payouts'
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, commRes, payRes] = await Promise.allSettled([
        sellerRequest('/seller/commissions/summary'),
        sellerRequest('/seller/commissions?limit=50'),
        sellerRequest('/seller/payouts?limit=50'),
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value?.data) {
        setSummary(sumRes.value.data);
      } else {
        setSummary({
          grossSales: 0,
          totalCommissionDeducted: 0,
          netEarnings: 0,
          availableForPayout: 0,
          pendingSettlement: 0,
          totalPaidOut: 0,
          commissionRate: 10,
        });
      }

      if (commRes.status === 'fulfilled' && commRes.value?.data) {
        setCommissions(commRes.value.data);
      }
      if (payRes.status === 'fulfilled' && payRes.value?.data) {
        setPayouts(payRes.value.data);
      }
    } catch (err) {
      console.warn('Earnings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (!amountNum || amountNum < 500) {
      showToastMsg('Minimum withdrawal amount is ₹500');
      return;
    }
    if (amountNum > (summary?.availableForPayout || 0)) {
      showToastMsg('Requested amount exceeds available balance');
      return;
    }

    try {
      setActionLoading(true);
      await sellerRequest('/seller/payouts/request', {
        method: 'POST',
        body: JSON.stringify({
          amount: amountNum,
          notes: payoutNotes || undefined,
        }),
      });

      showToastMsg(`Payout request for ₹${amountNum} submitted successfully`);
      setShowPayoutModal(false);
      setPayoutAmount('');
      setPayoutNotes('');
      fetchData();
    } catch (err) {
      showToastMsg(err.message || 'Failed to submit payout request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border border-royal-blue/30 animate-bounce">
          {toast}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-navy">Earnings & Payouts</h1>
          <p className="text-xs text-muted mt-1">
            Track gross sales, platform commission deductions, and withdraw net earnings to your registered bank account.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={(summary?.availableForPayout || 0) < 500}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Request Payout</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2 text-muted hover:text-navy rounded-xl hover:bg-canvas transition border border-border bg-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider opacity-90">
              Available For Payout
            </span>
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold">
              {formatINR(summary?.availableForPayout || 0)}
            </div>
            <p className="text-[11px] opacity-80 mt-1">
              From completed and delivered customer orders
            </p>
          </div>
        </div>

        {/* Pending Settlement */}
        <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Pending Settlement</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-navy">
              {formatINR(summary?.pendingSettlement || 0)}
            </div>
            <p className="text-[11px] text-muted mt-1">
              In-transit or processing orders awaiting delivery
            </p>
          </div>
        </div>

        {/* Lifetime Paid Out */}
        <div className="bg-white p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Total Disbursed</span>
            <div className="p-2 rounded-xl bg-royal-blue/10 text-royal-blue">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-navy">
              {formatINR(summary?.totalPaidOut || 0)}
            </div>
            <p className="text-[11px] text-muted mt-1">
              Directly deposited to your bank account
            </p>
          </div>
        </div>
      </div>

      {/* Financial Breakdown Card */}
      <div className="bg-white p-5 rounded-2xl border border-border shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-canvas text-navy">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-muted block">Platform Commission Rate:</span>
            <span className="font-bold text-navy text-sm">
              {summary?.commissionRate || 10}%
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-border hidden sm:block" />

        <div>
          <span className="text-muted block">Gross Customer Sales:</span>
          <span className="font-bold text-navy text-sm">
            {formatINR(summary?.grossSales || 0)}
          </span>
        </div>

        <div className="h-8 w-px bg-border hidden sm:block" />

        <div>
          <span className="text-muted block">Commission Deductions:</span>
          <span className="font-bold text-rose-600 text-sm">
            - {formatINR(summary?.totalCommissionDeducted || 0)}
          </span>
        </div>

        <div className="h-8 w-px bg-border hidden sm:block" />

        <div>
          <span className="text-muted block">Net Seller Earnings:</span>
          <span className="font-bold text-teal text-sm">
            {formatINR(summary?.netEarnings || 0)}
          </span>
        </div>
      </div>

      {/* Tabs Switcher: Ledger vs Payouts */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setSubTab('ledger')}
          className={`pb-2 px-3 text-xs font-bold transition border-b-2 -mb-2.5 ${
            subTab === 'ledger'
              ? 'border-royal-blue text-royal-blue'
              : 'border-transparent text-muted hover:text-navy'
          }`}
        >
          Commission Ledger Transactions ({commissions.length})
        </button>
        <button
          onClick={() => setSubTab('payouts')}
          className={`pb-2 px-3 text-xs font-bold transition border-b-2 -mb-2.5 ${
            subTab === 'payouts'
              ? 'border-royal-blue text-royal-blue'
              : 'border-transparent text-muted hover:text-navy'
          }`}
        >
          Disbursement / Payout History ({payouts.length})
        </button>
      </div>

      {/* SubTab 1: Commission Ledger */}
      {subTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border text-muted font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Order / Item</th>
                  <th className="px-5 py-3.5">Gross Amount</th>
                  <th className="px-5 py-3.5">Commission Rate</th>
                  <th className="px-5 py-3.5">Deduction</th>
                  <th className="px-5 py-3.5">Net Seller Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-muted">
                      No commission records yet. Completed orders will be reflected here.
                    </td>
                  </tr>
                ) : (
                  commissions.map((c) => (
                    <tr key={c.id} className="hover:bg-canvas/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-navy">
                          {c.orderItem?.nameSnapshot || 'Store Product'}
                        </div>
                        <div className="text-[10px] text-muted font-mono mt-0.5">
                          Order #{c.orderItem?.order?.orderNumber}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-navy">
                        {formatINR(c.grossAmount)}
                      </td>

                      <td className="px-5 py-3.5 text-muted">
                        {c.commissionRate}%
                      </td>

                      <td className="px-5 py-3.5 text-rose-600 font-medium">
                        - {formatINR(c.commissionAmount)}
                      </td>

                      <td className="px-5 py-3.5 font-bold text-emerald-700">
                        {formatINR(c.netSellerAmount)}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            c.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : c.status === 'PAID'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Payouts History */}
      {subTab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border text-muted font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Payout Reference</th>
                  <th className="px-5 py-3.5">Requested Date</th>
                  <th className="px-5 py-3.5">Amount Disbursed</th>
                  <th className="px-5 py-3.5">Destination Bank</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-10 text-center text-muted">
                      No withdrawal requests placed yet.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-canvas/40 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-navy">
                        #{p.payoutNumber}
                      </td>

                      <td className="px-5 py-3.5 text-muted">
                        {new Date(p.requestedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-5 py-3.5 font-bold text-emerald-700 text-sm">
                        {formatINR(p.amount)}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-navy">{p.seller?.bankName || 'Bank'}</div>
                        <div className="text-[10px] text-muted font-mono">
                          A/C: ****{p.seller?.bankAccountNumber?.slice(-4) || '0000'}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            p.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.status === 'PROCESSING'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-extrabold text-navy text-sm">
                Request Earnings Withdrawal
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="p-1 text-muted hover:text-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="mt-5 space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-semibold">
                  Maximum Available:
                </span>
                <span className="font-extrabold text-emerald-900 text-base">
                  {formatINR(summary?.availableForPayout || 0)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy">
                  Withdrawal Amount (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  max={summary?.availableForPayout || 0}
                  step="1"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="mt-1 w-full p-3 text-sm border border-border rounded-xl focus:outline-none focus:border-royal-blue font-bold"
                />
                <span className="text-[10px] text-muted mt-1 block">
                  Minimum withdrawal threshold: ₹500
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy">
                  Deposit Destination
                </label>
                <div className="mt-1 p-3 bg-canvas rounded-xl border border-border text-xs flex items-center gap-3">
                  <Building className="w-4 h-4 text-teal shrink-0" />
                  <div>
                    <div className="font-semibold text-navy">
                      {sellerProfile?.bankName || 'Verified Bank Account'}
                    </div>
                    <div className="text-[10px] text-muted font-mono">
                      A/C: {sellerProfile?.bankAccountNumber || '••••••••'} | IFSC:{' '}
                      {sellerProfile?.bankIfscCode || '••••'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy">
                  Transfer Notes (Optional)
                </label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. End of month withdrawal"
                  className="mt-1 w-full p-2.5 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EarningsView;
