import React, { useState } from 'react';
import { Store, Lock, Mail, User, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react';
import { sellerRequest, setSellerToken, setSellerUser } from '../../lib/apiClient';

export function SellerRegisterView({ onRegisterSuccess, onNavigateLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await sellerRequest('/sellers/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (res?.data?.session?.token) {
        setSellerToken(res.data.session.token);
        setSellerUser(res.data.user);
        onRegisterSuccess(res.data);
      } else {
        throw new Error('Registration succeeded but session was missing.');
      }
    } catch (err) {
      setError(
        err.message || 'Registration failed. An account with this email may already exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy text-white shadow-lg shadow-navy/20 mb-4 ring-4 ring-teal/20 transition-transform hover:scale-105 duration-300">
          <Store className="w-7 h-7 text-teal" />
        </div>
        <h2 className="text-3xl font-extrabold font-heading text-navy tracking-tight">
          Become a Nexora Merchant
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-500 font-medium">
          Create your seller account in seconds. Start selling across all 20 product categories.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed flex items-start gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                Primary Contact / Representative Name
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aryan Sharma"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                Business Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@example.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                Account Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="block w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <CheckCircle className="w-3.5 h-3.5 text-teal shrink-0" />
                <span>Zero listing fees • Instant settlement to verified bank</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md text-xs sm:text-sm font-bold font-heading text-white bg-royal-blue hover:bg-royal-blue/90 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-royal-blue/40 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Continue to Business Onboarding'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <span className="text-xs text-gray-500">Already registered as a merchant? </span>
            <button
              onClick={onNavigateLogin}
              className="text-xs font-bold text-royal-blue hover:text-navy hover:underline transition-colors ml-1"
            >
              Sign in here
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-500 text-center px-4">
          <ShieldCheck className="w-4 h-4 text-teal shrink-0" />
          <span>Protected by Nexora Role-Based Identity & 256-bit SSL Encryption</span>
        </div>
      </div>
    </div>
  );
}

export default SellerRegisterView;
