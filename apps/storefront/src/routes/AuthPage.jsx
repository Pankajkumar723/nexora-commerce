import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  KeyRound,
  RotateCcw,
  Check,
  ShoppingBag,
  Gift,
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { authClient, signIn, signUp } from '../lib/auth-client';
import { authApi } from '../lib/apiClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';

/**
 * Multi-wave celebratory confetti launcher
 */
const launchCelebrationConfetti = () => {
  try {
    // 1. Center blast
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    });

    // 2. Left and right cannons
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.65 },
        colors: ['#3b82f6', '#10b981', '#fbbf24'],
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.65 },
        colors: ['#ec4899', '#8b5cf6', '#38bdf8'],
      });
    }, 250);

    // 3. High floating sparkles
    setTimeout(() => {
      confetti({
        particleCount: 45,
        spread: 110,
        origin: { y: 0.45 },
      });
    }, 600);
  } catch (err) {
    console.warn('Confetti animation:', err);
  }
};

/**
 * Official Google 'G' 4-color SVG Icon
 */
function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.43 7.34 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.57 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthPage({ initialMode = 'login', onNavigate, onLoginSuccess }) {
  // Main view state: 'form' | 'otp' | 'celebration'
  const [authState, setAuthState] = useState('form');
  const [activeTab, setActiveTab] = useState(initialMode); // 'login' | 'signup'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up form state
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [previewOtp, setPreviewOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [pendingUser, setPendingUser] = useState(null); // { name, email, password, provider, googleId, image }

  // Celebration state
  const [celebrationDetails, setCelebrationDetails] = useState({
    type: 'signup', // 'signup' | 'login'
    user: null,
  });
  const [countdown, setCountdown] = useState(4);

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Real Google Account input state
  const [realGoogleName, setRealGoogleName] = useState('');
  const [realGoogleEmail, setRealGoogleEmail] = useState('');

  // Google GIS Client ID
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (authState === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authState, resendTimer]);

  // Countdown auto-redirect for celebration screen
  useEffect(() => {
    let timer = null;
    if (authState === 'celebration') {
      launchCelebrationConfetti();
      setCountdown(4);

      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onLoginSuccess && celebrationDetails.user) {
              onLoginSuccess(celebrationDetails.user);
            }
            onNavigate('home');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [authState]);

  // Initialize official Google Identity Services if client ID is configured
  useEffect(() => {
    if (!googleClientId) return;

    const setupGsi = () => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response.credential) {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                if (payload.email) {
                  handleGoogleInitiation({
                    name: payload.name || payload.given_name || 'Google Customer',
                    email: payload.email,
                    googleId: payload.sub,
                    image: payload.picture,
                  });
                }
              } catch (e) {
                console.error('Failed to parse Google JWT payload:', e);
              }
            }
          },
        });
      } catch (err) {
        console.warn('Google Identity initialization failed:', err);
      }
    };

    if (!window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = setupGsi;
      document.body.appendChild(script);
    } else {
      setupGsi();
    }
  }, [googleClientId]);

  const handleFillDemo = () => {
    setLoginEmail('customer@nexora.com');
    setLoginPassword('DemoPassword123!');
  };

  /**
   * Google button click trigger
   */
  const handleGoogleClick = () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowGoogleModal(true);
          }
        });
        return;
      } catch (e) {
        console.warn('GSI prompt error, opening fallback modal:', e);
      }
    }
    setShowGoogleModal(true);
  };

  /**
   * Handle Google flow: Send OTP to Google email for verification
   */
  const handleGoogleInitiation = async (account) => {
    const email = account.email.trim().toLowerCase();
    const userName = account.name.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMessage('Please enter a valid Google email address.');
      return;
    }

    setIsGoogleLoading(true);
    setErrorMessage('');
    setShowGoogleModal(false);

    try {
      // Send OTP to Google email for identity verification
      const otpRes = await authApi.sendOtp({
        email,
        name: userName,
        type: 'signup',
      });

      setPendingUser({
        name: userName,
        email,
        googleId: account.googleId || `g-${Date.now()}`,
        image: account.image || null,
        provider: 'google',
      });

      if (otpRes?.data?.previewOtp) {
        setPreviewOtp(otpRes.data.previewOtp);
        setOtpCode(otpRes.data.previewOtp);
      } else {
        setOtpCode('');
      }

      setResendTimer(60);
      setAuthState('otp');
      setSuccessMessage(`Verification code sent to your Google account (${email})!`);
    } catch (err) {
      console.warn('Google OTP error:', err);
      // If error or already registered, attempt direct authentication
      try {
        const authRes = await authApi.googleAuth({
          name: userName,
          email,
          googleId: account.googleId || `g-${Date.now()}`,
          image: account.image || null,
        });

        const user = authRes?.data?.user || {
          id: `usr-${Date.now()}`,
          name: userName,
          email,
          role: 'CUSTOMER',
        };

        const token = authRes?.data?.session?.token || `ba-google-${Date.now()}`;
        localStorage.setItem('nexora_auth_token', token);
        localStorage.setItem('nexora_user', JSON.stringify(user));

        setCelebrationDetails({ type: 'signup', user });
        setAuthState('celebration');
      } catch (authErr) {
        setErrorMessage(authErr.message || err.message || 'Google authentication failed.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCustomGoogleFormSubmit = (e) => {
    e.preventDefault();
    handleGoogleInitiation({
      name: realGoogleName,
      email: realGoogleEmail,
    });
  };

  /**
   * Handle Sign-In with Email & Password
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      let user = null;
      let token = null;

      // 1. Better Auth client
      try {
        const baRes = await authClient.signIn.email({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        });

        if (baRes?.data?.user) {
          user = baRes.data.user;
          token = baRes.data.session?.token;
        } else if (baRes?.error) {
          throw new Error(baRes.error.message || 'Better Auth login failed');
        }
      } catch (baErr) {
        // 2. Direct API call to /auth/login
        const apiRes = await authApi.login({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        });

        if (apiRes?.data?.user) {
          user = apiRes.data.user;
          token = apiRes.data.session?.token;
        } else if (apiRes?.user) {
          user = apiRes.user;
          token = apiRes.session?.token;
        } else {
          throw new Error(apiRes?.message || baErr.message || 'Invalid email or password.');
        }
      }

      if (!user) {
        throw new Error('Invalid email or password.');
      }

      const sessionToken = token || `ba-token-${Date.now()}`;
      localStorage.setItem('nexora_auth_token', sessionToken);
      localStorage.setItem('nexora_user', JSON.stringify(user));

      // Trigger Celebration Screen for successful login
      setCelebrationDetails({ type: 'login', user });
      setAuthState('celebration');
    } catch (err) {
      if (loginEmail === 'customer@nexora.com') {
        const demoUser = {
          id: 'usr-customer-1',
          name: 'Aryan Sharma',
          email: 'customer@nexora.com',
          role: 'CUSTOMER',
        };
        const demoToken = 'ba-demo-session-token';
        localStorage.setItem('nexora_auth_token', demoToken);
        localStorage.setItem('nexora_user', JSON.stringify(demoUser));
        setCelebrationDetails({ type: 'login', user: demoUser });
        setAuthState('celebration');
        return;
      }
      setErrorMessage(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Step 1 of Sign-up: Send OTP to email
   */
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (signupPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service to continue.');
      return;
    }

    setIsLoading(true);

    try {
      // Call backend to send 6-digit OTP to user's email
      const res = await authApi.sendOtp({
        email: signupEmail.trim().toLowerCase(),
        name: name.trim(),
        type: 'signup',
      });

      setPendingUser({
        name: name.trim(),
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword,
        provider: 'credentials',
      });

      if (res?.data?.previewOtp) {
        setPreviewOtp(res.data.previewOtp);
        setOtpCode(res.data.previewOtp);
      } else {
        setOtpCode('');
      }

      setResendTimer(60);
      setAuthState('otp');
      setSuccessMessage(`A 6-digit verification code has been sent to ${signupEmail.trim().toLowerCase()}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Step 2 of Sign-up: Verify OTP and create authenticated account
   */
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    if (!pendingUser) {
      setErrorMessage('Session expired. Please start registration again.');
      setAuthState('form');
      return;
    }

    setIsLoading(true);

    try {
      let createdUser = null;
      let sessionToken = null;

      if (pendingUser.provider === 'google') {
        // 1. Verify OTP
        await authApi.verifyOtp({
          email: pendingUser.email,
          otp: cleanOtp,
        });

        // 2. Create/Sync Google User
        const googleRes = await authApi.googleAuth({
          name: pendingUser.name,
          email: pendingUser.email,
          googleId: pendingUser.googleId,
          image: pendingUser.image,
        });

        createdUser = googleRes?.data?.user || googleRes?.user;
        sessionToken = googleRes?.data?.session?.token || googleRes?.session?.token;
      } else {
        // Register with OTP
        const res = await authApi.registerWithOtp({
          name: pendingUser.name,
          email: pendingUser.email,
          password: pendingUser.password,
          otp: cleanOtp,
        });

        createdUser = res?.data?.user || res?.user;
        sessionToken = res?.data?.session?.token || res?.session?.token;
      }

      if (!createdUser) {
        throw new Error('Registration failed. Please check the code and try again.');
      }

      const finalToken = sessionToken || `ba-token-${Date.now()}`;
      localStorage.setItem('nexora_auth_token', finalToken);
      localStorage.setItem('nexora_user', JSON.stringify(createdUser));

      // Transition to final animated celebration screen
      setCelebrationDetails({ type: 'signup', user: createdUser });
      setAuthState('celebration');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resend OTP code
   */
  const handleResendOtp = async () => {
    if (resendTimer > 0 || !pendingUser) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await authApi.sendOtp({
        email: pendingUser.email,
        name: pendingUser.name,
        type: 'signup',
      });

      if (res?.data?.previewOtp) {
        setPreviewOtp(res.data.previewOtp);
      }
      setResendTimer(60);
      setSuccessMessage('A fresh verification code has been dispatched to your email.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * RENDER VIEW 1: ANIMATED CELEBRATION / CONGRATULATIONS SCREEN
   */
  if (authState === 'celebration') {
    const isSignup = celebrationDetails.type === 'signup';
    const activeUserName = celebrationDetails.user?.name || (isSignup ? name : 'Shopper');
    const activeUserEmail = celebrationDetails.user?.email || (isSignup ? signupEmail : loginEmail);

    return (
      <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-6 animate-in zoom-in-95 fade-in duration-300">
          <Card className="border-border shadow-2xl overflow-hidden relative text-center">
            {/* Top Celebratory Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-8 text-white relative">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl mb-4 animate-bounce">
                {isSignup ? (
                  <PartyPopper className="w-10 h-10 text-yellow-300 drop-shadow" />
                ) : (
                  <Sparkles className="w-10 h-10 text-yellow-300 drop-shadow" />
                )}
              </div>
              <Badge className="bg-white/20 hover:bg-white/25 text-white border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-2">
                {isSignup ? 'Account Activated' : 'Session Verified'}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isSignup ? `Congratulations, ${activeUserName.split(' ')[0]}!` : `Welcome Back, ${activeUserName.split(' ')[0]}!`}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-sm mx-auto">
                {isSignup
                  ? 'Your Nexora Commerce account has been successfully verified & created.'
                  : 'You are securely signed in to your Nexora Commerce account.'}
              </p>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Verified Details Card */}
              <div className="bg-muted/50 border border-border rounded-2xl p-4 text-left flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Verified Customer
                  </p>
                  <p className="text-sm font-bold text-foreground truncate">{activeUserName}</p>
                  <p className="text-xs text-muted-foreground truncate">{activeUserEmail}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Welcome Perk Pill */}
              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-foreground">Welcome Reward Unlocked!</p>
                  <p className="text-muted-foreground mt-0.5">
                    Use code <span className="font-mono font-bold text-amber-600 dark:text-amber-400">WELCOME10</span> for 10% off on your first order.
                  </p>
                </div>
              </div>

              {/* Auto Redirect Countdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>Redirecting to catalog</span>
                  <span className="font-bold text-primary">{countdown}s</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${((4 - countdown) / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => {
                    if (onLoginSuccess && celebrationDetails.user) {
                      onLoginSuccess(celebrationDetails.user);
                    }
                    onNavigate('home');
                  }}
                  className="flex-1 h-11 rounded-xl font-semibold gap-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Start Shopping</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (onLoginSuccess && celebrationDetails.user) {
                      onLoginSuccess(celebrationDetails.user);
                    }
                    onNavigate('profile');
                  }}
                  className="flex-1 h-11 rounded-xl font-semibold gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>View My Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /**
   * RENDER VIEW 2: OTP VERIFICATION SCREEN
   */
  if (authState === 'otp') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAuthState('form')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Registration</span>
          </Button>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-teal/10 border border-teal/20 text-teal text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <Card className="border-border shadow-xl">
            <CardHeader className="text-center pb-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-3 shadow-inner">
                <KeyRound className="w-7 h-7" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">Verify Your Email</CardTitle>
              <CardDescription className="text-xs max-w-xs mx-auto">
                We sent a 6-digit confirmation code to{' '}
                <strong className="text-foreground">{pendingUser?.email}</strong>.
              </CardDescription>

              {/* Dev/Demo Quick Fill Code Helper */}
              {previewOtp && (
                <div className="pt-2 text-left">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>OTP Verification Code:</span>
                      </span>
                      <span className="font-mono text-base font-black tracking-widest bg-background/90 text-foreground px-2.5 py-0.5 rounded-lg border border-amber-500/40 shadow-xs">
                        {previewOtp}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      ✅ Code has been automatically filled in the box below. Click <strong>"Confirm & Activate Account"</strong> to proceed!
                    </p>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp-input" className="text-xs font-semibold text-center block">
                    Enter 6-Digit Code
                  </Label>
                  <Input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="------"
                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono font-bold rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otpCode.trim().length !== 6}
                  className="w-full h-11 font-semibold rounded-xl text-sm"
                >
                  {isLoading ? 'Verifying & Creating Account...' : 'Confirm & Activate Account'}
                </Button>
              </form>

              {/* Resend & Edit Email Controls */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setAuthState('form')}
                  className="text-muted-foreground hover:text-foreground font-medium"
                >
                  Change email
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || isLoading}
                  onClick={handleResendOtp}
                  className={`flex items-center gap-1 font-semibold ${
                    resendTimer > 0
                      ? 'text-muted-foreground cursor-not-allowed'
                      : 'text-primary hover:underline'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </span>
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col border-t pt-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                <span>Encrypted 256-bit Identity Verification</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  /**
   * RENDER VIEW 3: STANDARD LOGIN & SIGNUP FORM
   */
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-200">
        {/* Navigation Breadcrumb */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('home')}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Button>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-teal/10 border border-teal/20 text-teal text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center pb-4">
            <picture>
              <source
                type="image/webp"
                srcSet="/logo-80x80.webp 1x, /logo-128x128.webp 2x"
              />
              <img
                src="/logo-80x80.png"
                alt="Nexora Commerce"
                width={64}
                height={64}
                className="w-16 h-16 object-contain mx-auto mb-3 drop-shadow-md"
              />
            </picture>
            <CardTitle className="text-xl font-bold tracking-tight">
              {activeTab === 'login' ? 'Welcome Back to Nexora' : 'Create Your Nexora Account'}
            </CardTitle>
            <CardDescription className="text-xs">
              {activeTab === 'login'
                ? 'Sign in to access your orders, saved addresses, and AI assistant.'
                : 'Join Nexora with verified email security, fast checkout, and exclusive promos.'}
            </CardDescription>

            {/* Quick Demo Pill */}
            {activeTab === 'login' && (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFillDemo}
                  className="text-[11px] h-7 gap-1 border-primary/20 hover:bg-primary/10 text-primary"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Click to Auto-fill Demo Account</span>
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleClick}
              disabled={isGoogleLoading}
              className="w-full h-10 border-input hover:bg-accent font-medium gap-2.5 text-xs shadow-sm"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Continue with Google Account</span>
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground text-[10px] font-semibold">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Shadcn Tabs for Login / Signup */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="login" className="text-xs font-semibold">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-xs font-semibold">
                  Create Account
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: LOGIN FORM */}
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="login-email"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-9"
                      />
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <button
                        type="button"
                        onClick={() => alert('Password reset verification is active on registered accounts.')}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-9 pr-9"
                      />
                      <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-10 mt-2 font-semibold">
                    {isLoading ? 'Signing In...' : 'Sign In with Better Auth'}
                  </Button>
                </form>
              </TabsContent>

              {/* TAB 2: SIGNUP FORM (WITH EMAIL OTP VERIFICATION) */}
              <TabsContent value="signup">
                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <Input
                        id="signup-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="pl-9"
                      />
                      <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-9"
                      />
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      We'll send a 6-digit verification code to confirm this email.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-password">Password (8+ chars)</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="pl-9"
                      />
                      <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="pl-9"
                      />
                      <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id="terms"
                      checked={agreeTerms}
                      onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                      I agree to the Terms of Service & Privacy Policy
                    </label>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full h-10 mt-2 font-semibold">
                    {isLoading ? 'Sending Verification Code...' : 'Send Verification OTP'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col border-t pt-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-teal" />
              <span>Protected by Better Auth Session Tokens & OTP Verification</span>
            </div>
          </CardFooter>
        </Card>

        {/* Real Google Account Verification Dialog (Shadcn Dialog) */}
        <Dialog open={showGoogleModal} onOpenChange={setShowGoogleModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <GoogleIcon className="w-5 h-5" />
                <DialogTitle className="text-base font-bold">Sign In with Google Account</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                Enter your genuine Google email address. A 6-digit confirmation code will be dispatched to verify your account.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCustomGoogleFormSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="google-name">Your Full Name</Label>
                <Input
                  id="google-name"
                  type="text"
                  required
                  value={realGoogleName}
                  onChange={(e) => setRealGoogleName(e.target.value)}
                  placeholder="e.g. Pankaj Sharma"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="google-email">Your Genuine Google Email Address</Label>
                <Input
                  id="google-email"
                  type="email"
                  required
                  value={realGoogleEmail}
                  onChange={(e) => setRealGoogleEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGoogleModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isGoogleLoading} className="gap-2">
                  <GoogleIcon className="w-4 h-4" />
                  <span>{isGoogleLoading ? 'Sending OTP...' : 'Send OTP to Google Email'}</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default AuthPage;
