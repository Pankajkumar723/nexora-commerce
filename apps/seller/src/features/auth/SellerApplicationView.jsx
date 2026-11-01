import React, { useState } from 'react';
import { Store, Building, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import { sellerRequest } from '../../lib/apiClient';

export function SellerApplicationView({ onApplicationSubmitted }) {
  const [formData, setFormData] = useState({
    storeName: '',
    storeSlug: '',
    storeDescription: '',
    phone: '',
    businessAddress: '',
    taxId: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'storeName' && !prev.storeSlug) {
        updated.storeSlug = value
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await sellerRequest('/sellers/apply', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res?.data) {
        onApplicationSubmitted(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit application. Please verify all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy text-white shadow-lg mb-3">
            <Store className="w-7 h-7 text-teal" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy">
            Merchant Onboarding Application
          </h1>
          <p className="text-xs text-muted mt-1 max-w-lg mx-auto">
            Please provide your verified store and banking credentials. Our compliance team verifies merchant documents within 24 hours.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden">
          {error && (
            <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            {/* Section 1: Store & Brand Profile */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <Store className="w-5 h-5 text-royal-blue" />
                <h3 className="text-sm font-bold text-navy">
                  1. Store & Brand Profile
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Store / Brand Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.storeName}
                    onChange={(e) => handleChange('storeName', e.target.value)}
                    placeholder="e.g. Nexora Electronics"
                    className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Store URL Identifier (Slug) *
                  </label>
                  <div className="mt-1 flex rounded-xl border border-border overflow-hidden focus-within:border-royal-blue">
                    <span className="px-3 py-2 bg-canvas text-muted text-xs border-r border-border">
                      nexora.com/store/
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.storeSlug}
                      onChange={(e) => handleChange('storeSlug', e.target.value.toLowerCase())}
                      placeholder="nexora-electronics"
                      className="block w-full px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-navy">
                    Store Description / About the Merchant
                  </label>
                  <textarea
                    rows={2}
                    value={formData.storeDescription}
                    onChange={(e) => handleChange('storeDescription', e.target.value)}
                    placeholder="Describe the products you specialize in and your customer commitments..."
                    className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Business Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    GSTIN / Business Tax Identification Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value.toUpperCase())}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-navy">
                    Registered Business Operating Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessAddress}
                    onChange={(e) => handleChange('businessAddress', e.target.value)}
                    placeholder="Plot 42, Hitech City, Hyderabad, Telangana, 500081"
                    className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Banking & Payout Settlement */}
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <CreditCard className="w-5 h-5 text-teal" />
                <h3 className="text-sm font-bold text-navy">
                  2. Settlement Banking Credentials (INR Direct Deposit)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Bank Account Holder Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankAccountName}
                    onChange={(e) => handleChange('bankAccountName', e.target.value)}
                    placeholder="e.g. Nexora Retail Pvt Ltd"
                    className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    placeholder="e.g. HDFC Bank Ltd"
                    className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                    placeholder="918273645012"
                    className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Bank IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankIfscCode}
                    onChange={(e) => handleChange('bankIfscCode', e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Agreement Notice */}
            <div className="bg-canvas p-4 rounded-2xl border border-border text-xs text-muted">
              By submitting this application, you agree to the standard platform commission structure (10% per completed order) and Nexora Commerce vendor fulfillment guidelines.
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Submitting Application...' : 'Submit Seller Application'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SellerApplicationView;
