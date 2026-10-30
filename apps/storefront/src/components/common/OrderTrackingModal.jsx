import React, { useState } from 'react';
import {
  X,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  FileText,
  Key,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import { formatPrice } from '../../lib/formatters';
import { formatDeliveryDate, generateTrackingInfo } from '../../lib/deliveryUtils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';

const TRACKING_STEPS = [
  {
    key: 'ORDER_PLACED',
    label: 'Order Placed & Confirmed',
    sublabel: 'Payment verified and sent to fulfillment warehouse',
    icon: Package,
  },
  {
    key: 'PACKED',
    label: 'Packed & Quality Verified',
    sublabel: 'Central Hub, Bengaluru. Security barcode sealed',
    icon: ShieldCheck,
  },
  {
    key: 'SHIPPED',
    label: 'Handed Over to Courier',
    sublabel: 'BlueDart Express Air in transit with AWB tracking',
    icon: Truck,
  },
  {
    key: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    sublabel: 'Delivery executive on route to your doorstep',
    icon: Clock,
  },
  {
    key: 'DELIVERED',
    label: 'Delivered to Customer',
    sublabel: 'Handed over at doorstep with digital verification',
    icon: CheckCircle2,
  },
];

export function OrderTrackingModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  // Active step index simulation (0: Placed, 1: Packed, 2: Shipped, 3: Out for delivery, 4: Delivered)
  const initialStep = order.status === 'DELIVERED' ? 4 : 2;
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const trackingInfo = generateTrackingInfo(order.id || order.orderNumber);
  const orderDate = new Date(order.createdAt || Date.now());
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  const handleNextStage = () => {
    setCurrentStepIndex((prev) => (prev < 4 ? prev + 1 : prev));
  };

  const handleResetStage = () => {
    setCurrentStepIndex(0);
  };

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(trackingInfo.deliveryOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-card text-card-foreground rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-muted/20 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm sm:text-base font-extrabold text-foreground">
                {order.orderNumber}
              </span>
              <Badge
                variant={currentStepIndex === 4 ? 'teal' : 'default'}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                {TRACKING_STEPS[currentStepIndex].label}
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid (Verified)'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Placed on {orderDate.toLocaleDateString('en-IN', { dateStyle: 'long' })} at{' '}
              {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Estimated Delivery & OTP Hero Card */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-royal-blue/10 via-card to-teal/10 border border-royal-blue/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-royal-blue block">
                {currentStepIndex === 4 ? 'Delivery Completed' : 'Expected Delivery Date'}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground mt-0.5">
                {currentStepIndex === 4
                  ? 'Delivered Successfully'
                  : formatDeliveryDate(deliveryDate, false)}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-royal-blue" />
                <span>Via {trackingInfo.courierName} • AWB: <strong className="font-mono text-foreground">{trackingInfo.awbNumber}</strong></span>
              </p>
            </div>

            {/* Secure Delivery OTP Box */}
            {currentStepIndex < 4 && (
              <div className="bg-card/90 backdrop-blur-md p-3.5 rounded-xl border border-border shadow-xs text-center shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                  Doorstep Delivery OTP
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl font-black text-foreground tracking-widest bg-muted px-2.5 py-1 rounded-lg border border-border">
                    {trackingInfo.deliveryOtp}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyOtp}
                    className="h-8 text-[11px] px-2 font-semibold"
                  >
                    {copiedOtp ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <span className="text-[9px] text-muted-foreground mt-1 block">
                  Share only with delivery executive
                </span>
              </div>
            )}
          </div>

          {/* Delivery Executive Info (When in transit or out for delivery) */}
          {currentStepIndex >= 2 && currentStepIndex <= 3 && (
            <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <img
                  src={trackingInfo.deliveryAgent.photo}
                  alt={trackingInfo.deliveryAgent.name}
                  className="w-11 h-11 rounded-full object-cover border border-border"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {trackingInfo.deliveryAgent.name}
                    </span>
                    <Badge variant="teal" className="text-[9px] px-1.5 py-0 font-bold">
                      {trackingInfo.deliveryAgent.rating} ★
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Assigned Courier Partner • {trackingInfo.deliveryAgent.vehicle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${trackingInfo.deliveryAgent.phone}`}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-royal-blue text-white text-xs font-semibold hover:bg-royal-blue/90 transition shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Executive</span>
                </a>
              </div>
            </div>
          )}

          {/* Stepper Progress Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-royal-blue" />
                Live Order Journey
              </h4>

              {/* Simulation Controls for Customer Experience */}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNextStage}
                  disabled={currentStepIndex >= 4}
                  className="h-7 text-[11px] font-semibold gap-1 text-royal-blue"
                >
                  <span>Advance Status</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
                {currentStepIndex === 4 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetStage}
                    className="h-7 text-[11px] text-muted-foreground"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    {/* Step Icon Indicator */}
                    <div
                      className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                        isCurrent
                          ? 'bg-royal-blue text-white ring-4 ring-royal-blue/20 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted border border-border text-muted-foreground'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        '✓'
                      ) : (
                        <StepIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            isPassed ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-royal-blue bg-royal-blue/10 px-2 py-0.5 rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {step.sublabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Destination & Order Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            {/* Address */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-royal-blue" />
                <span>Shipping Address</span>
              </div>
              <div className="text-xs text-foreground font-semibold">
                {order.shippingAddress?.fullName || 'Valued Customer'}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {order.shippingAddress?.street}, {order.shippingAddress?.city}
                {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} -{' '}
                <strong className="font-mono text-foreground">{order.shippingAddress?.postalCode || '560103'}</strong>
              </p>
              {order.shippingAddress?.phone && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{order.shippingAddress.phone}</span>
                </p>
              )}
            </div>

            {/* Financials & Invoice */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                <FileText className="w-3.5 h-3.5 text-royal-blue" />
                <span>Payment & Invoicing</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Paid:</span>
                <span className="font-extrabold text-foreground text-sm">
                  {formatPrice(order.financials?.grandTotal || order.total || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Method:</span>
                <span className="font-semibold text-foreground">
                  {order.paymentMethod === 'cod' ? 'Cash On Delivery' : 'Online Payment (Razorpay)'}
                </span>
              </div>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="w-full h-8 text-[11px] font-semibold gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Tax Invoice (GST)</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border bg-muted/10 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            Need assistance with this order? 24/7 Support available.
          </span>
          <Button
            type="button"
            variant="default"
            onClick={onClose}
            className="w-full sm:w-auto h-9 px-6 text-xs font-bold"
          >
            Close Tracker
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OrderTrackingModal;
