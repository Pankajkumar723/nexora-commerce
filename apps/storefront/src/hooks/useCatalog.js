import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../lib/apiClient';

// Fallback demo data if backend database is offline during initial frontend preview
export const FALLBACK_PRODUCTS = [
  {
    id: 'prod-fallback-1',
    name: 'Nexora Studio Pro Wireless ANC Headphones',
    slug: 'nexora-studio-pro-wireless-anc-headphones',
    description: 'Engineered with 40mm custom beryllium dynamic drivers, hybrid active noise cancellation (up to -42dB), multipoint Bluetooth 5.4, and 50 hours of battery life.',
    price: '18999.00',
    compareAtPrice: '22999.00',
    rating: 4.9,
    reviewCount: 38,
    inStock: true,
    totalStock: 75,
    category: { id: 'cat-1', name: 'Audio & Acoustics', slug: 'audio-acoustics' },
    images: [
      { id: 'img-1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80', alt: 'Matte Black Studio Pro Headphones', sortOrder: 0 },
      { id: 'img-2', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80', alt: 'Headphones Angle', sortOrder: 1 },
    ],
    variants: [
      { id: 'v-1', sku: 'NEX-HP-BLK', attributes: { color: 'Matte Obsidian' }, stockQuantity: 45 },
      { id: 'v-2', sku: 'NEX-HP-SLV', attributes: { color: 'Lunar Silver' }, stockQuantity: 30 },
    ],
    reviews: [
      { id: 'r-1', rating: 5, comment: 'Phenomenal acoustic precision and build. The ANC blocks out airplane hum effortlessly.', customer: { name: 'Aryan Sharma' } },
    ],
  },
  {
    id: 'prod-fallback-2',
    name: 'Nexora Horizon Spatial True Wireless Earbuds',
    slug: 'nexora-horizon-spatial-tw-earbuds',
    description: 'Ultra-low latency lossless audio with dynamic head-tracking spatial audio. IPX7 waterproof rating, wireless Qi charging case with OLED charge indicator.',
    price: '8499.00',
    compareAtPrice: '10999.00',
    rating: 4.8,
    reviewCount: 24,
    inStock: true,
    totalStock: 115,
    category: { id: 'cat-1', name: 'Audio & Acoustics', slug: 'audio-acoustics' },
    images: [
      { id: 'img-3', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80', alt: 'True Wireless Earbuds Case', sortOrder: 0 },
      { id: 'img-4', url: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80', alt: 'Single Earbud', sortOrder: 1 },
    ],
    variants: [
      { id: 'v-3', sku: 'NEX-TWS-WHT', attributes: { color: 'Glacier White' }, stockQuantity: 60 },
      { id: 'v-4', sku: 'NEX-TWS-BLK', attributes: { color: 'Midnight Onyx' }, stockQuantity: 55 },
    ],
    reviews: [
      { id: 'r-2', rating: 5, comment: 'Crisp highs and punchy bass. The transparent mode sounds like nothing is in my ears.', customer: { name: 'Rohan Mehra' } },
    ],
  },
  {
    id: 'prod-fallback-3',
    name: 'Apex Horizon Titanium Smartwatch',
    slug: 'apex-horizon-titanium-smartwatch',
    description: 'Grade-5 titanium unibody enclosure with scratch-resistant sapphire crystal glass. Dual-frequency GNSS GPS, continuous ECG and SpO2 sensors, 100m dive-ready water resistance.',
    price: '27499.00',
    compareAtPrice: '31999.00',
    rating: 4.9,
    reviewCount: 19,
    inStock: true,
    totalStock: 43,
    category: { id: 'cat-2', name: 'Smart Wearables', slug: 'smart-wearables' },
    images: [
      { id: 'img-5', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80', alt: 'Apex Titanium Smartwatch Front', sortOrder: 0 },
      { id: 'img-6', url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80', alt: 'Watch on Wrist Profile', sortOrder: 1 },
    ],
    variants: [
      { id: 'v-5', sku: 'NEX-WTCH-44-TI', attributes: { caseSize: '44mm', band: 'Fluorocarbon Sport Band' }, stockQuantity: 28 },
      { id: 'v-6', sku: 'NEX-WTCH-44-LTH', attributes: { caseSize: '44mm', band: 'Horween Italian Leather' }, priceOverride: '29499.00', stockQuantity: 15 },
    ],
    reviews: [
      { id: 'r-3', rating: 5, comment: 'Battery lasts a full two weeks without recharging. Incredible titanium finish.', customer: { name: 'Devina Kapoor' } },
    ],
  },
  {
    id: 'prod-fallback-4',
    name: 'Kinesis Artisan Mechanical Keyboard 75%',
    slug: 'kinesis-artisan-mechanical-keyboard-75',
    description: 'Gasket-mounted CNC aluminum keyboard with hot-swappable tactile switches, pre-lubed gold-plated screw-in stabilizers, south-facing per-key RGB, and PBT double-shot keycaps.',
    price: '11999.00',
    compareAtPrice: '14499.00',
    rating: 4.9,
    reviewCount: 42,
    inStock: true,
    totalStock: 75,
    category: { id: 'cat-3', name: 'Desk & Ergonomics', slug: 'desk-ergonomics' },
    images: [
      { id: 'img-7', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80', alt: '75% Mechanical Keyboard Angle', sortOrder: 0 },
      { id: 'img-8', url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80', alt: 'Keycap Details Top View', sortOrder: 1 },
    ],
    variants: [
      { id: 'v-7', sku: 'NEX-KB-TTC', attributes: { switch: 'Tactile Gateron Baby Kangaroo' }, stockQuantity: 40 },
      { id: 'v-8', sku: 'NEX-KB-LIN', attributes: { switch: 'Linear Oil King' }, stockQuantity: 35 },
    ],
    reviews: [
      { id: 'r-4', rating: 5, comment: 'The typing sound is deep and marbly out of the box. Absolutely worth every rupee.', customer: { name: 'Siddharth Rao' } },
    ],
  },
  {
    id: 'prod-fallback-5',
    name: 'Vanguard 26L Weatherproof Commuter Backpack',
    slug: 'vanguard-26l-weatherproof-commuter-backpack',
    description: 'Built for urban commute and global travel with Cordura 840D ballistic nylon and YKK AquaGuard weatherproof zippers. Dedicated padded 16-inch laptop compartment with suspended bottom protection.',
    price: '6499.00',
    compareAtPrice: '7999.00',
    rating: 4.7,
    reviewCount: 31,
    inStock: true,
    totalStock: 82,
    category: { id: 'cat-4', name: 'Travel & Everyday Carry', slug: 'travel-edc' },
    images: [
      { id: 'img-9', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80', alt: 'Vanguard Backpack Standing', sortOrder: 0 },
      { id: 'img-10', url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80', alt: 'Backpack Internal Compartments', sortOrder: 1 },
    ],
    variants: [
      { id: 'v-9', sku: 'NEX-BP-BLK', attributes: { color: 'Stealth Black' }, stockQuantity: 50 },
      { id: 'v-10', sku: 'NEX-BP-OLV', attributes: { color: 'Tactical Olive' }, stockQuantity: 32 },
    ],
    reviews: [
      { id: 'r-5', rating: 5, comment: 'Rain rolled right off the bag in Mumbai monsoon. My MacBook was 100% dry.', customer: { name: 'Vikram Joshi' } },
    ],
  },
  {
    id: 'prod-fallback-6',
    name: 'Equinox Technical Merino Wool Hoodie',
    slug: 'equinox-technical-merino-wool-hoodie',
    description: 'Crafted from 100% Australian 260gsm ultrafine merino wool blended with elastane for natural thermoregulation, odor resistance, and 4-way stretch comfort.',
    price: '4799.00',
    compareAtPrice: '5999.00',
    rating: 4.8,
    reviewCount: 16,
    inStock: true,
    totalStock: 73,
    category: { id: 'cat-5', name: 'Apparel & Performance', slug: 'apparel-performance' },
    images: [
      { id: 'img-11', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80', alt: 'Merino Wool Hoodie Flat Lay', sortOrder: 0 },
      { id: 'img-12', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', alt: 'Fabric Weave Texture', sortOrder: 1 },
    ],
    variants: [
      { id: 'v-11', sku: 'NEX-HD-M-BLK', attributes: { size: 'M', color: 'Deep Navy' }, stockQuantity: 25 },
      { id: 'v-12', sku: 'NEX-HD-L-BLK', attributes: { size: 'L', color: 'Deep Navy' }, stockQuantity: 30 },
      { id: 'v-13', sku: 'NEX-HD-XL-GRY', attributes: { size: 'XL', color: 'Heather Charcoal' }, stockQuantity: 18 },
    ],
    reviews: [
      { id: 'r-6', rating: 5, comment: 'Lightweight yet incredibly warm on morning bike rides.', customer: { name: 'Ananya Roy' } },
    ],
  },
];

export const FALLBACK_CATEGORIES = [
  { id: 'cat-1', name: 'Audio & Acoustics', slug: 'audio-acoustics', productCount: 2, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-2', name: 'Smart Wearables', slug: 'smart-wearables', productCount: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-3', name: 'Desk & Ergonomics', slug: 'desk-ergonomics', productCount: 1, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-4', name: 'Travel & Everyday Carry', slug: 'travel-edc', productCount: 1, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-5', name: 'Apparel & Performance', slug: 'apparel-performance', productCount: 1, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
];

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
          filtered = filtered.filter((p) => p.category.slug === params.category);
        }
        if (params.search) {
          const s = params.search.toLowerCase();
          filtered = filtered.filter(
            (p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s),
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
        }

        return {
          success: true,
          data: filtered,
          meta: {
            total: filtered.length,
            page: params.page || 1,
            limit: params.limit || 12,
            totalPages: 1,
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
