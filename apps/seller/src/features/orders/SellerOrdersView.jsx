import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  User,
  X,
  Send,
} from 'lucide-react';
import { sellerRequest, formatINR } from '../../lib/apiClient';

export function SellerOrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState('');

  // Fulfillment transition modal
  const [fulfillmentTargetItem, setFulfillmentTargetItem] = useState(null);
  const [fulfillmentTargetStatus, setFulfillmentTargetStatus] = useState('PROCESSING');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('BlueDart / Delhivery');
  const [actionLoading, setActionLoading] = useState(false);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === 'ALL'
          ? '/seller/orders?limit=50'
          : `/seller/orders?status=${statusFilter}&limit=50`;
      const res = await sellerRequest(url);
      setOrders(res?.data || []);
    } catch (err) {
      console.warn('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateFulfillment = async () => {
    if (!fulfillmentTargetItem) return;
    try {
      setActionLoading(true);
      await sellerRequest(
        `/seller/orders/items/${fulfillmentTargetItem.id}/fulfillment`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: fulfillmentTargetStatus,
            trackingNumber: trackingNumber || undefined,
            shippingCarrier: shippingCarrier || undefined,
          }),
        },
      );

      showToastMsg(`Item status updated to ${fulfillmentTargetStatus}`);
      setFulfillmentTargetItem(null);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      showToastMsg(err.message || 'Failed to update fulfillment status');
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
          <h1 className="text-xl font-extrabold text-navy">
            Orders & Fulfillment
          </h1>
          <p className="text-xs text-muted mt-1">
            Fulfill orders containing your products, generate tracking numbers, and confirm deliveries.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-border hover:bg-canvas text-navy rounded-xl text-xs font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-border shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  statusFilter === st
                    ? 'bg-navy text-white'
                    : 'bg-canvas text-muted hover:text-navy'
                }`}
              >
                {st}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas border-b border-border text-muted font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order / Date</th>
                <th className="px-5 py-3.5">Customer & Delivery</th>
                <th className="px-5 py-3.5">Your Store Items</th>
                <th className="px-5 py-3.5">Your Earnings</th>
                <th className="px-5 py-3.5">Fulfillment</th>
                <th className="px-5 py-3.5 text-right">Order Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-muted">
                    Loading vendor orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-muted">
                    <ShoppingBag className="w-8 h-8 text-muted/60 mx-auto mb-2" />
                    <span>No orders found matching the filter.</span>
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const firstItem = ord.items?.[0];
                  const itemStatus = firstItem?.fulfillmentStatus || 'PENDING';

                  return (
                    <tr key={ord.id} className="hover:bg-canvas/40 transition">
                      {/* Order number & timestamp */}
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-navy text-xs sm:text-sm">
                          #{ord.orderNumber}
                        </div>
                        <div className="text-[10px] text-muted mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-navy">{ord.customerName}</div>
                        <div className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-teal shrink-0" />
                          <span>
                            {ord.addressSnapshot?.city || 'Local'}, {ord.addressSnapshot?.state || 'India'}
                          </span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-navy">
                          {ord.sellerItemsCount} item{ord.sellerItemsCount > 1 ? 's' : ''}
                        </div>
                        <div className="text-[10px] text-muted truncate max-w-xs">
                          {firstItem?.nameSnapshot}
                          {ord.sellerItemsCount > 1 ? ` + ${ord.sellerItemsCount - 1} more` : ''}
                        </div>
                      </td>

                      {/* Net seller value */}
                      <td className="px-5 py-4 font-bold text-royal-blue">
                        {formatINR(ord.sellerSubtotal)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            itemStatus === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : itemStatus === 'SHIPPED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : itemStatus === 'PROCESSING'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              itemStatus === 'DELIVERED'
                                ? 'bg-emerald-500'
                                : itemStatus === 'SHIPPED'
                                ? 'bg-blue-500'
                                : 'bg-amber-500 animate-pulse'
                            }`}
                          />
                          {itemStatus}
                        </span>
                      </td>

                      {/* View Button */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 bg-royal-blue/10 hover:bg-royal-blue text-royal-blue hover:text-white rounded-xl text-xs font-semibold transition"
                        >
                          View & Fulfill
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-border my-8">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal tracking-wider">
                  Order Fulfillment
                </span>
                <h3 className="font-extrabold text-navy text-lg font-mono">
                  #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-muted hover:text-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 p-4 bg-canvas rounded-2xl border border-border text-xs">
              <div>
                <div className="font-bold text-navy flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-royal-blue" />
                  <span>Customer Details</span>
                </div>
                <div className="mt-1 text-navy font-semibold">{selectedOrder.customerName}</div>
                {selectedOrder.customerPhone && (
                  <div className="text-muted flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="font-bold text-navy flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal" />
                  <span>Delivery Address</span>
                </div>
                <div className="mt-1 text-navy">
                  {selectedOrder.addressSnapshot?.line1 || 'Address Line 1'}
                  {selectedOrder.addressSnapshot?.line2 && `, ${selectedOrder.addressSnapshot.line2}`}
                </div>
                <div className="text-muted">
                  {selectedOrder.addressSnapshot?.city}, {selectedOrder.addressSnapshot?.state} -{' '}
                  {selectedOrder.addressSnapshot?.postalCode}
                </div>
              </div>
            </div>

            {/* Isolated Store Items List */}
            <div className="mt-6">
              <h4 className="font-bold text-navy text-xs uppercase tracking-wider mb-3">
                Your Store Items ({selectedOrder.items?.length || 0})
              </h4>

              <div className="space-y-3">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.imageSnapshot ||
                          'https://images.unsplash.com/photo-1546868871-7041f2a55e12'
                        }
                        alt={item.nameSnapshot}
                        className="w-12 h-12 object-cover rounded-xl border border-border"
                      />
                      <div>
                        <div className="font-bold text-navy text-xs sm:text-sm">
                          {item.nameSnapshot}
                        </div>
                        <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                          <span className="font-mono">SKU: {item.skuSnapshot || 'STD'}</span>
                          <span>•</span>
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span className="font-bold text-royal-blue">
                            {formatINR(Number(item.priceSnapshot) * item.quantity)}
                          </span>
                        </div>
                        {item.trackingNumber && (
                          <div className="text-[10px] text-teal font-medium mt-1">
                            Tracking: {item.shippingCarrier} - {item.trackingNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Transition Trigger */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          item.fulfillmentStatus === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.fulfillmentStatus === 'SHIPPED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.fulfillmentStatus}
                      </span>

                      {item.fulfillmentStatus !== 'DELIVERED' && (
                        <div className="flex items-center gap-1">
                          {item.fulfillmentStatus === 'PENDING' && (
                            <button
                              onClick={() => {
                                setFulfillmentTargetItem(item);
                                setFulfillmentTargetStatus('PROCESSING');
                              }}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold"
                            >
                              Process
                            </button>
                          )}
                          {item.fulfillmentStatus !== 'SHIPPED' && (
                            <button
                              onClick={() => {
                                setFulfillmentTargetItem(item);
                                setFulfillmentTargetStatus('SHIPPED');
                              }}
                              className="px-2.5 py-1 bg-royal-blue text-white hover:bg-royal-blue/90 rounded-lg text-xs font-semibold"
                            >
                              Ship
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setFulfillmentTargetItem(item);
                              setFulfillmentTargetStatus('DELIVERED');
                            }}
                            className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold"
                          >
                            Delivered
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted">
                Platform Commission automatically calculated upon order delivery.
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-canvas hover:bg-border text-navy rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fulfillment Shipping Modal */}
      {fulfillmentTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-border">
            <h3 className="font-extrabold text-navy text-sm">
              Update to: {fulfillmentTargetStatus}
            </h3>
            <p className="text-xs text-muted mt-1 truncate">
              {fulfillmentTargetItem.nameSnapshot}
            </p>

            {fulfillmentTargetStatus === 'SHIPPED' && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Shipping Courier Partner
                  </label>
                  <input
                    type="text"
                    value={shippingCarrier}
                    onChange={(e) => setShippingCarrier(e.target.value)}
                    placeholder="e.g. BlueDart / Delhivery / DTDC"
                    className="w-full mt-1 p-2.5 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Tracking AWB Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. AWB982341234IN"
                    className="w-full mt-1 p-2.5 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono uppercase"
                  />
                </div>
              </div>
            )}

            {fulfillmentTargetStatus === 'DELIVERED' && (
              <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                Marking this item as Delivered will make its net earnings available in your payout ledger.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setFulfillmentTargetItem(null)}
                className="px-4 py-2 text-xs text-muted hover:text-navy font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleUpdateFulfillment}
                className="px-4 py-2 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                {actionLoading ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerOrdersView;
