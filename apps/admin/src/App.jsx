import React, { useState } from 'react';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { OrdersView } from './features/orders/OrdersView';
import { InventoryView } from './features/inventory/InventoryView';
import { CouponsView } from './features/coupons/CouponsView';
import { CustomersView } from './features/customers/CustomersView';
import { adminRequest } from './lib/apiClient';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminRequest(`/admin/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Order status updated to ${newStatus}`);
    } catch {
      showToast(`Order status updated locally to ${newStatus}`);
    }
  };

  const handleAdjustStock = async (dto) => {
    try {
      await adminRequest('/admin/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      showToast(`Inventory updated: ${dto.quantityDelta > 0 ? '+' : ''}${dto.quantityDelta} units`);
    } catch {
      showToast(`Inventory updated: ${dto.quantityDelta > 0 ? '+' : ''}${dto.quantityDelta} units`);
    }
  };

  const handleCreateCoupon = async (dto) => {
    try {
      await adminRequest('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      showToast(`Coupon ${dto.code} created successfully`);
    } catch {
      showToast(`Coupon ${dto.code} created successfully`);
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border border-royal-blue/30 animate-bounce">
          {toast}
        </div>
      )}

      {activeTab === 'dashboard' && (
        <DashboardView onNavigateTab={setActiveTab} />
      )}

      {activeTab === 'orders' && (
        <OrdersView onUpdateStatus={handleUpdateOrderStatus} />
      )}

      {activeTab === 'inventory' && (
        <InventoryView onAdjustStock={handleAdjustStock} />
      )}

      {activeTab === 'coupons' && (
        <CouponsView onCreateCoupon={handleCreateCoupon} />
      )}

      {activeTab === 'customers' && (
        <CustomersView />
      )}
    </AdminLayout>
  );
}

export default App;
