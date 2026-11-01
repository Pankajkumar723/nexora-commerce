import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  BarChart3,
  Bell,
  Settings,
  Store,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Clock,
  AlertCircle,
} from 'lucide-react';

export function SellerLayout({
  activeTab,
  onSelectTab,
  sellerProfile,
  sellerStatus,
  unreadNotificationsCount = 0,
  onLogout,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & KPIs', icon: LayoutDashboard },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
    { id: 'earnings', label: 'Earnings & Payouts', icon: Wallet },
    { id: 'analytics', label: 'Sales Analytics', icon: BarChart3 },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-navy text-white border-r border-navy/80 shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <picture>
            <source
              type="image/webp"
              srcSet="/logo-40x40.webp 1x, /logo-80x80.webp 2x"
            />
            <img
              src="/logo-40x40.png"
              alt="Nexora Commerce"
              width={36}
              height={36}
              className="w-9 h-9 object-contain drop-shadow"
            />
          </picture>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight leading-none text-white">
              NEXORA SELLER
            </h1>
            <span className="text-[10px] text-teal tracking-wider uppercase font-semibold">
              Merchant Portal
            </span>
          </div>
        </div>

        {/* Store Profile Card */}
        {sellerProfile && (
          <div className="p-4 mx-4 my-3 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-royal-blue/30 text-teal flex items-center justify-center font-bold text-xs">
                {sellerProfile.storeName ? sellerProfile.storeName.charAt(0) : 'S'}
              </div>
              <div className="overflow-hidden">
                <span className="block font-bold text-xs text-white truncate">
                  {sellerProfile.storeName || 'My Store'}
                </span>
                <span className="block text-[10px] text-gray-400 truncate">
                  /{sellerProfile.storeSlug || 'vendor'}
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-gray-400">Status:</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  sellerStatus === 'APPROVED'
                    ? 'text-teal'
                    : sellerStatus === 'PENDING'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {sellerStatus === 'APPROVED' && <ShieldCheck className="w-3 h-3" />}
                {sellerStatus === 'PENDING' && <Clock className="w-3 h-3" />}
                {sellerStatus || 'PENDING'}
              </span>
            </div>
          </div>
        )}

        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-royal-blue text-white shadow'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-teal text-navy font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* External links & Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-white/10 transition"
          >
            <span>Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-teal" />
          </a>

          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-white/10 transition"
          >
            <span>Admin Console</span>
            <ExternalLink className="w-3.5 h-3.5 text-royal-blue" />
          </a>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 transition mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-border h-16 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-muted hover:text-navy rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-navy capitalize">
              {navItems.find((n) => n.id === activeTab)?.label || 'Console'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick status pill */}
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                sellerStatus === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : sellerStatus === 'PENDING'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  sellerStatus === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              {sellerStatus === 'APPROVED'
                ? 'Merchant Verified'
                : `Account ${sellerStatus || 'Pending'}`}
            </span>

            {/* Notification button */}
            <button
              onClick={() => onSelectTab('notifications')}
              className="relative p-2 text-muted hover:text-navy rounded-xl hover:bg-canvas transition"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal animate-ping" />
              )}
            </button>
          </div>
        </header>

        {/* View Surface */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-64 bg-navy text-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/logo-40x40.webp"
                      alt="Nexora Seller"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-bold text-sm">Nexora Seller</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X className="w-5 h-5 text-gray-300" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                          activeTab === item.id ? 'bg-royal-blue text-white' : 'text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-teal text-navy font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerLayout;
