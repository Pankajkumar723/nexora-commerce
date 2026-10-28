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
  ShoppingBag,
  Trash2
} from 'lucide-react';
import { formatPrice } from '../lib/formatters';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

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

  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_saved_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
      fullName: user?.name || 'Customer',
      name: user?.name || 'Customer',
      street: newStreet,
      city: newCity,
      state: newState || '',
      postalCode: newPostalCode,
      phone: newPhone || '',
      addressType: 'Home',
      isDefault: addresses.length === 0,
    };

    const next = [newAddr, ...addresses].slice(0, 2);
    setAddresses(next);
    try {
      localStorage.setItem('nexora_saved_addresses', JSON.stringify(next));
    } catch (err) {
      console.warn(err);
    }
    setShowAddAddress(false);
    setNewStreet('');
    setNewCity('');
    setNewPostalCode('');
    setNewPhone('');
  };

  const handleDeleteAddress = (idToDelete) => {
    const next = addresses.filter((a) => a.id !== idToDelete);
    setAddresses(next);
    try {
      localStorage.setItem('nexora_saved_addresses', JSON.stringify(next));
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-background py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Profile Card */}
        <Card className="rounded-3xl border-border bg-card shadow-sm mb-8 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <Avatar className="w-20 h-20 shadow-lg text-2xl font-bold bg-primary text-primary-foreground">
              <AvatarFallback className="bg-gradient-to-tr from-navy to-royal-blue text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-bold text-foreground">{user?.name || 'Customer Account'}</h1>
                <Badge variant="teal" className="text-xs font-semibold">
                  {user?.role || 'CUSTOMER'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-4 h-4" />
                {user?.email || 'customer@nexora.com'}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Member since October 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('products')}
              className="gap-1.5 font-semibold"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onLogout}
              className="gap-1.5 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </Card>

        {/* Tab Controls */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg text-xs font-semibold">
              Profile Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg text-xs font-semibold gap-1.5">
              <span>My Orders</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {orders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="rounded-lg text-xs font-semibold gap-1.5">
              <span>Shipping Addresses</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {addresses.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-3xl border-border bg-card p-6">
                <CardTitle className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-royal-blue" />
                  Personal Details
                </CardTitle>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Full Name</span>
                    <span className="font-semibold text-foreground">{user?.name || 'Aryan Sharma'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Email Address</span>
                    <span className="font-semibold text-foreground">{user?.email || 'customer@nexora.com'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Account Type</span>
                    <span className="font-semibold text-foreground capitalize">{user?.role?.toLowerCase() || 'Customer'}</span>
                  </div>
                </div>
              </Card>

              <Card className="rounded-3xl border-border bg-card p-6">
                <CardTitle className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-royal-blue" />
                  Default Address
                </CardTitle>
                {addresses[0] ? (
                  <div className="text-sm space-y-1 text-foreground/80">
                    <p className="font-semibold text-foreground">{addresses[0].name}</p>
                    <p>{addresses[0].street}</p>
                    <p>{addresses[0].city}, {addresses[0].state} - {addresses[0].postalCode}</p>
                    <p className="text-xs text-muted-foreground pt-2 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {addresses[0].phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No default shipping address set yet.</p>
                )}
              </Card>

              <Card className="rounded-3xl border-border bg-card p-6">
                <CardTitle className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal" />
                  Account Security
                </CardTitle>
                <p className="text-xs text-muted-foreground mb-4">
                  Your session is secured using Better Auth token validation and encrypted session storage.
                </p>
                <Badge variant="teal" className="gap-1.5 py-1 px-3 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Identity Verified
                </Badge>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: ORDERS */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="rounded-3xl border-border bg-card shadow-sm hover:border-royal-blue/30 transition p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-foreground">{order.orderNumber}</span>
                      <Badge
                        variant={order.status === 'DELIVERED' ? 'teal' : 'default'}
                        className="text-[10px] font-bold"
                      >
                        {order.status}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>

                    <div className="mt-3 space-y-1">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm font-medium text-foreground">
                          {item.name} <span className="text-xs text-muted-foreground">({item.variant})</span> x {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="text-left md:text-right flex md:flex-col justify-between items-center md:items-end w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-border">
                    <div>
                      <span className="text-xs text-muted-foreground block">Order Total</span>
                      <span className="text-lg font-bold text-royal-blue">
                        {formatPrice(order.total || order.pricing?.total || 0)}
                      </span>
                    </div>
                    <span className="text-xs text-teal font-medium flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                      {order.paymentMethod === 'cod' ? 'Cash On Delivery' : 'Razorpay Verified'}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: ADDRESSES */}
          <TabsContent value="addresses">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-foreground">Saved Delivery Addresses</h2>
                <Button
                  variant="navy"
                  size="sm"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                >
                  {showAddAddress ? 'Cancel' : '+ Add New Address'}
                </Button>
              </div>

              {showAddAddress && (
                <Card className="rounded-3xl border-royal-blue/30 bg-card shadow-sm p-6 space-y-4">
                  <CardTitle className="text-sm font-bold">Add Shipping Address</CardTitle>
                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="new-street">Street Address</Label>
                        <Input
                          id="new-street"
                          type="text"
                          required
                          value={newStreet}
                          onChange={(e) => setNewStreet(e.target.value)}
                          placeholder="Flat 101, Prestige Towers, Outer Ring Rd"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="new-city">City</Label>
                        <Input
                          id="new-city"
                          type="text"
                          required
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          placeholder="Bengaluru"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="new-postalCode">Postal Code (PIN)</Label>
                        <Input
                          id="new-postalCode"
                          type="text"
                          required
                          value={newPostalCode}
                          onChange={(e) => setNewPostalCode(e.target.value)}
                          placeholder="560103"
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="navy" size="sm">
                      Save Address
                    </Button>
                  </form>
                </Card>
              )}

              {addresses.length === 0 ? (
                <Card className="rounded-3xl border-border bg-card p-8 text-center">
                  <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <h4 className="text-sm font-bold text-foreground">No Saved Addresses</h4>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">You can save up to 2 delivery addresses for fast 1-click checkout.</p>
                  <Button
                    variant="navy"
                    size="sm"
                    onClick={() => setShowAddAddress(true)}
                  >
                    + Add Address
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <Card
                      key={addr.id}
                      className="rounded-3xl border-border bg-card p-5 relative flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="font-bold text-[10px]">
                          {addr.addressType || 'Home'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{addr.fullName || addr.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{addr.street}</p>
                        <p className="text-xs text-muted-foreground">{addr.city}{addr.state ? `, ${addr.state}` : ''} - {addr.postalCode}</p>
                        <p className="text-xs text-muted-foreground mt-2">Phone: {addr.phone}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
