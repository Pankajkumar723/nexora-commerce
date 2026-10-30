import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../lib/apiClient';
import { CATEGORIES, PRODUCTS } from '../data/catalogData';

// Re-export full 20 categories and 100 products
export const FALLBACK_CATEGORIES = CATEGORIES;
export const FALLBACK_PRODUCTS = PRODUCTS;

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        const response = await catalogApi.getProducts(params);
        return response;
      } catch (err) {
        console.warn('Backend API unreachable, using graceful client fallback:', err);
        let filtered = [...FALLBACK_PRODUCTS];

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
        const item = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
        if (!item) throw new Error('Product not found');
        return item;
      }
    },
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
        return FALLBACK_CATEGORIES;
      }
    },
  });
}
