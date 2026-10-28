import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Tag,
  Users,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export function AdminLayout({ activeTab, onSelectTab, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & KPIs', icon: LayoutDashboard },
    { id: 'orders', label: 'Order Fulfillment', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory & SKUs', icon: Boxes },
    { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-navy text-white border-r border-navy/80 shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Nexora Admin"
            className="w-9 h-9 object-contain drop-shadow"
          />
          <div>
            <h1 className="font-extrabold text-sm tracking-tight leading-none text-white">
              NEXORA ADMIN
            </h1>
            <span className="text-[10px] text-teal tracking-wider uppercase font-semibold">
              Merchant Console
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-royal-blue text-white shadow'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Storefront shortcut & Admin badge */}
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

          <div className="p-3 bg-white/5 rounded-xl flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-full bg-teal text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="overflow-hidden">
              <span className="block font-semibold text-white truncate">Administrator</span>
              <span className="block text-[10px] text-gray-400">admin@nexoracommerce.com</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-border h-16 flex items-center justify-between px-4 sm:px-8">
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
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-emerald-700 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              API v1 Production Ready
            </span>
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
                    <img src="/logo.png" alt="Nexora Admin" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-sm">Nexora Admin</span>
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
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                          activeTab === item.id ? 'bg-royal-blue text-white' : 'text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
