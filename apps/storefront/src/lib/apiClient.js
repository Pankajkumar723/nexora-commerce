const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexora_auth_token') : null;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = {
    ...options,
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
};
