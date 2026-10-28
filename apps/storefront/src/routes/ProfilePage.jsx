import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Package, 
  LogOut, 
  ShieldCheck, 
  Calendar, 
  Phone,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { formatPrice } from '../lib/formatters';

export function ProfilePage({ user, onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'addresses'

  // User orders loaded from localStorage + demo fallback
  const [orders] = useState(() => {
    try {
      const stored = localStorage.getItem('nexora_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse nexora_orders:', e);
    }
    return [
      {
        id: 'ord-1092',
        orderNumber: 'NEX-2026-1092',
        createdAt: '2026-10-24T14:32:00.000Z',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        total: 18999,
        itemCount: 1,
        items: [
          {
            name: 'Nexora Studio Pro Wireless ANC Headphones',
            variant: 'Matte Obsidian',
            quantity: 1,
            price: 18999,
          },
        ],
      },
      {
        id: 'ord-1085',
        orderNumber: 'NEX-2026-1085',
        createdAt: '2026-10-18T10:15:00.000Z',
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        total: 8499,
        itemCount: 1,
        items: [
          {
            name: 'Nexora Horizon Spatial True Wireless Earbuds',
            variant: 'Glacier White',
            quantity: 1,
            price: 8499,
          },
        ],
      },
    ];
  });

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      name: user?.name || 'Aryan Sharma',
      street: '42 Cyber City, Phase 2, DLF Tech Park',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002',
      phone: '+91 98765 43210',
      isDefault: true,
    },
  ]);

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newPostalCode) return;

    const newAddr = {
      id: `addr-${Date.now()}`,
      name: user?.name || 'Aryan Sharma',
      street: newStreet,
      city: newCity,
      state: newState || 'Karnataka',
      postalCode: newPostalCode,
      phone: newPhone || '+91 98765 43210',
      isDefault: false,
    };

    setAddresses((prev) => [...prev, newAddr]);
    setShowAddAddress(false);
    setNewStreet('');
    setNewCity('');
    setNewPostalCode('');
  };

  return (
    <div className="min-h-screen bg-canvas py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border shadow-sm mb-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-navy to-royal-blue text-white font-bold text-3xl flex items-center justify-center shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-bold text-navy">{user?.name || 'Customer Account'}</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">
                  {user?.role || 'CUSTOMER'}
                </span>
              </div>
              <p className="text-sm text-muted mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-4 h-4" />
                {user?.email || 'customer@nexora.com'}
              </p>
              <p className="text-xs text-muted mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Member since October 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold bg-royal-blue/10 hover:bg-royal-blue/20 text-royal-blue px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Catalog</span>
            </button>
            <button
              onClick={onLogout}
              className="text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border mb-8 gap-4 sm:gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-semibold transition border-b-2 ${
              activeTab === 'overview'
                ? 'border-royal-blue text-royal-blue'
                : 'border-transparent text-muted hover:text-navy'
            }`}
          >
            Profile Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-royal-blue text-royal-blue'
                : 'border-transparent text-muted hover:text-navy'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'addresses'
                ? 'border-royal-blue text-royal-blue'
                : 'border-transparent text-muted hover:text-navy'
            }`}
          >
            Shipping Addresses ({addresses.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-border">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-royal-blue" />
                Personal Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-muted block">Full Name</span>
                  <span className="font-semibold text-gray-900">{user?.name || 'Aryan Sharma'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted block">Email Address</span>
                  <span className="font-semibold text-gray-900">{user?.email || 'customer@nexora.com'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted block">Account Type</span>
                  <span className="font-semibold text-gray-900 capitalize">{user?.role?.toLowerCase() || 'Customer'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-border">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-royal-blue" />
                Default Address
              </h3>
              {addresses[0] ? (
                <div className="text-sm space-y-1 text-gray-700">
                  <p className="font-semibold text-gray-900">{addresses[0].name}</p>
                  <p>{addresses[0].street}</p>
                  <p>{addresses[0].city}, {addresses[0].state} - {addresses[0].postalCode}</p>
                  <p className="text-xs text-muted pt-2 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {addresses[0].phone}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted">No default shipping address set yet.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-border">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal" />
                Account Security
              </h3>
              <p className="text-xs text-muted mb-4">
                Your session is secured using Better Auth token validation and encrypted session storage.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal bg-teal/10 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                Identity Verified
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:border-royal-blue/30 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-navy">{order.orderNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </p>

                  <div className="mt-3 space-y-1">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm font-medium text-gray-900">
                        {item.name} <span className="text-xs text-muted">({item.variant})</span> x {item.quantity}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="text-left md:text-right flex md:flex-col justify-between items-center md:items-end w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div>
                    <span className="text-xs text-muted block">Order Total</span>
                    <span className="text-lg font-bold text-navy">
                      {formatPrice(order.total || order.pricing?.total || 0)}
                    </span>
                  </div>
                  <span className="text-xs text-teal font-medium flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                    {order.paymentMethod === 'cod' ? 'Cash On Delivery' : 'Razorpay Verified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-navy">Saved Delivery Addresses</h2>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="text-xs font-semibold bg-navy hover:bg-royal-blue text-white px-3.5 py-2 rounded-xl transition"
              >
                {showAddAddress ? 'Cancel' : '+ Add New Address'}
              </button>
            </div>

            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-3xl border border-royal-blue/30 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-navy">Add Shipping Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="Flat 101, Prestige Towers, Outer Ring Rd"
                      className="w-full text-sm p-2.5 bg-canvas border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Bengaluru"
                      className="w-full text-sm p-2.5 bg-canvas border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Postal Code (PIN)</label>
                    <input
                      type="text"
                      required
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      placeholder="560103"
                      className="w-full text-sm p-2.5 bg-canvas border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-xl hover:bg-royal-blue transition"
                >
                  Save Address
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white p-5 rounded-3xl border border-border relative flex flex-col justify-between"
                >
                  {addr.isDefault && (
                    <span className="absolute top-4 right-4 text-[10px] bg-teal/10 text-teal font-bold px-2 py-0.5 rounded-full border border-teal/20">
                      Default Address
                    </span>
                  )}
                  <div>
                    <h4 className="font-semibold text-navy text-sm">{addr.name}</h4>
                    <p className="text-xs text-gray-700 mt-1">{addr.street}</p>
                    <p className="text-xs text-gray-700">{addr.city}, {addr.state} - {addr.postalCode}</p>
                    <p className="text-xs text-muted mt-2">Phone: {addr.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
