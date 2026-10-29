import React, { useState, useEffect } from 'react';
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
  Trash2,
  Heart,
  Edit3,
  Save,
  Printer,
  Coins,
  Award,
  Truck,
  RotateCcw,
  Check,
  Zap,
  Copy,
  FileText,
  X,
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
import { Checkbox } from '../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';

export function ProfilePage({ user, onLogout, onNavigate, onAddToCart }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'addresses' | 'rewards'

  // Editable Profile Info (stored in localStorage)
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return {
      name: user?.name || 'Aryan Sharma',
      email: user?.email || 'customer@nexora.com',
      phone: '+91 98765 43210',
      city: 'Bengaluru, India',
      bio: 'Audiophile & tech hardware enthusiast',
    };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profileData.name);
  const [editPhone, setEditPhone] = useState(profileData.phone);
  const [editCity, setEditCity] = useState(profileData.city);
  const [editBio, setEditBio] = useState(profileData.bio);
  const [profileSavedFeedback, setProfileSavedFeedback] = useState(false);

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
        createdAt: '2026-10-28T14:32:00.000Z',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: 'razorpay',
        total: 18999,
        itemCount: 1,
        items: [
          {
            id: 'prod-fallback-1',
            slug: 'nexora-studio-pro-wireless-anc-headphones',
            name: 'Nexora Studio Pro Wireless ANC Headphones',
            variant: 'Matte Obsidian',
            quantity: 1,
            price: 18999,
          },
        ],
        shippingAddress: {
          fullName: 'Aryan Sharma',
          street: 'Flat 402, Prestige Palms, Outer Ring Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560103',
          phone: '+91 98765 43210',
        },
      },
      {
        id: 'ord-1085',
        orderNumber: 'NEX-2026-1085',
        createdAt: '2026-10-18T10:15:00.000Z',
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentMethod: 'razorpay',
        total: 8499,
        itemCount: 1,
        items: [
          {
            id: 'prod-fallback-2',
            slug: 'nexora-horizon-spatial-tw-earbuds',
            name: 'Nexora Horizon Spatial True Wireless Earbuds',
            variant: 'Glacier White',
            quantity: 1,
            price: 8499,
          },
        ],
        shippingAddress: {
          fullName: 'Aryan Sharma',
          street: 'Flat 402, Prestige Palms, Outer Ring Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560103',
          phone: '+91 98765 43210',
        },
      },
    ];
  });

  // Saved addresses
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('nexora_saved_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'addr-default-1',
        fullName: user?.name || 'Aryan Sharma',
        name: user?.name || 'Aryan Sharma',
        street: 'Flat 402, Prestige Palms, Outer Ring Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560103',
        phone: '+91 98765 43210',
        addressType: 'Home',
        isDefault: true,
      },
      {
        id: 'addr-work-2',
        fullName: user?.name || 'Aryan Sharma',
        name: user?.name || 'Aryan Sharma',
        street: 'WeWork Galaxy, 43 Residency Rd, Shanthala Nagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560025',
        phone: '+91 98765 43210',
        addressType: 'Work',
        isDefault: false,
      },
    ];
  });

  // Saved items count
  const [wishlistCount, setWishlistCount] = useState(0);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexora_wishlist');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) setWishlistCount(list.length);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Form states for addresses
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addrType, setAddrType] = useState('Home');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPostalCode, setAddrPostalCode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Invoice & Reorder states
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [reorderedId, setReorderedId] = useState(null);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Handle saving profile changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...profileData,
      name: editName.trim() || profileData.name,
      phone: editPhone.trim() || profileData.phone,
      city: editCity.trim() || profileData.city,
      bio: editBio.trim() || profileData.bio,
    };
    setProfileData(updated);
    try {
      localStorage.setItem('nexora_user_profile', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
    setIsEditingProfile(false);
    setProfileSavedFeedback(true);
    setTimeout(() => setProfileSavedFeedback(false), 3000);
  };

  // Open address editor
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrType('Home');
    setAddrFullName(profileData.name || '');
    setAddrPhone(profileData.phone || '');
    setAddrStreet('');
    setAddrCity('');
    setAddrState('');
    setAddrPostalCode('');
    setAddrIsDefault(addresses.length === 0);
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddrType(addr.addressType || 'Home');
    setAddrFullName(addr.fullName || addr.name || '');
    setAddrPhone(addr.phone || '');
    setAddrStreet(addr.street || '');
    setAddrCity(addr.city || '');
    setAddrState(addr.state || '');
    setAddrPostalCode(addr.postalCode || '');
    setAddrIsDefault(Boolean(addr.isDefault));
    setShowAddressModal(true);
  };

  // Save address (Create or Edit)
  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addrStreet || !addrCity || !addrPostalCode) return;

    if (editingAddressId) {
      // Edit existing
      const updated = addresses.map((a) => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            fullName: addrFullName,
            name: addrFullName,
            phone: addrPhone,
            street: addrStreet,
            city: addrCity,
            state: addrState,
            postalCode: addrPostalCode,
            addressType: addrType,
            isDefault: addrIsDefault ? true : a.isDefault,
          };
        }
        return addrIsDefault ? { ...a, isDefault: false } : a;
      });
      setAddresses(updated);
      localStorage.setItem('nexora_saved_addresses', JSON.stringify(updated));
    } else {
      // Add new
      const newAddress = {
        id: `addr-${Date.now()}`,
        fullName: addrFullName,
        name: addrFullName,
        phone: addrPhone,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        postalCode: addrPostalCode,
        addressType: addrType,
        isDefault: addrIsDefault || addresses.length === 0,
      };

      let next = addrIsDefault
        ? addresses.map((a) => ({ ...a, isDefault: false }))
        : [...addresses];
      next = [newAddress, ...next];
      setAddresses(next);
      localStorage.setItem('nexora_saved_addresses', JSON.stringify(next));
    }

    setShowAddressModal(false);
  };

  // Set default address
  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem('nexora_saved_addresses', JSON.stringify(updated));
  };

  // Delete address
  const handleDeleteAddress = (idToDelete) => {
    const updated = addresses.filter((a) => a.id !== idToDelete);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    localStorage.setItem('nexora_saved_addresses', JSON.stringify(updated));
  };

  // Handle reorder
  const handleReorder = (order) => {
    if (onAddToCart && order.items) {
      order.items.forEach((item) => {
        onAddToCart(
          {
            id: item.id || 'prod-reorder',
            name: item.name,
            price: item.price,
            slug: item.slug || 'nexora-studio-pro-wireless-anc-headphones',
          },
          { id: 'v-reorder', attributes: { color: item.variant } },
        );
      });
      setReorderedId(order.id);
      setTimeout(() => setReorderedId(null), 3000);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'delivered') return o.status === 'DELIVERED';
    if (orderStatusFilter === 'in_progress') return o.status !== 'DELIVERED';
    return true;
  });

  // Copy referral code
  const handleCopyReferral = () => {
    navigator.clipboard?.writeText('NEXORA-VIP-2026');
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Profile Saved Alert */}
        {profileSavedFeedback && (
          <div className="p-3.5 rounded-xl bg-teal/10 border border-teal/20 text-teal text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {/* 1. HERO HEADER PROFILE CARD */}
        <Card className="rounded-3xl border-border bg-card shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-80 h-40 bg-royal-blue/5 rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10">
            <div className="relative">
              <Avatar className="w-20 h-20 shadow-md ring-4 ring-primary/10 text-2xl font-bold bg-primary text-primary-foreground">
                <AvatarFallback className="bg-gradient-to-tr from-navy to-royal-blue text-white">
                  {profileData.name?.charAt(0)?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute -bottom-1 -right-1 bg-teal text-white p-1 rounded-full shadow"
                title="Verified Better Auth Profile"
              >
                <Check className="w-3 h-3" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {profileData.name}
                </h1>
                <Badge variant="teal" className="text-[11px] font-bold uppercase tracking-wider">
                  Nexora Black VIP
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {profileData.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {profileData.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profileData.city}
                </span>
              </div>

              <p className="text-xs text-muted-foreground italic pt-0.5">"{profileData.bio}"</p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 z-10 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
              className="h-9 text-xs font-semibold rounded-xl gap-1.5 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-royal-blue" />
              <span>Edit Profile</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('wishlist')}
              className="h-9 text-xs font-semibold rounded-xl gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-2xs"
            >
              <Heart className="w-3.5 h-3.5 fill-red-500" />
              <span>Wishlist ({wishlistCount})</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onLogout}
              className="h-9 text-xs font-semibold rounded-xl gap-1.5 shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </Card>

        {/* 2. STATS & REWARDS METRICS BAR (Flipkart SuperCoins / Prime Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            onClick={() => setActiveTab('orders')}
            className="p-4 rounded-2xl border-border bg-card shadow-2xs hover:shadow-xs hover:border-primary/40 transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Total Orders</span>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-foreground">{orders.length}</div>
            <span className="text-[11px] text-teal font-semibold flex items-center gap-1 mt-0.5">
              <Check className="w-3 h-3" /> 100% Fulfilled
            </span>
          </Card>

          <Card
            onClick={() => onNavigate('wishlist')}
            className="p-4 rounded-2xl border-border bg-card shadow-2xs hover:shadow-xs hover:border-red-400/40 transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Saved Items</span>
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-foreground">{wishlistCount}</div>
            <span className="text-[11px] text-muted-foreground font-medium mt-0.5 block">
              In your favorites list
            </span>
          </Card>

          <Card
            onClick={() => setActiveTab('rewards')}
            className="p-4 rounded-2xl border-border bg-card shadow-2xs hover:shadow-xs hover:border-amber-400/40 transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Nexora Coins</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-foreground">₹450</div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5 block">
              Usable on next order
            </span>
          </Card>

          <Card className="p-4 rounded-2xl border-border bg-card shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Security</span>
              <div className="p-2 rounded-xl bg-teal/10 text-teal">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-foreground">Verified</div>
            <span className="text-[11px] text-teal font-semibold mt-0.5 block">
              Better Auth 256-bit SSL
            </span>
          </Card>
        </div>

        {/* 3. ACTIVE ORDER REAL-TIME TRACKING BANNER (If recent confirmed order exists) */}
        {orders.length > 0 && orders[0].status === 'CONFIRMED' && (
          <Card className="rounded-2xl border-royal-blue/30 bg-gradient-to-r from-card via-card to-royal-blue/5 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-royal-blue/10 text-royal-blue flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Active Order #{orders[0].orderNumber} in Transit
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Expected delivery by{' '}
                    <span className="font-semibold text-foreground">Monday, Nov 2</span> via Express Air
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('orders')}
                className="h-8 text-xs font-semibold gap-1"
              >
                <span>Track Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="relative pt-2">
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-royal-blue w-2/5 rounded-full" />
              </div>
              <div className="flex justify-between items-center text-[11px] pt-2 text-muted-foreground font-medium">
                <span className="font-bold text-teal flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-teal" /> Order Placed
                </span>
                <span className="font-bold text-royal-blue animate-pulse">
                  Packed & Verified
                </span>
                <span>In Transit</span>
                <span>Out for Delivery</span>
                <span>Delivered</span>
              </div>
            </div>
          </Card>
        )}

        {/* 4. TABS NAVIGATION */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border p-1 rounded-xl shadow-2xs">
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
              <span>Saved Addresses</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                {addresses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="rounded-lg text-xs font-semibold gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Coins & VIP Club</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Details Card */}
              <Card className="rounded-2xl border-border bg-card p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
                    <User className="w-4 h-4 text-royal-blue" />
                    Personal Details
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="text-xs font-semibold text-royal-blue hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Full Name</span>
                    <span className="font-semibold text-foreground text-sm">{profileData.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Email Address</span>
                    <span className="font-semibold text-foreground">{profileData.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mobile Number</span>
                    <span className="font-semibold text-foreground">{profileData.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Primary Location</span>
                    <span className="font-semibold text-foreground">{profileData.city}</span>
                  </div>
                </div>
              </Card>

              {/* Default Address Card */}
              <Card className="rounded-2xl border-border bg-card p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
                    <MapPin className="w-4 h-4 text-royal-blue" />
                    Default Shipping Address
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => setActiveTab('addresses')}
                    className="text-xs font-semibold text-royal-blue hover:underline"
                  >
                    Manage
                  </button>
                </div>

                {addresses[0] ? (
                  <div className="space-y-2 text-xs text-foreground/80">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        {addresses[0].addressType || 'Home'}
                      </Badge>
                      <span className="font-semibold text-foreground">{addresses[0].fullName || addresses[0].name}</span>
                    </div>
                    <p className="leading-relaxed">{addresses[0].street}</p>
                    <p>
                      {addresses[0].city}, {addresses[0].state} - {addresses[0].postalCode}
                    </p>
                    <p className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {addresses[0].phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No address added yet.</p>
                )}
              </Card>

              {/* Preferences & Security Card */}
              <Card className="rounded-2xl border-border bg-card p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
                    <ShieldCheck className="w-4 h-4 text-teal" />
                    Security & Session
                  </CardTitle>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                    <span className="font-semibold text-foreground block">Session Security</span>
                    <p className="text-[11px] text-muted-foreground">
                      Secured by Better Auth token-based encryption with HTTP-only cookies.
                    </p>
                  </div>

                  <div className="p-3 bg-teal/5 border border-teal/20 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-teal text-xs block">Two-Factor Shield</span>
                      <span className="text-[10px] text-muted-foreground">HMAC Protected</span>
                    </div>
                    <Badge variant="teal" className="text-[10px]">
                      Active
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Orders Snippet */}
            <Card className="rounded-2xl border-border bg-card p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-sm font-bold text-foreground">Recent Order History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-royal-blue gap-1"
                >
                  <span>View All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="divide-y divide-border/60">
                {orders.slice(0, 2).map((order) => (
                  <div
                    key={order.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {order.orderNumber}
                        </span>
                        <Badge
                          variant={order.status === 'DELIVERED' ? 'teal' : 'default'}
                          className="text-[10px] font-bold"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-sm text-foreground">
                        {formatPrice(order.total || 0)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="h-8 text-xs font-semibold gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Invoice</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: MY ORDERS */}
          <TabsContent value="orders" className="space-y-4">
            {/* Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={orderStatusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrderStatusFilter('all')}
                  className="rounded-full text-xs h-8 px-3"
                >
                  All Orders ({orders.length})
                </Button>
                <Button
                  variant={orderStatusFilter === 'in_progress' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrderStatusFilter('in_progress')}
                  className="rounded-full text-xs h-8 px-3"
                >
                  In Progress
                </Button>
                <Button
                  variant={orderStatusFilter === 'delivered' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrderStatusFilter('delivered')}
                  className="rounded-full text-xs h-8 px-3"
                >
                  Delivered
                </Button>
              </div>

              <span className="text-xs text-muted-foreground font-medium">
                Showing {filteredOrders.length} orders
              </span>
            </div>

            {filteredOrders.length === 0 ? (
              <Card className="rounded-2xl border-border bg-card p-10 text-center space-y-3">
                <Package className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
                <h4 className="text-sm font-bold text-foreground">No orders in this category</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Browse our high-performance hardware catalog and place your first order today.
                </p>
                <Button
                  onClick={() => onNavigate('products')}
                  className="text-xs font-bold h-9 mt-2"
                >
                  Explore Catalog
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isDelivered = order.status === 'DELIVERED';
                  const isReordered = reorderedId === order.id;

                  return (
                    <Card
                      key={order.id}
                      className="rounded-2xl border-border bg-card shadow-2xs hover:shadow-xs transition p-6 space-y-5"
                    >
                      {/* Top Order Metadata */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-sm font-bold text-foreground">
                            {order.orderNumber}
                          </span>
                          <Badge
                            variant={isDelivered ? 'teal' : 'default'}
                            className="text-[10px] font-bold"
                          >
                            {order.status}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] font-medium">
                            {order.paymentStatus}
                          </Badge>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Placed on{' '}
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            dateStyle: 'medium',
                          })}
                        </div>
                      </div>

                      {/* Items Listing */}
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-4 py-1.5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-1">
                                  {item.name}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  Variant: {item.variant} • Qty: {item.quantity}
                                </span>
                              </div>
                            </div>

                            <span className="text-sm font-bold text-foreground shrink-0">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Interactive Tracking Stepper Bar */}
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-royal-blue" />
                            Delivery Status
                          </span>
                          <span className="font-semibold text-teal text-[11px]">
                            {isDelivered
                              ? 'Delivered on Oct 21'
                              : 'Expected Monday, Nov 2 (Express Air)'}
                          </span>
                        </div>

                        <div className="relative pt-1 pb-1">
                          <div className="h-1 bg-border rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-royal-blue rounded-full ${
                                isDelivered ? 'w-full bg-teal' : 'w-2/5'
                              }`}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] pt-1.5 text-muted-foreground">
                            <span className="font-bold text-teal">Ordered</span>
                            <span className={isDelivered ? 'font-bold text-teal' : 'font-bold text-royal-blue'}>
                              Verified
                            </span>
                            <span className={isDelivered ? 'font-bold text-teal' : ''}>Shipped</span>
                            <span className={isDelivered ? 'font-bold text-teal' : ''}>Out for Delivery</span>
                            <span className={isDelivered ? 'font-bold text-teal' : ''}>Delivered</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Order Actions */}
                      <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground">
                          Order Total:{' '}
                          <span className="text-base font-extrabold text-royal-blue">
                            {formatPrice(order.total || 0)}
                          </span>{' '}
                          via {order.paymentMethod === 'cod' ? 'Cash On Delivery' : 'Razorpay Verified'}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="h-9 text-xs font-semibold gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleReorder(order)}
                            className={`h-9 text-xs font-bold gap-1.5 shadow-2xs transition-all ${
                              isReordered ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                            }`}
                          >
                            {isReordered ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added to Cart!</span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Buy Again</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: ADDRESSES */}
          <TabsContent value="addresses" className="space-y-6">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-base font-bold text-foreground">Saved Shipping Addresses</h3>
                <p className="text-xs text-muted-foreground">
                  Manage your home and work addresses for instant 1-click checkout.
                </p>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={handleOpenAddAddress}
                className="h-9 text-xs font-bold gap-1.5 shadow-2xs"
              >
                <span>+ Add New Address</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <Card
                  key={addr.id}
                  className={`rounded-2xl border p-5 relative flex flex-col justify-between transition-all ${
                    addr.isDefault
                      ? 'border-royal-blue/50 bg-card shadow-sm ring-1 ring-royal-blue/20'
                      : 'border-border bg-card shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={addr.addressType === 'Work' ? 'secondary' : 'default'}
                          className="font-bold text-[10px] uppercase"
                        >
                          {addr.addressType || 'Home'}
                        </Badge>
                        {addr.isDefault && (
                          <Badge variant="teal" className="text-[10px] font-bold">
                            Default
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    <h4 className="font-bold text-foreground text-sm">
                      {addr.fullName || addr.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {addr.street}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {addr.city}{addr.state ? `, ${addr.state}` : ''} - {addr.postalCode}
                    </p>
                    <p className="text-xs text-muted-foreground pt-2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {addr.phone}
                    </p>
                  </div>

                  {!addr.isDefault && (
                    <div className="pt-4 mt-3 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-xs font-bold text-royal-blue hover:underline cursor-pointer"
                      >
                        Set as Default Address
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: REWARDS & VIP CLUB (Flipkart SuperCoins Style) */}
          <TabsContent value="rewards" className="space-y-6">
            {/* VIP Club Banner */}
            <Card className="rounded-3xl border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-6 sm:p-8 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-amber-500 text-white font-bold text-xs uppercase tracking-wider">
                      Tier 1 Member
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">Member ID: #NEX-VIP-8819</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                    Nexora Black VIP Club
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
                    Earn 5% Nexora Coins on every audio monitor, mechanical keyboard, and precision gadget order. 1 Coin = ₹1 instant discount.
                  </p>
                </div>

                <div className="bg-card border border-amber-500/30 p-5 rounded-2xl text-center shadow-sm shrink-0">
                  <span className="text-xs text-muted-foreground font-medium block">Available Balance</span>
                  <div className="text-3xl font-black text-amber-500 flex items-center justify-center gap-1.5 mt-1">
                    <Coins className="w-7 h-7" />
                    <span>450</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal mt-1 block">Worth ₹450 at Checkout</span>
                </div>
              </div>

              {/* VIP Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/80 mt-6">
                <div className="flex items-start gap-3 p-3 bg-card/60 rounded-xl border border-border">
                  <Truck className="w-5 h-5 text-royal-blue shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Free Next-Day Air</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Zero shipping fee on all orders regardless of cart value.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-card/60 rounded-xl border border-border">
                  <Sparkles className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Priority AI Concierge</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Ultra-low latency catalog suggestions tailored to your desk setup.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-card/60 rounded-xl border border-border">
                  <RotateCcw className="w-5 h-5 text-royal-blue shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">14-Day Free Returns</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Hassle-free doorstep collection and direct source refunds.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Referral Card */}
            <Card className="rounded-2xl border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">Invite Friends, Earn ₹250 Each</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Give friends 10% off their first hardware purchase, and you earn 250 Coins when they order.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-muted rounded-xl font-mono text-xs font-bold text-foreground border border-border">
                  NEXORA-VIP-2026
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyReferral}
                  className="h-9 text-xs font-semibold gap-1.5"
                >
                  {copiedReferral ? <Check className="w-3.5 h-3.5 text-teal" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReferral ? 'Copied!' : 'Copy Code'}</span>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAL 1: EDIT PROFILE DIALOG */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Information</DialogTitle>
            <DialogDescription>
              Update your personal details. Changes are saved across your session.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Mobile Phone</Label>
              <Input
                id="edit-phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-city">Location / City</Label>
              <Input
                id="edit-city"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                placeholder="Bengaluru, India"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-bio">Bio / Workspace Setup</Label>
              <Input
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Audiophile & minimal desk enthusiast"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-1.5 font-bold">
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: ADD / EDIT ADDRESS DIALOG */}
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddressId ? 'Edit Shipping Address' : 'Add New Shipping Address'}
            </DialogTitle>
            <DialogDescription>
              Enter accurate address details for express courier dispatch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
            {/* Address Type Selector */}
            <div className="space-y-1.5">
              <Label>Address Type</Label>
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={addrType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAddrType(type)}
                    className="h-8 text-xs font-semibold flex-1"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="addr-name">Full Name</Label>
                <Input
                  id="addr-name"
                  value={addrFullName}
                  onChange={(e) => setAddrFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr-phone">Phone Number</Label>
                <Input
                  id="addr-phone"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addr-street">Street & Apartment</Label>
              <Input
                id="addr-street"
                value={addrStreet}
                onChange={(e) => setAddrStreet(e.target.value)}
                placeholder="Flat 101, Prestige Towers, Outer Ring Rd"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="addr-city">City</Label>
                <Input
                  id="addr-city"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr-state">State</Label>
                <Input
                  id="addr-state"
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  placeholder="Karnataka"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr-pin">Postal Code</Label>
                <Input
                  id="addr-pin"
                  value={addrPostalCode}
                  onChange={(e) => setAddrPostalCode(e.target.value)}
                  placeholder="560103"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="addr-default"
                checked={addrIsDefault}
                onCheckedChange={(checked) => setAddrIsDefault(Boolean(checked))}
              />
              <Label htmlFor="addr-default" className="text-xs cursor-pointer font-medium">
                Make this my default shipping address
              </Label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddressModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-bold">
                {editingAddressId ? 'Save Changes' : 'Save Address'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: INVOICE / RECEIPT DIALOG */}
      {selectedInvoiceOrder && (
        <Dialog
          open={Boolean(selectedInvoiceOrder)}
          onOpenChange={() => setSelectedInvoiceOrder(null)}
        >
          <DialogContent className="sm:max-w-lg print:p-0">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Nexora" className="w-7 h-7 object-contain" />
                  <span className="font-extrabold text-sm tracking-tight text-foreground">
                    NEXORA COMMERCE TAX INVOICE
                  </span>
                </div>
              </div>
              <DialogDescription className="text-xs">
                Official GST Tax Invoice & Delivery Receipt
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Invoice Number</span>
                  <span className="font-mono font-bold text-foreground">
                    INV-{selectedInvoiceOrder.orderNumber?.replace('NEX-', '')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Date of Order</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString('en-IN', {
                      dateStyle: 'long',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Payment Method</span>
                  <span className="font-semibold text-foreground uppercase">
                    {selectedInvoiceOrder.paymentMethod || 'Razorpay Verified'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">GSTIN Number</span>
                  <span className="font-mono text-foreground">29AAECN1234F1Z5</span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-3 bg-card border border-border rounded-xl">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">
                  Billed & Shipped To:
                </span>
                <p className="font-bold text-foreground">
                  {selectedInvoiceOrder.shippingAddress?.fullName || profileData.name}
                </p>
                <p className="text-muted-foreground">
                  {selectedInvoiceOrder.shippingAddress?.street}
                </p>
                <p className="text-muted-foreground">
                  {selectedInvoiceOrder.shippingAddress?.city},{' '}
                  {selectedInvoiceOrder.shippingAddress?.state} -{' '}
                  {selectedInvoiceOrder.shippingAddress?.postalCode}
                </p>
                <p className="text-muted-foreground">
                  Phone: {selectedInvoiceOrder.shippingAddress?.phone || profileData.phone}
                </p>
              </div>

              {/* Line Items Table */}
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedInvoiceOrder.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-foreground">
                          {it.name}
                          <span className="text-[10px] text-muted-foreground block">
                            Variant: {it.variant}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">{it.quantity}</td>
                        <td className="p-2.5 text-right">{formatPrice(it.price)}</td>
                        <td className="p-2.5 text-right font-bold text-foreground">
                          {formatPrice(it.price * it.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 pt-2 border-t border-border text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedInvoiceOrder.total || 0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Express Air Shipping</span>
                  <span className="text-teal font-semibold">FREE (Nexora VIP)</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Integrated GST (18%)</span>
                  <span>Included in pricing</span>
                </div>
                <Separator className="my-1.5" />
                <div className="flex justify-between text-sm font-extrabold text-foreground">
                  <span>Total Amount Paid</span>
                  <span className="text-royal-blue">
                    {formatPrice(selectedInvoiceOrder.total || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoiceOrder(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ProfilePage;
