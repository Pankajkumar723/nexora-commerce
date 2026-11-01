import React, { useState } from 'react';
import {
  Store,
  CreditCard,
  Building,
  Save,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { sellerRequest } from '../../lib/apiClient';

export function SellerSettingsView({ sellerProfile, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    storeName: sellerProfile?.storeName || '',
    storeDescription: sellerProfile?.storeDescription || '',
    storeLogo: sellerProfile?.storeLogo || '',
    storeBanner: sellerProfile?.storeBanner || '',
    phone: sellerProfile?.phone || '',
    businessAddress: sellerProfile?.businessAddress || '',
    bankAccountName: sellerProfile?.bankAccountName || '',
    bankAccountNumber: sellerProfile?.bankAccountNumber || '',
    bankIfscCode: sellerProfile?.bankIfscCode || '',
    bankName: sellerProfile?.bankName || '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await sellerRequest('/sellers/profile', {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });

      showToastMsg('Store settings updated successfully');
      if (onProfileUpdated && res?.data) {
        onProfileUpdated(res.data);
      }
    } catch (err) {
      showToastMsg(err.message || 'Failed to update store settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border border-royal-blue/30 animate-bounce">
          {toast}
        </div>
      )}

      {/* Top Header */}
      <div>
        <h1 className="text-xl font-extrabold text-navy">Store Settings</h1>
        <p className="text-xs text-muted mt-1">
          Manage your public brand identity, verified business contact, and bank payout destination.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Profile Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <Store className="w-5 h-5 text-royal-blue" />
            <h3 className="text-sm font-bold text-navy">Store Branding & Public Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="block text-xs font-semibold text-navy">
                Store / Brand Name
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) =>
                  setFormData({ ...formData, storeName: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Store Slug (Permanent URL)
              </label>
              <input
                type="text"
                disabled
                value={sellerProfile?.storeSlug || ''}
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl bg-canvas text-muted cursor-not-allowed font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy">
                Store Description / Brand Story
              </label>
              <textarea
                rows={3}
                value={formData.storeDescription}
                onChange={(e) =>
                  setFormData({ ...formData, storeDescription: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Store Logo Image URL
              </label>
              <input
                type="url"
                value={formData.storeLogo}
                onChange={(e) =>
                  setFormData({ ...formData, storeLogo: e.target.value })
                }
                placeholder="https://images.unsplash.com/..."
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Store Banner Image URL
              </label>
              <input
                type="url"
                value={formData.storeBanner}
                onChange={(e) =>
                  setFormData({ ...formData, storeBanner: e.target.value })
                }
                placeholder="https://images.unsplash.com/..."
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono"
              />
            </div>
          </div>
        </div>

        {/* Business & Location Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <Building className="w-5 h-5 text-teal" />
            <h3 className="text-sm font-bold text-navy">Contact & Business Verification</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="block text-xs font-semibold text-navy">
                Merchant Phone Number
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Registered Tax ID / GSTIN
              </label>
              <input
                type="text"
                disabled
                value={sellerProfile?.taxId || ''}
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl bg-canvas text-muted cursor-not-allowed uppercase font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy">
                Operating Business Address
              </label>
              <input
                type="text"
                required
                value={formData.businessAddress}
                onChange={(e) =>
                  setFormData({ ...formData, businessAddress: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
            </div>
          </div>
        </div>

        {/* Bank & Settlement Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-border">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-navy">Payout Bank Account</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="block text-xs font-semibold text-navy">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                value={formData.bankAccountName}
                onChange={(e) =>
                  setFormData({ ...formData, bankAccountName: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Bank Account Number
              </label>
              <input
                type="text"
                required
                value={formData.bankAccountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, bankAccountNumber: e.target.value })
                }
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Bank IFSC Code
              </label>
              <input
                type="text"
                required
                value={formData.bankIfscCode}
                onChange={(e) =>
                  setFormData({ ...formData, bankIfscCode: e.target.value.toUpperCase() })
                }
                className="mt-1 w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono uppercase"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default SellerSettingsView;
