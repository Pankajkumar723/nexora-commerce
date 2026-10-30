import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Truck,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RotateCcw,
  Banknote,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  getPincodeInfo,
  getDeliveryQuotes,
  getStoredPincode,
  setStoredPincode,
  isValidPincode,
} from '../../lib/deliveryUtils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

const QUICK_PINCODES = [
  { pin: '560103', label: 'Bengaluru' },
  { pin: '110001', label: 'Delhi' },
  { pin: '400001', label: 'Mumbai' },
  { pin: '500081', label: 'Hyderabad' },
  { pin: '600001', label: 'Chennai' },
];

export function DeliveryEstimator({ onPincodeChange, className = '' }) {
  const [currentPin, setCurrentPin] = useState(getStoredPincode());
  const [isChanging, setIsChanging] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [quotes, setQuotes] = useState(() => getDeliveryQuotes(getStoredPincode()));

  // Time remaining for same-day dispatch countdown
  const [cutoffTime, setCutoffTime] = useState({ hours: 4, minutes: 28 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Cutoff is 8:00 PM local time
      const target = new Date();
      target.setHours(20, 0, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff > 0) {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCutoffTime({ hours: hrs, minutes: mins });
      } else {
        setCutoffTime({ hours: 14, minutes: 30 });
      }
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleApplyPincode = (pincodeToApply) => {
    const pin = (pincodeToApply || pinInput).trim();
    if (!isValidPincode(pin)) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN Code');
      return;
    }

    setErrorMsg('');
    setCurrentPin(pin);
    setStoredPincode(pin);
    const newQuotes = getDeliveryQuotes(pin);
    setQuotes(newQuotes);
    setIsChanging(false);
    setPinInput('');

    if (onPincodeChange) {
      onPincodeChange(pin, newQuotes);
    }
  };

  return (
    <div className={`rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4 ${className}`}>
      {/* Header: Location & Pincode Checker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-royal-blue/10 text-royal-blue flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>Deliver to:</span>
              <span className="text-royal-blue font-extrabold">{quotes?.city || 'Bengaluru'}</span>
              <span className="font-mono text-muted-foreground font-semibold">({currentPin})</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Express delivery available for this address
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsChanging(!isChanging);
            setErrorMsg('');
          }}
          className="text-xs font-bold text-royal-blue hover:text-royal-blue/80 hover:underline self-start sm:self-auto"
        >
          {isChanging ? 'Cancel' : 'Change PIN'}
        </button>
      </div>

      {/* Expandable PIN Code Input */}
      {isChanging && (
        <div className="bg-muted/40 p-3.5 rounded-xl border border-border/80 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex gap-2">
            <Input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit Indian PIN code"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, ''));
                setErrorMsg('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyPincode();
              }}
              className="h-9 text-xs font-mono bg-card"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleApplyPincode()}
              className="h-9 px-4 text-xs font-bold shrink-0 bg-navy hover:bg-navy/90 text-white"
            >
              Check
            </Button>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errorMsg}</span>
            </p>
          )}

          {/* Quick select chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-muted-foreground font-medium">Quick select:</span>
            {QUICK_PINCODES.map((item) => (
              <button
                key={item.pin}
                type="button"
                onClick={() => handleApplyPincode(item.pin)}
                className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                  currentPin === item.pin
                    ? 'bg-royal-blue text-white border-royal-blue font-bold'
                    : 'bg-card text-foreground hover:bg-muted border-border'
                }`}
              >
                {item.label} ({item.pin})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Dates Options */}
      {quotes && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Standard Delivery Card */}
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/15 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Truck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-foreground">
                  Delivery by {quotes.standard.formattedDate}
                </span>
                <Badge variant="teal" className="text-[9px] font-bold px-1.5 py-0">
                  FREE
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Standard doorstep dispatch via BlueDart
              </p>
            </div>
          </div>

          {/* Priority Express Card */}
          <div className="p-3 rounded-xl border border-royal-blue/30 bg-royal-blue/5 dark:bg-royal-blue/10 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-royal-blue/20 text-royal-blue flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-foreground">
                  Express by {quotes.express.formattedDate}
                </span>
                <span className="text-[10px] font-bold text-royal-blue">
                  ₹99
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Air express priority delivery
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Countdown Timer Notice */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-[11px] font-medium leading-tight">
          Order within <strong className="font-bold">{cutoffTime.hours} hrs {cutoffTime.minutes} mins</strong> for same-day dispatch from our central fulfillment center.
        </span>
      </div>

      {/* Service Highlights / Guarantees Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/70 text-center">
        <div className="p-2 rounded-lg bg-muted/40">
          <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
          <span className="text-[10px] font-bold text-foreground block">Cash On Delivery</span>
          <span className="text-[9px] text-muted-foreground">Available at Doorstep</span>
        </div>

        <div className="p-2 rounded-lg bg-muted/40">
          <RotateCcw className="w-4 h-4 text-royal-blue mx-auto mb-1" />
          <span className="text-[10px] font-bold text-foreground block">7-Day Replacement</span>
          <span className="text-[9px] text-muted-foreground">Hassle-free pickup</span>
        </div>

        <div className="p-2 rounded-lg bg-muted/40">
          <ShieldCheck className="w-4 h-4 text-teal mx-auto mb-1" />
          <span className="text-[10px] font-bold text-foreground block">Nexora Assured</span>
          <span className="text-[9px] text-muted-foreground">100% Genuine Quality</span>
        </div>
      </div>
    </div>
  );
}

export default DeliveryEstimator;
