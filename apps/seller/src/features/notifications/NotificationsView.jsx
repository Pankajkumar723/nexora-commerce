import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  CheckCheck,
  Clock,
  AlertTriangle,
  Package,
  ShoppingBag,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import { sellerRequest } from '../../lib/apiClient';

export function NotificationsView({ onNotificationUpdated }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await sellerRequest('/seller/notifications?limit=50');
      setNotifications(res?.data?.items || []);
      setUnreadCount(res?.data?.unreadCount || 0);
      if (onNotificationUpdated) {
        onNotificationUpdated(res?.data?.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await sellerRequest(`/seller/notifications/${id}/read`, {
        method: 'PATCH',
      });
      fetchNotifications();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await sellerRequest('/seller/notifications/read-all', {
        method: 'POST',
      });
      fetchNotifications();
    } catch (err) {
      console.warn(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ORDER':
        return <ShoppingBag className="w-4 h-4 text-royal-blue" />;
      case 'APPROVAL':
        return <CheckCircle2 className="w-4 h-4 text-teal" />;
      case 'PAYOUT':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'PRODUCT':
        return <Package className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-navy">Notifications & Alerts</h1>
          <p className="text-xs text-muted mt-1">
            Real-time updates regarding customer orders, payout disbursements, and platform approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-border hover:bg-canvas text-navy rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <CheckCheck className="w-4 h-4 text-teal" />
              <span>Mark All as Read</span>
            </button>
          )}

          <button
            onClick={fetchNotifications}
            className="p-2 text-muted hover:text-navy rounded-xl hover:bg-canvas transition border border-border bg-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-border shadow-xs divide-y divide-border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted text-xs">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-muted text-xs">
            <Bell className="w-8 h-8 text-muted/50 mx-auto mb-2" />
            <span>No notifications yet. Activity will appear here.</span>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkAsRead(n.id)}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition cursor-pointer ${
                n.read ? 'hover:bg-canvas/50' : 'bg-royal-blue/5 hover:bg-royal-blue/10'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white border border-border shrink-0 shadow-xs">
                  {getTypeIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-navy text-xs sm:text-sm">
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-muted block mt-2">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(n.id);
                  }}
                  className="text-xs text-royal-blue hover:underline font-semibold shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsView;
