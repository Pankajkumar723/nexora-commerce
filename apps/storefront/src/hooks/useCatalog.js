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
  // --- 20 NEW PRODUCTS ---
  {
    id: 'prod-fallback-7',
    name: 'Aura Horizon Smart Lightbar Pro',
    slug: 'aura-horizon-smart-lightbar-pro',
    description: 'Dynamic dual-zone ambient lighting with 16 million colors, screen mirror sync, and voice control via Apple HomeKit, Google Home, and Alexa. Anti-glare asymmetrical optical design.',
    price: '5999.00',
    compareAtPrice: '7499.00',
    rating: 4.9,
    reviewCount: 54,
    inStock: true,
    totalStock: 65,
    category: { id: 'cat-6', name: 'Smart Home & Tech', slug: 'smart-home-tech' },
    images: [
      { id: 'img-13', url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80', alt: 'Smart Lightbar on Desk', sortOrder: 0 },
      { id: 'img-14', url: 'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?auto=format&fit=crop&w=1000&q=80', alt: 'Ambient RGB Glow', sortOrder: 1 },
    ],
    variants: [
      { id: 'v-14', sku: 'NEX-LIGHT-PRO', attributes: { finish: 'Space Gray Aluminum' }, stockQuantity: 65 },
    ],
    reviews: [
      { id: 'r-7', rating: 5, comment: 'Transforms my whole room at night. The screen sync is zero-lag.', customer: { name: 'Kunal Verma' } },
    ],
  },
  {
    id: 'prod-fallback-8',
    name: 'Lumina Minimalist Desk Lamp & Qi Charger',
    slug: 'lumina-minimalist-desk-lamp-charger',
    description: 'Crafted from aircraft-grade anodized aluminum with dual pivot joints. CRI 98 ultra-high color rendering index for eye strain prevention, with integrated 15W MagSafe fast-charging base.',
    price: '3899.00',
    compareAtPrice: '4999.00',
    rating: 4.8,
    reviewCount: 29,
    inStock: true,
    totalStock: 48,
    category: { id: 'cat-6', name: 'Smart Home & Tech', slug: 'smart-home-tech' },
    images: [
      { id: 'img-15', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80', alt: 'Minimalist Desk Lamp', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-15', sku: 'NEX-LMP-SLV', attributes: { color: 'Matte Silver' }, stockQuantity: 28 },
      { id: 'v-16', sku: 'NEX-LMP-BLK', attributes: { color: 'Stealth Black' }, stockQuantity: 20 },
    ],
    reviews: [
      { id: 'r-8', rating: 5, comment: 'The magnetic base charges my iPhone while working. Excellent build quality.', customer: { name: 'Rashmi Deshmukh' } },
    ],
  },
  {
    id: 'prod-fallback-9',
    name: 'AeroPure Smart Ultrasonic Aroma Diffuser',
    slug: 'aeropure-smart-ultrasonic-aroma-diffuser',
    description: 'Whisper-quiet ultrasonic mist generator with automated scheduling, 450ml capacity water tank for 16-hour continuous diffusion, and gentle amber LED flame simulation.',
    price: '2999.00',
    compareAtPrice: '3999.00',
    rating: 4.7,
    reviewCount: 38,
    inStock: true,
    totalStock: 52,
    category: { id: 'cat-6', name: 'Smart Home & Tech', slug: 'smart-home-tech' },
    images: [
      { id: 'img-17', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80', alt: 'Aroma Diffuser with Mist', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-17', sku: 'NEX-DIF-WHT', attributes: { color: 'Ceramic White' }, stockQuantity: 32 },
      { id: 'v-18', sku: 'NEX-DIF-GRY', attributes: { color: 'Charcoal Stone' }, stockQuantity: 20 },
    ],
    reviews: [
      { id: 'r-9', rating: 5, comment: 'So calming in the home office. Beautiful warm light effect.', customer: { name: 'Pooja Nair' } },
    ],
  },
  {
    id: 'prod-fallback-10',
    name: 'Apex Ultra-Rigid Carbon Fiber Travel Tripod',
    slug: 'apex-ultra-rigid-carbon-fiber-travel-tripod',
    description: '8-layer high-modulus carbon fiber construction with CNC machined Arca-Swiss fluid ball head. Supports up to 14kg camera rigs while weighing only 1.2kg and folding to 38cm.',
    price: '14999.00',
    compareAtPrice: '18999.00',
    rating: 4.9,
    reviewCount: 47,
    inStock: true,
    totalStock: 35,
    category: { id: 'cat-7', name: 'Photography & Creators', slug: 'photography-creator' },
    images: [
      { id: 'img-19', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80', alt: 'Carbon Fiber Tripod Standing', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-19', sku: 'NEX-TRIPOD-CF', attributes: { material: 'Toray 8X Carbon Fiber' }, stockQuantity: 35 },
    ],
    reviews: [
      { id: 'r-10', rating: 5, comment: 'Holds my full-frame camera with 70-200mm lens with zero flex in high winds.', customer: { name: 'Gautam Singhania' } },
    ],
  },
  {
    id: 'prod-fallback-11',
    name: 'OpticPro 4K HDR Creator Webcam',
    slug: 'opticpro-4k-hdr-creator-webcam',
    description: 'Equipped with a 1/2.8-inch Sony Starvis 2 image sensor, 4K at 60fps streaming, hardware phase-detection autofocus, dual studio beamforming microphones, and magnetic privacy cover.',
    price: '9499.00',
    compareAtPrice: '11999.00',
    rating: 4.8,
    reviewCount: 36,
    inStock: true,
    totalStock: 60,
    category: { id: 'cat-7', name: 'Photography & Creators', slug: 'photography-creator' },
    images: [
      { id: 'img-21', url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=1000&q=80', alt: '4K Webcam on Monitor', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-21', sku: 'NEX-CAM-4K', attributes: { color: 'Matte Obsidian' }, stockQuantity: 60 },
    ],
    reviews: [
      { id: 'r-11', rating: 5, comment: 'Image quality is practically DSLR-level in video calls.', customer: { name: 'Nikhil Saxena' } },
    ],
  },
  {
    id: 'prod-fallback-12',
    name: 'GimbalFlow 3-Axis Motorized Smartphone Gimbal',
    slug: 'gimbalflow-3-axis-motorized-smartphone-gimbal',
    description: 'Brushless motor 3-axis stabilization with AI visual object tracking, built-in retractable selfie extension rod, magnetic fill light, and 14 hours battery capacity.',
    price: '7999.00',
    compareAtPrice: '9999.00',
    rating: 4.7,
    reviewCount: 22,
    inStock: true,
    totalStock: 40,
    category: { id: 'cat-7', name: 'Photography & Creators', slug: 'photography-creator' },
    images: [
      { id: 'img-23', url: 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?auto=format&fit=crop&w=1000&q=80', alt: 'Handheld Gimbal Stabilizer', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-23', sku: 'NEX-GIMBAL-GRY', attributes: { color: 'Lunar Gray' }, stockQuantity: 40 },
    ],
    reviews: [
      { id: 'r-12', rating: 5, comment: 'Buttery smooth video while running or walking down stairs.', customer: { name: 'Aditya Sen' } },
    ],
  },
  {
    id: 'prod-fallback-13',
    name: 'Voltaic 140W Multi-Port GaN Fast Charger',
    slug: 'voltaic-140w-multi-port-gan-fast-charger',
    description: 'Next-gen Gallium Nitride (GaN III) fast charger with 3x USB-C PD 3.1 ports (capable of full 140W MacBook Pro charging) and 1x USB-A port. Compact foldable travel prongs.',
    price: '4499.00',
    compareAtPrice: '5499.00',
    rating: 4.9,
    reviewCount: 68,
    inStock: true,
    totalStock: 110,
    category: { id: 'cat-8', name: 'Power & Charging', slug: 'power-charging' },
    images: [
      { id: 'img-25', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80', alt: 'GaN Power Brick', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-25', sku: 'NEX-GAN-140-BLK', attributes: { color: 'Midnight Black' }, stockQuantity: 65 },
      { id: 'v-26', sku: 'NEX-GAN-140-WHT', attributes: { color: 'Pure White' }, stockQuantity: 45 },
    ],
    reviews: [
      { id: 'r-13', rating: 5, comment: 'Charges my laptop, iPad, and phone simultaneously with zero heat.', customer: { name: 'Deepak Chawla' } },
    ],
  },
  {
    id: 'prod-fallback-14',
    name: 'MagFold 3-in-1 Magnetic Travel Charging Stand',
    slug: 'magfold-3-in-1-magnetic-travel-charging-stand',
    description: 'Precision milled aluminum folding charging station. Powers your iPhone (15W MagSafe), Apple Watch (Fast Charge), and AirPods simultaneously. Folds completely flat for travel.',
    price: '3799.00',
    compareAtPrice: '4699.00',
    rating: 4.8,
    reviewCount: 51,
    inStock: true,
    totalStock: 85,
    category: { id: 'cat-8', name: 'Power & Charging', slug: 'power-charging' },
    images: [
      { id: 'img-27', url: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=1000&q=80', alt: '3-in-1 Wireless Stand', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-27', sku: 'NEX-MAG-STAND', attributes: { finish: 'Space Gray' }, stockQuantity: 85 },
    ],
    reviews: [
      { id: 'r-14', rating: 5, comment: 'Best bedside charging stand I have owned. The magnets are super strong.', customer: { name: 'Tarun Reddy' } },
    ],
  },
  {
    id: 'prod-fallback-15',
    name: 'Titanium Armor 25,000mAh Laptop Power Bank',
    slug: 'titanium-armor-25000mah-laptop-power-bank',
    description: 'Airline approved 99.9Wh flight-ready power bank with dual 100W Power Delivery output, smart TFT digital readout displaying real-time wattage and battery health, wrapped in anodized aluminum.',
    price: '6999.00',
    compareAtPrice: '8999.00',
    rating: 4.9,
    reviewCount: 43,
    inStock: true,
    totalStock: 50,
    category: { id: 'cat-8', name: 'Power & Charging', slug: 'power-charging' },
    images: [
      { id: 'img-29', url: 'https://images.unsplash.com/photo-1609592424364-88981f14ecdf?auto=format&fit=crop&w=1000&q=80', alt: 'High Capacity Power Bank', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-29', sku: 'NEX-PB-25K', attributes: { capacity: '25,000mAh (100W PD)' }, stockQuantity: 50 },
    ],
    reviews: [
      { id: 'r-15', rating: 5, comment: 'Saved me during long international flights. Fully charges my Dell XPS in 50 mins.', customer: { name: 'Sanjay Malhotra' } },
    ],
  },
  {
    id: 'prod-fallback-16',
    name: 'Kevlar Ultra-Durable 240W Braided Cable (2m)',
    slug: 'kevlar-ultra-durable-240w-braided-cable-2m',
    description: 'Reinforced with genuine DuPont Kevlar fibers, tested to withstand 35,000+ bends. Supports USB-PD 3.1 up to 240W power delivery with gold-plated corrosion resistant USB-C terminals.',
    price: '1499.00',
    compareAtPrice: '1999.00',
    rating: 4.9,
    reviewCount: 79,
    inStock: true,
    totalStock: 140,
    category: { id: 'cat-8', name: 'Power & Charging', slug: 'power-charging' },
    images: [
      { id: 'img-31', url: 'https://images.unsplash.com/photo-1595079672139-5470805c567a?auto=format&fit=crop&w=1000&q=80', alt: 'Braided Type-C Cable', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-31', sku: 'NEX-CBL-2M-BLK', attributes: { length: '2 Meters', color: 'Tactical Black' }, stockQuantity: 90 },
      { id: 'v-32', sku: 'NEX-CBL-2M-GRY', attributes: { length: '2 Meters', color: 'Space Silver' }, stockQuantity: 50 },
    ],
    reviews: [
      { id: 'r-16', rating: 5, comment: 'Indestructible cable. Super thick shielding and flexible.', customer: { name: 'Karthik Balan' } },
    ],
  },
  {
    id: 'prod-fallback-17',
    name: 'ViperStrike 4K Wireless Ultra-Light Gaming Mouse',
    slug: 'viperstrike-4k-wireless-ultra-light-gaming-mouse',
    description: 'Weighs only 49 grams with a magnesium composite internal structure. PixArt PAW3395 26,000 DPI optical sensor, Nordic 52840 MCU with 4,000Hz hyper-polling rate and zero smoothing.',
    price: '5499.00',
    compareAtPrice: '6999.00',
    rating: 4.9,
    reviewCount: 62,
    inStock: true,
    totalStock: 65,
    category: { id: 'cat-9', name: 'Gaming & Precision', slug: 'gaming-precision' },
    images: [
      { id: 'img-33', url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80', alt: 'Wireless Gaming Mouse', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-33', sku: 'NEX-MSE-BLK', attributes: { color: 'Matte Black' }, stockQuantity: 35 },
      { id: 'v-34', sku: 'NEX-MSE-WHT', attributes: { color: 'Ghost White' }, stockQuantity: 30 },
    ],
    reviews: [
      { id: 'r-17', rating: 5, comment: 'Aim tracking feels weightless. 4000Hz polling rate is noticeably responsive.', customer: { name: 'Akash Rawat' } },
    ],
  },
  {
    id: 'prod-fallback-18',
    name: 'Velocity Hybrid Cordura Gaming Mousepad XL',
    slug: 'velocity-hybrid-cordura-gaming-mousepad-xl',
    description: 'Massive 900x400x4mm deskpad with waterproof Cordura military-grade woven textile. Micro-stitched anti-fray border with non-slip natural tree rubber backing for supreme cursor precision.',
    price: '1999.00',
    compareAtPrice: '2699.00',
    rating: 4.8,
    reviewCount: 37,
    inStock: true,
    totalStock: 90,
    category: { id: 'cat-9', name: 'Gaming & Precision', slug: 'gaming-precision' },
    images: [
      { id: 'img-35', url: 'https://images.unsplash.com/photo-1616400619175-5beda3a17896?auto=format&fit=crop&w=1000&q=80', alt: 'XL Deskpad on Setup', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-35', sku: 'NEX-PAD-XL-BLK', attributes: { size: '900x400mm', color: 'Stealth Black' }, stockQuantity: 90 },
    ],
    reviews: [
      { id: 'r-18', rating: 5, comment: 'Spilled coffee just wiped right off with a napkin. Perfect speed and control balance.', customer: { name: 'Mohit Bhatia' } },
    ],
  },
  {
    id: 'prod-fallback-19',
    name: 'Apex Phantom Spatial Wireless Gaming Headset',
    slug: 'apex-phantom-spatial-wireless-gaming-headset',
    description: 'Lossless 2.4GHz ultra-low latency wireless + Bluetooth 5.3 multipoint. Custom 50mm neodymium acoustic drivers with DTS Headphone:X v2.0 7.1 spatial surround and memory foam cooling gel pads.',
    price: '8999.00',
    compareAtPrice: '11499.00',
    rating: 4.8,
    reviewCount: 44,
    inStock: true,
    totalStock: 48,
    category: { id: 'cat-9', name: 'Gaming & Precision', slug: 'gaming-precision' },
    images: [
      { id: 'img-37', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80', alt: 'Wireless Gaming Headset', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-37', sku: 'NEX-HS-WRL', attributes: { color: 'Graphite Black' }, stockQuantity: 48 },
    ],
    reviews: [
      { id: 'r-19', rating: 5, comment: 'Directional footstep cues in competitive games are pinpoint accurate.', customer: { name: 'Varun Nair' } },
    ],
  },
  {
    id: 'prod-fallback-20',
    name: 'SoundWave Studio Audiophile Reference Monitors (Pair)',
    slug: 'soundwave-studio-audiophile-reference-monitors',
    description: 'Active bi-amplified studio monitor pair with 5.25-inch woven Kevlar low-frequency transducers, 1-inch low-mass silk dome tweeters, acoustic room compensation EQ, and balanced XLR/TRS inputs.',
    price: '22999.00',
    compareAtPrice: '27999.00',
    rating: 5.0,
    reviewCount: 28,
    inStock: true,
    totalStock: 30,
    category: { id: 'cat-1', name: 'Audio & Acoustics', slug: 'audio-acoustics' },
    images: [
      { id: 'img-39', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80', alt: 'Studio Monitor Speakers', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-39', sku: 'NEX-SPK-5IN', attributes: { configuration: 'Active Pair (5.25-inch)' }, stockQuantity: 30 },
    ],
    reviews: [
      { id: 'r-20', rating: 5, comment: 'Flat, honest frequency response. Crucial for mixing and mastering tracks.', customer: { name: 'Eshaan Merchant' } },
    ],
  },
  {
    id: 'prod-fallback-21',
    name: 'RetroSound Hi-Fi Bluetooth Tube Amplifier',
    slug: 'retrosound-hi-fi-bluetooth-tube-amplifier',
    description: 'Vintage brushed copper chassis with twin 6N1 vacuum pre-amp tubes delivering lush acoustic warmth. Supports Qualcomm aptX HD 24-bit wireless streaming and optical DAC input.',
    price: '12499.00',
    compareAtPrice: '15999.00',
    rating: 4.9,
    reviewCount: 31,
    inStock: true,
    totalStock: 25,
    category: { id: 'cat-1', name: 'Audio & Acoustics', slug: 'audio-acoustics' },
    images: [
      { id: 'img-41', url: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1000&q=80', alt: 'Vacuum Tube Amplifier', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-41', sku: 'NEX-AMP-COP', attributes: { finish: 'Brushed Copper & Walnut' }, stockQuantity: 25 },
    ],
    reviews: [
      { id: 'r-21', rating: 5, comment: 'The tube glow in low light is magical, and vocal clarity is unmatched.', customer: { name: 'Siddharth Rao' } },
    ],
  },
  {
    id: 'prod-fallback-22',
    name: 'Nexora BioRing Sleep & Recovery Smart Ring',
    slug: 'nexora-bioring-sleep-recovery-smart-ring',
    description: 'Forged from medical-grade hypoallergenic titanium. Seamlessly monitors sleep stages, Heart Rate Variability (HRV), and body temperature with 7-day battery life and zero mandatory subscriptions.',
    price: '16499.00',
    compareAtPrice: '19999.00',
    rating: 4.8,
    reviewCount: 39,
    inStock: true,
    totalStock: 50,
    category: { id: 'cat-2', name: 'Smart Wearables', slug: 'smart-wearables' },
    images: [
      { id: 'img-43', url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80', alt: 'Titanium Smart Ring on Finger', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-43', sku: 'NEX-RNG-BLK-9', attributes: { size: 'Size 9', finish: 'Stealth Matte Black' }, stockQuantity: 25 },
      { id: 'v-44', sku: 'NEX-RNG-SLV-10', attributes: { size: 'Size 10', finish: 'Polished Silver' }, stockQuantity: 25 },
    ],
    reviews: [
      { id: 'r-22', rating: 5, comment: 'So much more comfortable to sleep with than a bulky smartwatch.', customer: { name: 'Dr. Neha Sen' } },
    ],
  },
  {
    id: 'prod-fallback-23',
    name: 'PulseFit Ultra Active Smartwatch 46mm',
    slug: 'pulsefit-ultra-active-smartwatch-46mm',
    description: 'Durable military MIL-STD-810H certified outdoor smartwatch with 2,000 nit sunlight readable AMOLED screen, offline topographical maps, dual-frequency GPS, and 21-day endurance battery.',
    price: '13999.00',
    compareAtPrice: '16999.00',
    rating: 4.7,
    reviewCount: 33,
    inStock: true,
    totalStock: 45,
    category: { id: 'cat-2', name: 'Smart Wearables', slug: 'smart-wearables' },
    images: [
      { id: 'img-45', url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80', alt: 'Active GPS Smartwatch', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-45', sku: 'NEX-PULSE-46', attributes: { case: '46mm Dark Titanium', band: 'Orange Trail Loop' }, stockQuantity: 45 },
    ],
    reviews: [
      { id: 'r-23', rating: 5, comment: 'Trail GPS accuracy matched dedicated handheld hiking GPS units.', customer: { name: 'Karan Mehra' } },
    ],
  },
  {
    id: 'prod-fallback-24',
    name: 'ErgoLift Single Monitor Gas Spring Arm',
    slug: 'ergolift-single-monitor-gas-spring-arm',
    description: 'Heavy-duty automotive grade gas spring monitor mount supporting up to 35-inch monitors (up to 12kg). 360-degree rotation, tilt/swivel, integrated internal cable raceways, clamp or grommet mount.',
    price: '4999.00',
    compareAtPrice: '6499.00',
    rating: 4.9,
    reviewCount: 58,
    inStock: true,
    totalStock: 70,
    category: { id: 'cat-3', name: 'Desk & Ergonomics', slug: 'desk-ergonomics' },
    images: [
      { id: 'img-47', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80', alt: 'Monitor Arm Setup', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-47', sku: 'NEX-ARM-SNGL', attributes: { finish: 'Matte Black Aluminum' }, stockQuantity: 70 },
    ],
    reviews: [
      { id: 'r-24', rating: 5, comment: 'Freed up so much room under my 34-inch ultrawide screen. Rock solid.', customer: { name: 'Abhinav Tyagi' } },
    ],
  },
  {
    id: 'prod-fallback-25',
    name: 'Artisan Full-Grain Leather Desk Mat (90x45cm)',
    slug: 'artisan-full-grain-leather-desk-mat',
    description: 'Handcrafted from 2mm vegetable-tanned full-grain leather that develops a rich natural patina over time. Smooth mouse tracking surface with anti-slip suede leather underside.',
    price: '2799.00',
    compareAtPrice: '3499.00',
    rating: 4.9,
    reviewCount: 41,
    inStock: true,
    totalStock: 55,
    category: { id: 'cat-3', name: 'Desk & Ergonomics', slug: 'desk-ergonomics' },
    images: [
      { id: 'img-49', url: 'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?auto=format&fit=crop&w=1000&q=80', alt: 'Leather Desk Pad', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-49', sku: 'NEX-LTHR-BRN', attributes: { color: 'Cognac Saddle Brown' }, stockQuantity: 30 },
      { id: 'v-50', sku: 'NEX-LTHR-BLK', attributes: { color: 'Obsidian Black' }, stockQuantity: 25 },
    ],
    reviews: [
      { id: 'r-25', rating: 5, comment: 'Smells of genuine leather and looks incredible with wooden desks.', customer: { name: 'Raghavan Pillai' } },
    ],
  },
  {
    id: 'prod-fallback-26',
    name: 'TechOrganizer Modular Cable & Accessory Case',
    slug: 'techorganizer-modular-cable-accessory-case',
    description: 'Weather-resistant Cordura tech pouch with origami-style expandable internal accordion dividers. Dual zip opening, dedicated slots for power banks, cables, SSDs, and stylus pens.',
    price: '1899.00',
    compareAtPrice: '2499.00',
    rating: 4.8,
    reviewCount: 52,
    inStock: true,
    totalStock: 80,
    category: { id: 'cat-4', name: 'Travel & Everyday Carry', slug: 'travel-edc' },
    images: [
      { id: 'img-51', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80', alt: 'Tech Pouch Open', sortOrder: 0 },
    ],
    variants: [
      { id: 'v-51', sku: 'NEX-POUCH-BLK', attributes: { color: 'Charcoal Black' }, stockQuantity: 50 },
      { id: 'v-52', sku: 'NEX-POUCH-SGE', attributes: { color: 'Sage Green' }, stockQuantity: 30 },
    ],
    reviews: [
      { id: 'r-26', rating: 5, comment: 'Everything has its own pocket now. Fits easily into any backpack.', customer: { name: 'Divya Khurana' } },
    ],
  },
];

export const FALLBACK_CATEGORIES = [
  { id: 'cat-1', name: 'Audio & Acoustics', slug: 'audio-acoustics', productCount: 4, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-2', name: 'Smart Wearables', slug: 'smart-wearables', productCount: 3, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-3', name: 'Desk & Ergonomics', slug: 'desk-ergonomics', productCount: 3, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-4', name: 'Travel & Everyday Carry', slug: 'travel-edc', productCount: 2, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-5', name: 'Apparel & Performance', slug: 'apparel-performance', productCount: 1, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-6', name: 'Smart Home & Tech', slug: 'smart-home-tech', productCount: 3, image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-7', name: 'Photography & Creators', slug: 'photography-creator', productCount: 3, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-8', name: 'Power & Charging', slug: 'power-charging', productCount: 4, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80' },
  { id: 'cat-9', name: 'Gaming & Precision', slug: 'gaming-precision', productCount: 3, image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80' },
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
