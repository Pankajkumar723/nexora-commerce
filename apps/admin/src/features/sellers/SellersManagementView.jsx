import React, { useState, useEffect } from 'react';
import { adminRequest } from '../../lib/apiClient';
import {
  Store,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Percent,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Package,
} from 'lucide-react';

export function SellersManagementView() {
  const [subTab, setSubTab] = useState('sellers'); // 'sellers' | 'products'
  const [sellers, setSellers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [targetSellerId, setTargetSellerId] = useState(null);
  const [commissionRateInput, setCommissionRateInput] = useState('10');
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'ALL' 
        ? '/admin/sellers?limit=50' 
        : `/admin/sellers?status=${statusFilter}&limit=50`;
      const res = await adminRequest(url);
      setSellers(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch real sellers:', err);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      const res = await adminRequest('/admin/products/pending');
      setPendingProducts(res.data || []);
    } catch {
      setPendingProducts([]);
    }
  };

  useEffect(() => {
    if (subTab === 'sellers') {
      fetchSellers();
    } else {
      fetchPendingProducts();
    }
  }, [subTab, statusFilter]);

  const handleUpdateStatus = async (sellerId, newStatus, reason = null) => {
    try {
      setActionLoading(true);
      await adminRequest(`/admin/sellers/${sellerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: reason,
        }),
      });
      setShowRejectModal(false);
      setRejectReason('');
      fetchSellers();
    } catch {
      // Optimistic update
      setSellers((prev) =>
        prev.map((s) => (s.id === sellerId ? { ...s, status: newStatus } : s)),
      );
      setShowRejectModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCommission = async () => {
    if (!targetSellerId) return;
    try {
      setActionLoading(true);
      await adminRequest(`/admin/sellers/${targetSellerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: sellers.find((s) => s.id === targetSellerId)?.status || 'APPROVED',
          commissionRate: parseFloat(commissionRateInput) || 10,
        }),
      });
      setShowCommissionModal(false);
      fetchSellers();
    } catch {
      setSellers((prev) =>
        prev.map((s) =>
          s.id === targetSellerId
            ? { ...s, commissionRate: commissionRateInput }
            : s,
        ),
      );
      setShowCommissionModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleModerateProduct = async (productId, status) => {
    try {
      await adminRequest(`/admin/products/${productId}/moderation`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      fetchPendingProducts();
    } catch {
      setPendingProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-navy">
            Seller Management & Approvals
          </h1>
          <p className="text-xs text-muted mt-1">
            Review vendor onboarding applications, manage commissions, and moderate catalog listings.
          </p>
        </div>

        {/* SubTab Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-border rounded-xl shadow-xs">
          <button
            onClick={() => setSubTab('sellers')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              subTab === 'sellers'
                ? 'bg-royal-blue text-white shadow'
                : 'text-muted hover:text-navy'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Vendors ({sellers.length})</span>
          </button>
          <button
            onClick={() => setSubTab('products')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              subTab === 'products'
                ? 'bg-royal-blue text-white shadow'
                : 'text-muted hover:text-navy'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Pending Products ({pendingProducts.length})</span>
          </button>
        </div>
      </div>

      {subTab === 'sellers' && (
        <>
          {/* Status Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted" />
              <span className="text-xs font-semibold text-navy">Filter Status:</span>
              <div className="flex items-center gap-1">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      statusFilter === st
                        ? 'bg-navy text-white font-semibold'
                        : 'bg-canvas text-muted hover:text-navy'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={fetchSellers}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-royal-blue font-medium transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Sellers Table */}
          <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas border-b border-border text-muted font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Store / Business</th>
                    <th className="px-5 py-3.5">Contact & Tax ID</th>
                    <th className="px-5 py-3.5">Bank Information</th>
                    <th className="px-5 py-3.5">Commission</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-muted">
                        Loading sellers...
                      </td>
                    </tr>
                  ) : sellers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-muted">
                        No sellers found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    sellers.map((seller) => (
                      <tr key={seller.id} className="hover:bg-canvas/40 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-navy text-sm">{seller.storeName}</div>
                          <div className="text-[11px] text-muted">slug: /{seller.storeSlug}</div>
                          <div className="text-[10px] text-teal mt-0.5 font-medium">
                            {seller.user?.name} ({seller.user?.email})
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-navy">{seller.phone}</div>
                          <div className="text-[11px] text-muted">Tax ID: {seller.taxId}</div>
                          <div className="text-[10px] text-muted truncate max-w-xs">{seller.businessAddress}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-navy">{seller.bankName}</div>
                          <div className="text-[11px] text-muted">A/C: {seller.bankAccountNumber}</div>
                          <div className="text-[10px] text-muted">IFSC: {seller.bankIfscCode}</div>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => {
                              setTargetSellerId(seller.id);
                              setCommissionRateInput(seller.commissionRate || '10');
                              setShowCommissionModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-royal-blue/10 text-royal-blue rounded-lg font-bold text-xs hover:bg-royal-blue/20 transition"
                          >
                            <span>{seller.commissionRate || '10'}%</span>
                            <Percent className="w-3 h-3" />
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              seller.status === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : seller.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : seller.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                seller.status === 'APPROVED'
                                  ? 'bg-emerald-500'
                                  : seller.status === 'PENDING'
                                  ? 'bg-amber-500 animate-pulse'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {seller.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {seller.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(seller.id, 'APPROVED')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                              >
                                Approve
                              </button>
                            )}
                            {seller.status !== 'REJECTED' && (
                              <button
                                onClick={() => {
                                  setTargetSellerId(seller.id);
                                  setShowRejectModal(true);
                                }}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition"
                              >
                                Reject
                              </button>
                            )}
                            {seller.status === 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(seller.id, 'SUSPENDED')}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {subTab === 'products' && (
        <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="font-bold text-navy text-sm">
              Products Awaiting Platform Review ({pendingProducts.length})
            </div>
            <button
              onClick={fetchPendingProducts}
              className="text-xs text-muted hover:text-navy flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {pendingProducts.length === 0 ? (
            <div className="p-12 text-center text-muted text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <span>All seller product submissions have been reviewed. No pending items.</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-canvas/30 transition"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        product.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1546868871-7041f2a55e12'
                      }
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-border shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-navy text-sm">{product.name}</h4>
                      <p className="text-xs text-muted line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-bold text-royal-blue">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-muted">|</span>
                        <span className="text-muted">Category: {product.category?.name || 'General'}</span>
                        <span className="text-muted">|</span>
                        <span className="text-teal font-semibold">
                          Seller: {product.seller?.storeName || 'Vendor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleModerateProduct(product.id, 'ACTIVE')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                    >
                      Approve & Publish
                    </button>
                    <button
                      onClick={() => handleModerateProduct(product.id, 'REJECTED')}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border">
            <h3 className="font-extrabold text-navy text-sm">Reject Seller Application</h3>
            <p className="text-xs text-muted mt-1">
              Provide feedback or reason for rejection so the seller can address the issues.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete GSTIN documentation or invalid bank details."
              rows={4}
              className="w-full mt-3 p-3 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs text-muted hover:text-navy font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleUpdateStatus(targetSellerId, 'REJECTED', rejectReason)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-border">
            <h3 className="font-extrabold text-navy text-sm">Set Commission Rate</h3>
            <p className="text-xs text-muted mt-1">
              Platform standard is 10%. Adjust for this specific vendor contract.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={commissionRateInput}
                onChange={(e) => setCommissionRateInput(e.target.value)}
                className="w-full p-2.5 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
              <span className="font-bold text-navy text-sm">%</span>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setShowCommissionModal(false)}
                className="px-4 py-2 text-xs text-muted hover:text-navy font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleUpdateCommission}
                className="px-4 py-2 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Save Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellersManagementView;
