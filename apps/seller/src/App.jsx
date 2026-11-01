import React, { useState, useEffect } from 'react';
import { SellerLayout } from './components/layout/SellerLayout';
import { ApprovalBanner } from './components/layout/ApprovalBanner';
import { SellerLoginView } from './features/auth/SellerLoginView';
import { SellerRegisterView } from './features/auth/SellerRegisterView';
import { SellerApplicationView } from './features/auth/SellerApplicationView';
import { SellerDashboardView } from './features/dashboard/SellerDashboardView';
import { ProductsListView } from './features/products/ProductsListView';
import { SellerOrdersView } from './features/orders/SellerOrdersView';
import { EarningsView } from './features/earnings/EarningsView';
import { SellerAnalyticsView } from './features/analytics/SellerAnalyticsView';
import { NotificationsView } from './features/notifications/NotificationsView';
import { SellerSettingsView } from './features/settings/SellerSettingsView';
import {
  getSellerToken,
  getSellerUser,
  clearSellerAuth,
  sellerRequest,
} from './lib/apiClient';

export function App() {
  const [token, setToken] = useState(getSellerToken());
  const [user, setUser] = useState(getSellerUser());
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register' | 'apply'
  const [sellerProfile, setSellerProfile] = useState(null);
  const [sellerStatus, setSellerStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const checkStatusAndProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const statusRes = await sellerRequest('/sellers/status');
      if (statusRes?.data?.hasProfile) {
        setSellerStatus(statusRes.data.status);
        setRejectionReason(statusRes.data.rejectionReason);

        // Fetch full profile
        const profRes = await sellerRequest('/sellers/profile');
        setSellerProfile(profRes.data);

        // Safely fetch notifications for profile
        try {
          const notifRes = await sellerRequest('/seller/notifications?limit=1');
          setUnreadCount(notifRes?.data?.unreadCount || 0);
        } catch (notifErr) {
          console.warn('Notification fetch error ignored:', notifErr);
        }
      } else {
        // User is authenticated but hasn't submitted KYC application
        setAuthScreen('apply');
      }
    } catch (err) {
      console.warn('Failed to fetch status:', err);
      // If token expired or unauthorized, clear
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatusAndProfile();
  }, [token]);

  const handleLoginSuccess = (authData) => {
    setToken(authData.session.token);
    setUser(authData.user);
  };

  const handleRegisterSuccess = (authData) => {
    setToken(authData.session.token);
    setUser(authData.user);
    setAuthScreen('apply');
  };

  const handleApplicationSubmitted = (profile) => {
    setSellerProfile(profile);
    setSellerStatus('PENDING');
    setAuthScreen('login'); // Reset auth screen
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    clearSellerAuth();
    setToken(null);
    setUser(null);
    setSellerProfile(null);
    setSellerStatus(null);
    setAuthScreen('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-royal-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-navy">
            Connecting to Nexora Merchant Portal...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated Flow
  if (!token) {
    if (authScreen === 'register') {
      return (
        <SellerRegisterView
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateLogin={() => setAuthScreen('login')}
        />
      );
    }
    return (
      <SellerLoginView
        onLoginSuccess={handleLoginSuccess}
        onNavigateRegister={() => setAuthScreen('register')}
      />
    );
  }

  // Authenticated but needs KYC application
  if (authScreen === 'apply' && !sellerProfile) {
    return (
      <SellerApplicationView
        onApplicationSubmitted={handleApplicationSubmitted}
      />
    );
  }

  // Main Seller Dashboard Portal
  return (
    <SellerLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      sellerProfile={sellerProfile}
      sellerStatus={sellerStatus}
      unreadNotificationsCount={unreadCount}
      onLogout={handleLogout}
    >
      {/* Pending, Rejected or Suspended Warning Banner */}
      <ApprovalBanner
        status={sellerStatus}
        rejectionReason={rejectionReason}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {activeTab === 'dashboard' && (
        <SellerDashboardView onNavigateTab={setActiveTab} />
      )}

      {activeTab === 'products' && (
        <ProductsListView sellerStatus={sellerStatus} sellerProfile={sellerProfile} />
      )}

      {activeTab === 'orders' && (
        <SellerOrdersView />
      )}

      {activeTab === 'earnings' && (
        <EarningsView sellerProfile={sellerProfile} />
      )}

      {activeTab === 'analytics' && (
        <SellerAnalyticsView />
      )}

      {activeTab === 'notifications' && (
        <NotificationsView
          onNotificationUpdated={(count) => setUnreadCount(count)}
        />
      )}

      {activeTab === 'settings' && (
        <SellerSettingsView
          sellerProfile={sellerProfile}
          onProfileUpdated={(updated) => setSellerProfile(updated)}
        />
      )}
    </SellerLayout>
  );
}

export default App;
