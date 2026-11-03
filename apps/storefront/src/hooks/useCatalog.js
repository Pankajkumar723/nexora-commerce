import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../lib/apiClient';

let fallbackPromise = null;
async function getFallbackData() {
  if (!fallbackPromise) {
    fallbackPromise = import('../data/catalogData');
  }
  return fallbackPromise;
}

// Instant 0ms placeholder data for the home page so products render immediately
const INSTANT_FEATURED_PRODUCTS = [
  {
    id: 'prod-fc-1',
    name: 'Apex Merino Wool Thermal Tech Crew',
    slug: 'apex-merino-wool-thermal-tech-crew',
    price: '3499.00',
    compareAtPrice: '4999.00',
    rating: 4.8,
    reviewCount: 128,
    inStock: true,
    totalStock: 95,
    category: { name: 'Fashion & Clothing', slug: 'fashion-clothing' },
    images: [
      {
        id: 'img-fc-1-1',
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
        alt: 'Tech Crew Front',
      },
    ],
  },
  {
    id: 'prod-fc-2',
    name: 'Aura Tailored Oxford Slim-Fit Cotton Shirt',
    slug: 'aura-tailored-oxford-slim-fit-cotton-shirt',
    price: '1899.00',
    compareAtPrice: '2799.00',
    rating: 4.7,
    reviewCount: 92,
    inStock: true,
    totalStock: 120,
    category: { name: 'Fashion & Clothing', slug: 'fashion-clothing' },
    images: [
      {
        id: 'img-fc-2-1',
        url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
        alt: 'Oxford Shirt',
      },
    ],
  },
  {
    id: 'prod-fc-3',
    name: 'Vanguard All-Weather Waterproof Commuter Trench Coat',
    slug: 'vanguard-all-weather-waterproof-commuter-trench-coat',
    price: '6999.00',
    compareAtPrice: '9999.00',
    rating: 4.9,
    reviewCount: 44,
    inStock: true,
    totalStock: 60,
    category: { name: 'Fashion & Clothing', slug: 'fashion-clothing' },
    images: [
      {
        id: 'img-fc-3-1',
        url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=1200&q=80',
        alt: 'Trench Coat',
      },
    ],
  },
  {
    id: 'prod-fc-4',
    name: 'Equinox Pure Mulberry Silk Evening Dress',
    slug: 'equinox-pure-mulberry-silk-evening-dress',
    price: '5499.00',
    compareAtPrice: '7999.00',
    rating: 4.9,
    reviewCount: 38,
    inStock: true,
    totalStock: 50,
    category: { name: 'Fashion & Clothing', slug: 'fashion-clothing' },
    images: [
      {
        id: 'img-fc-4-1',
        url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=80',
        alt: 'Silk Dress',
      },
    ],
  },
  {
    id: 'prod-fc-5',
    name: 'Kinesis Raw Selvedge Japanese Denim Jeans',
    slug: 'kinesis-raw-selvedge-japanese-denim-jeans',
    price: '3999.00',
    compareAtPrice: '5499.00',
    rating: 4.8,
    reviewCount: 65,
    inStock: true,
    totalStock: 80,
    category: { name: 'Fashion & Clothing', slug: 'fashion-clothing' },
    images: [
      {
        id: 'img-fc-5-1',
        url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1200&q=80',
        alt: 'Denim Jeans',
      },
    ],
  },
  {
    id: 'prod-el-1',
    name: 'Nexora Studio Pro Wireless ANC Headphones',
    slug: 'nexora-studio-pro-wireless-anc-headphones',
    price: '18999.00',
    compareAtPrice: '22999.00',
    rating: 4.9,
    reviewCount: 142,
    inStock: true,
    totalStock: 85,
    category: { name: 'Electronics', slug: 'electronics' },
    images: [
      {
        id: 'img-el-1-1',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        alt: 'Headphones',
      },
    ],
  },
];

const INSTANT_CATEGORIES = [
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    productCount: 5,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-fashion-clothing',
    name: 'Fashion & Clothing',
    slug: 'fashion-clothing',
    productCount: 5,
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-mobiles-accessories',
    name: 'Mobiles & Accessories',
    slug: 'mobiles-accessories',
    productCount: 5,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-computers-accessories',
    name: 'Computers & Tech',
    slug: 'computers-accessories',
    productCount: 5,
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cat-watches-wearables',
    name: 'Watches & Wearables',
    slug: 'watches-wearables',
    productCount: 5,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  },
];

export function useProducts(params = {}) {
  const isDefaultHome =
    !params.search &&
    !params.category &&
    !params.minPrice &&
    !params.maxPrice &&
    (params.page === 1 || !params.page);

  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        const response = await catalogApi.getProducts(params);
        return response;
      } catch (err) {
        console.warn('Backend API unreachable, using graceful client fallback:', err);
        const fallback = await getFallbackData();
        let filtered = [...fallback.PRODUCTS];

        if (params.category) {
          filtered = filtered.filter((p) => p.category?.slug === params.category);
        }
        if (params.search) {
          const s = params.search.toLowerCase().trim();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(s) ||
              p.description.toLowerCase().includes(s) ||
              p.category?.name.toLowerCase().includes(s) ||
              p.category?.slug.toLowerCase().includes(s),
          );
        }
        if (params.minPrice) {
          filtered = filtered.filter((p) => Number(p.price) >= Number(params.minPrice));
        }
        if (params.maxPrice) {
          filtered = filtered.filter((p) => Number(p.price) <= Number(params.maxPrice));
        }

        if (params.sort === 'price_asc') {
          filtered.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (params.sort === 'price_desc') {
          filtered.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (params.sort === 'name_asc') {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (params.sort === 'rating_desc') {
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        const total = filtered.length;
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 12;
        const startIndex = (page - 1) * limit;
        const paginatedData = filtered.slice(startIndex, startIndex + limit);

        return {
          success: true,
          data: paginatedData,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes fresh cache
    gcTime: 30 * 60 * 1000, // 30 minutes in memory
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: (previousData) => {
      if (previousData) return previousData;
      if (isDefaultHome) {
        return {
          success: true,
          data: INSTANT_FEATURED_PRODUCTS,
          meta: {
            total: 26,
            page: 1,
            limit: 12,
            totalPages: 3,
          },
        };
      }
      return undefined;
    },
  });
}

export function useProductDetail(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      try {
        const response = await catalogApi.getProductBySlug(slug);
        return response.data;
      } catch (err) {
        console.warn(`Backend API unreachable for slug ${slug}, using client fallback:`, err);
        const fallback = await getFallbackData();
        const item = fallback.PRODUCTS.find((p) => p.slug === slug);
        if (!item) throw new Error('Product not found');
        return item;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: Boolean(slug),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await catalogApi.getCategories();
        return response.data;
      } catch (err) {
        console.warn('Backend API unreachable for categories, using fallback:', err);
        const fallback = await getFallbackData();
        return fallback.CATEGORIES;
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: INSTANT_CATEGORIES,
  });
}
