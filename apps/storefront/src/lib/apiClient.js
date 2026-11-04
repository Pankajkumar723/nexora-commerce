function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  const isBrowser = typeof window !== 'undefined';
  const isRender = isBrowser && window.location.hostname.includes('onrender.com');

  let raw = envUrl;

  // If deployed on Render and pointing to wrong/non-functional nexora-api or localhost, auto-route to actual backend
  if (isRender) {
    if (
      !raw ||
      raw.includes('localhost') ||
      raw === 'https://nexora-api.onrender.com' ||
      raw === 'https://nexora-api.onrender.com/api/v1'
    ) {
      raw = 'https://nexora-api-hizw.onrender.com';
    }
  }

  raw = raw || (isRender ? 'https://nexora-api-hizw.onrender.com' : 'http://localhost:4000/api/v1');
  const cleanUrl = raw.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
}

const API_BASE_URL = resolveApiBaseUrl();

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexora_auth_token') : null;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Add 6s request timeout to prevent hanging UI on network hiccups
  const controller = new AbortController();
  const timeoutMs = options.timeout || 6000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const config = {
    ...options,
    signal: options.signal || controller.signal,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = result?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.details = result;
      throw error;
    }

    return result;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const catalogApi = {
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);
    if (params.search) searchParams.set('search', params.search);
    if (params.category) searchParams.set('category', params.category);
    if (params.minPrice) searchParams.set('minPrice', params.minPrice);
    if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice);
    if (params.sort) searchParams.set('sort', params.sort);

    const queryString = searchParams.toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getProductBySlug: (slug) => {
    return apiRequest(`/products/${slug}`);
  },

  getCategories: () => {
    return apiRequest('/categories');
  },
};

export const aiApi = {
  getRecommendations: (data) => {
    return apiRequest('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const authApi = {
  login: (data) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  register: (data) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getMe: () => {
    return apiRequest('/auth/me');
  },
  logout: () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
  getProfile: () => {
    return apiRequest('/users/profile');
  },
  googleAuth: (data) => {
    return apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  sendOtp: (data) => {
    return apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  verifyOtp: (data) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  registerWithOtp: (data) => {
    return apiRequest('/auth/register-with-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const couponApi = {
  validateCoupon: (code, orderSubtotal) => {
    return apiRequest('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderSubtotal }),
    });
  },
};

export const orderApi = {
  createOrder: (data) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getOrderById: (id) => {
    return apiRequest(`/orders/${id}`);
  },
  getCustomerOrders: () => {
    return apiRequest('/orders');
  },
};

export const paymentApi = {
  createRazorpayOrder: (orderId) => {
    return apiRequest('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },
  verifyRazorpayPayment: (data) => {
    return apiRequest('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
