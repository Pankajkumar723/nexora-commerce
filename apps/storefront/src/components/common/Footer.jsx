import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Sparkles, CheckCircle2, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t border-border mt-20 transition-colors">
      {/* Brand value propositions */}
      <div className="border-b border-border bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">Express Pan-India Delivery</h4>
                <p className="text-xs text-muted-foreground mt-1">Dispatched within 24 hours with real-time tracking.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-teal/10 text-teal shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">Verified Razorpay Checkout</h4>
                <p className="text-xs text-muted-foreground mt-1">HMAC SHA-256 encrypted server verification.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">Hassle-Free 14-Day Returns</h4>
                <p className="text-xs text-muted-foreground mt-1">Instant pickups and direct refunds to source account.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-teal/10 text-teal shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">AI-Grounded Shopping</h4>
                <p className="text-xs text-muted-foreground mt-1">Real-time catalog intelligence powered by LLMs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                N
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">NEXORA COMMERCE</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
              Engineering high-performance consumer technology, minimalist ergonomic workstations, and technical everyday gear.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Commerce Experience</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Catalog</h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li><a href="#audio" className="hover:text-primary transition-colors">Audio & Acoustics</a></li>
              <li><a href="#wearables" className="hover:text-primary transition-colors">Smart Wearables</a></li>
              <li><a href="#desk" className="hover:text-primary transition-colors">Desk & Ergonomics</a></li>
              <li><a href="#travel" className="hover:text-primary transition-colors">Travel & EDC</a></li>
              <li><a href="#apparel" className="hover:text-primary transition-colors">Performance Apparel</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li><a href="#track" className="hover:text-primary transition-colors">Track Your Order</a></li>
              <li><a href="#returns" className="hover:text-primary transition-colors">Returns & Exchanges</a></li>
              <li><a href="#shipping" className="hover:text-primary transition-colors">Shipping Policy</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">Support Center</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Trust & Security</h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5 text-foreground/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0" />
                <span>100% Certified Genuine</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground/80">
                <Lock className="w-3.5 h-3.5 text-teal shrink-0" />
                <span>256-bit SSL Encryption</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground/80">
                <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0" />
                <span>Razorpay Verified</span>
              </li>
              <li className="flex items-center gap-1.5 text-foreground/80">
                <Sparkles className="w-3.5 h-3.5 text-teal shrink-0" />
                <span>Official Warranty Cover</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© 2026 Nexora Commerce Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
