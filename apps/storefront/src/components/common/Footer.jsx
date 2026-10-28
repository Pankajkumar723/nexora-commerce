import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Cpu, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-20">
      {/* Brand value propositions */}
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-royal-blue shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-navy text-sm">Express Pan-India Delivery</h4>
                <p className="text-xs text-muted mt-1">Dispatched within 24 hours with real-time tracking.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-navy text-sm">Verified Razorpay Checkout</h4>
                <p className="text-xs text-muted mt-1">HMAC SHA-256 encrypted server verification.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-navy text-sm">Hassle-Free 14-Day Returns</h4>
                <p className="text-xs text-muted mt-1">Instant pickups and direct refunds to source account.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-navy text-sm">AI-Grounded Assistance</h4>
                <p className="text-xs text-muted mt-1">Real-time catalog intelligence powered by LLMs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <span className="font-bold text-lg tracking-tight text-navy">NEXORA COMMERCE</span>
            </div>
            <p className="text-sm text-muted max-w-sm">
              Engineering high-performance consumer technology, minimalist ergonomic workstations, and technical everyday gear.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Commerce Experience</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-navy mb-4">Catalog</h5>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><a href="#audio" className="hover:text-royal-blue transition">Audio & Acoustics</a></li>
              <li><a href="#wearables" className="hover:text-royal-blue transition">Smart Wearables</a></li>
              <li><a href="#desk" className="hover:text-royal-blue transition">Desk & Ergonomics</a></li>
              <li><a href="#travel" className="hover:text-royal-blue transition">Travel & EDC</a></li>
              <li><a href="#apparel" className="hover:text-royal-blue transition">Performance Apparel</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-navy mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><a href="#track" className="hover:text-royal-blue transition">Track Your Order</a></li>
              <li><a href="#returns" className="hover:text-royal-blue transition">Returns & Exchanges</a></li>
              <li><a href="#shipping" className="hover:text-royal-blue transition">Shipping Policy</a></li>
              <li><a href="#faq" className="hover:text-royal-blue transition">Support Center</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-navy mb-4">Architecture</h5>
            <ul className="space-y-2.5 text-sm text-muted">
              <li><span className="text-xs bg-canvas px-2 py-1 rounded text-navy font-mono">React + TanStack</span></li>
              <li><span className="text-xs bg-canvas px-2 py-1 rounded text-navy font-mono">NestJS REST API</span></li>
              <li><span className="text-xs bg-canvas px-2 py-1 rounded text-navy font-mono">PostgreSQL + Prisma</span></li>
              <li><span className="text-xs bg-canvas px-2 py-1 rounded text-navy font-mono">Razorpay Verified</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© 2026 Nexora Commerce Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-navy cursor-pointer">Privacy Policy</span>
            <span className="hover:text-navy cursor-pointer">Terms of Service</span>
            <span className="hover:text-navy cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
