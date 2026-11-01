import React, { useState, useEffect } from 'react';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  Boxes,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Sparkles,
} from 'lucide-react';
import { sellerRequest, formatINR } from '../../lib/apiClient';
import { AddProductView } from './AddProductView';

export function ProductsListView({ sellerStatus, sellerProfile }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categories, setCategories] = useState([]);

  // Views & Modals
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'edit'
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockDelta, setStockDelta] = useState(10);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/seller/products?limit=50`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;

      const res = await sellerRequest(url);
      setProducts(res?.data || []);
    } catch (err) {
      console.warn('Products fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await sellerRequest('/categories');
      setCategories(res?.data || []);
    } catch {
      // Fallback 20 categories
      setCategories([
        { id: 'cat-fashion', name: 'Fashion & Clothing' },
        { id: 'cat-electronics', name: 'Electronics' },
        { id: 'cat-mobiles', name: 'Mobiles & Accessories' },
        { id: 'cat-computers', name: 'Computers & Accessories' },
        { id: 'cat-home', name: 'Home & Kitchen' },
        { id: 'cat-furniture', name: 'Furniture & Decor' },
        { id: 'cat-appliances', name: 'Home Appliances' },
        { id: 'cat-beauty', name: 'Beauty & Personal Care' },
        { id: 'cat-health', name: 'Health & Wellness' },
        { id: 'cat-grocery', name: 'Grocery & Essentials' },
      ]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to archive this product?')) return;
    try {
      await sellerRequest(`/seller/products/${productId}`, { method: 'DELETE' });
      showToastMsg('Product moved to archive');
      fetchProducts();
    } catch (err) {
      showToastMsg(err.message || 'Failed to archive product');
    }
  };

  const handleAdjustStock = async () => {
    if (!stockProduct) return;
    try {
      setActionLoading(true);
      const variantId = stockProduct.variants?.[0]?.id;
      if (!variantId) {
        showToastMsg('Product has no variants configured to adjust stock');
        return;
      }
      await sellerRequest(`/seller/products/${stockProduct.id}/stock`, {
        method: 'POST',
        body: JSON.stringify({
          variantId,
          quantityDelta: parseInt(stockDelta, 10) || 0,
        }),
      });
      showToastMsg(`Stock updated by ${stockDelta > 0 ? '+' : ''}${stockDelta}`);
      setStockProduct(null);
      fetchProducts();
    } catch (err) {
      showToastMsg(err.message || 'Failed to update stock');
    } finally {
      setActionLoading(false);
    }
  };

  if (viewMode === 'create') {
    return (
      <AddProductView
        categories={categories}
        sellerProfile={sellerProfile}
        onBack={() => setViewMode('list')}
        onSuccess={() => {
          setViewMode('list');
          fetchProducts();
          showToastMsg('Product submitted for review');
        }}
      />
    );
  }

  if (viewMode === 'edit') {
    return (
      <AddProductView
        categories={categories}
        sellerProfile={sellerProfile}
        initialData={editingProduct}
        onBack={() => {
          setViewMode('list');
          setEditingProduct(null);
        }}
        onSuccess={() => {
          setViewMode('list');
          setEditingProduct(null);
          fetchProducts();
          showToastMsg('Product updated successfully');
        }}
      />
    );
  }

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
          <h1 className="text-xl font-extrabold text-navy">Product Catalog</h1>
          <p className="text-xs text-muted mt-1">
            Manage your store's inventory, multiple images, pricing, and moderation states.
          </p>
        </div>

        <button
          onClick={() => setViewMode('create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-xl text-xs font-bold shadow-md transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product title or SKU..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
          />
          <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
        </form>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'ACTIVE', 'PENDING_APPROVAL', 'DRAFT', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                statusFilter === st
                  ? 'bg-navy text-white'
                  : 'bg-canvas text-muted hover:text-navy'
              }`}
            >
              {st === 'PENDING_APPROVAL' ? 'Pending Review' : st}
            </button>
          ))}
          <button
            onClick={fetchProducts}
            className="p-2 text-muted hover:text-navy rounded-xl hover:bg-canvas transition ml-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas border-b border-border text-muted font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Product & SKU</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Selling Price</th>
                <th className="px-5 py-3.5">Stock Available</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-muted">
                    Loading your catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-muted">
                    <Package className="w-8 h-8 text-muted/60 mx-auto mb-2" />
                    <span>No products found. Click "Add New Product" to list your first item.</span>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const totalStock = p.variants?.reduce(
                    (sum, v) => sum + (v.stockQuantity || 0),
                    0,
                  ) ?? 0;
                  const isLowStock = totalStock <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-canvas/40 transition">
                      {/* Product Name & Image */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              p.images?.[0]?.url ||
                              'https://images.unsplash.com/photo-1546868871-7041f2a55e12'
                            }
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-xl border border-border shrink-0"
                          />
                          <div>
                            <div className="font-bold text-navy text-xs sm:text-sm line-clamp-1">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-muted flex items-center gap-2 mt-0.5">
                              <span className="font-mono">{p.variants?.[0]?.sku || p.slug}</span>
                              <span>•</span>
                              <span>{p.images?.length || 0} images</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-navy font-medium">
                        {p.category?.name || 'General'}
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-navy">{formatINR(p.price)}</div>
                        {p.compareAtPrice && (
                          <div className="text-[10px] text-muted line-through">
                            {formatINR(p.compareAtPrice)}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              totalStock === 0
                                ? 'text-rose-600'
                                : isLowStock
                                ? 'text-amber-600'
                                : 'text-navy'
                            }`}
                          >
                            {totalStock} units
                          </span>
                          <button
                            onClick={() => setStockProduct(p)}
                            title="Adjust inventory"
                            className="p-1 rounded-lg hover:bg-canvas text-muted hover:text-royal-blue transition"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {isLowStock && totalStock > 0 && (
                          <span className="text-[10px] text-amber-600 font-medium">
                            Low Stock Alert
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : p.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : p.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-rose-500'
                            }`}
                          />
                          {p.status === 'PENDING_APPROVAL' ? 'Pending Review' : p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setViewMode('edit');
                            }}
                            className="p-2 text-muted hover:text-royal-blue hover:bg-royal-blue/10 rounded-xl transition"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-muted hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Archive Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Adjust Stock Modal */}
      {stockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-border">
            <h3 className="font-extrabold text-navy text-sm">
              Adjust Inventory Stock
            </h3>
            <p className="text-xs text-muted mt-1 truncate">
              {stockProduct.name}
            </p>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-navy">
                Quantity Delta (e.g. +10 to restock, -5 to deduct)
              </label>
              <input
                type="number"
                value={stockDelta}
                onChange={(e) => setStockDelta(e.target.value)}
                className="w-full mt-1.5 p-2.5 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-bold text-center"
              />
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setStockProduct(null)}
                className="px-4 py-2 text-xs text-muted hover:text-navy font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleAdjustStock}
                className="px-4 py-2 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Save Stock Change
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent: Add / Edit Product Modal
function ProductFormModal({ categories, initialData, onClose, onSuccess }) {
  const isEdit = Boolean(initialData);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    compareAtPrice: initialData?.compareAtPrice || '',
    categoryId: initialData?.categoryId || categories[0]?.id || '',
    sku: initialData?.variants?.[0]?.sku || '',
    stockQuantity: initialData?.variants?.[0]?.stockQuantity ?? 10,
    images: initialData?.images?.map((img) => img.url) || [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddImageUrl = () => {
    if (formData.images.length < 5) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ''],
      }));
    }
  };

  const handleImageUrlChange = (idx, val) => {
    setFormData((prev) => {
      const updated = [...prev.images];
      updated[idx] = val;
      return { ...prev, images: updated };
    });
  };

  const handleRemoveImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: formData.description,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        categoryId: formData.categoryId,
        images: formData.images.filter((u) => u.trim() !== '').map((url) => ({ url })),
        variants: [
          {
            sku: formData.sku || `${formData.slug.substring(0, 8).toUpperCase()}-01`,
            attributes: { standard: true },
            stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
          },
        ],
      };

      if (isEdit) {
        await sellerRequest(`/seller/products/${initialData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await sellerRequest('/seller/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save product. Check required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-border my-8">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="font-extrabold text-navy text-base">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="p-1 text-muted hover:text-navy">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    name: val,
                    slug: isEdit ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                  }));
                }}
                placeholder="e.g. Ultra Wireless Headphones"
                className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Product SKU *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sku: e.target.value.toUpperCase() }))
                }
                placeholder="e.g. WH-1000-BLK"
                className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Selling Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="2999"
                className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Compare-at / MRP Price (₹ INR)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={formData.compareAtPrice}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, compareAtPrice: e.target.value }))
                }
                placeholder="4999"
                className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy">
                Initial Stock Inventory *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stockQuantity: e.target.value }))
                }
                placeholder="25"
                className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy">
                Product Description *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="High quality specifications, dimensions, materials, and highlights..."
                className="mt-1 block w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
              />
            </div>
          </div>

          {/* Multiple Image URLs (Up to 5) */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-navy">
                Product Image URLs ({formData.images.length}/5)
              </label>
              {formData.images.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="text-xs font-bold text-royal-blue hover:underline"
                >
                  + Add Another Image URL
                </button>
              )}
            </div>

            <div className="space-y-2 mt-2">
              {formData.images.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                    placeholder={`https://example.com/product-image-${idx + 1}.jpg`}
                    className="flex-1 px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono"
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted hover:text-navy"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {loading
                ? 'Saving...'
                : isEdit
                ? 'Update Product'
                : 'Publish Product for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductsListView;
