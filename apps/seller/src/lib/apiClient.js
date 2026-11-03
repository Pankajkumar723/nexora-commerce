function resolveSellerApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  const isBrowser = typeof window !== 'undefined';
  const isRender = isBrowser && window.location.hostname.includes('onrender.com');

  let raw = envUrl;
  if (isRender && (!raw || raw.includes('localhost') || raw.includes('nexora-api.onrender.com'))) {
    raw = 'https://nexora-api-hizw.onrender.com';
  }
  raw = raw || (isRender ? 'https://nexora-api-hizw.onrender.com' : 'http://localhost:4000/api/v1');
  const clean = raw.replace(/\/+$/, '');
  return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
}

const API_BASE_URL = resolveSellerApiUrl();

export const TOKEN_KEY = 'nexora_seller_token';
export const USER_KEY = 'nexora_seller_user';

export function getSellerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSellerToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getSellerUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSellerUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearSellerAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function sellerRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getSellerToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || `Seller request failed: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`[Seller API Error] ${endpoint}:`, err);
    throw err;
  }
}

export function formatINR(val) {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num || 0);
}
