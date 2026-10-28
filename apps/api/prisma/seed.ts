import { PrismaClient, ProductStatus, Role, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Nexora Commerce database seeding...');

  // 1. Clear existing seed data safely in order of foreign key dependencies
  await prisma.aIConversation.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.review.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleaned existing records.');

  // 2. Create Users (Admin and Demo Customer)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Nexora Admin',
      email: 'admin@nexoracommerce.com',
      emailVerified: true,
      role: Role.ADMIN,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: 'Aryan Sharma',
      email: 'aryan@example.com',
      emailVerified: true,
      role: Role.CUSTOMER,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  });

  const customerProfile = await prisma.customerProfile.create({
    data: {
      authUserId: customerUser.id,
      name: customerUser.name,
      phone: '+91 98765 43210',
    },
  });

  await prisma.address.create({
    data: {
      customerId: customerProfile.id,
      label: 'Home',
      line1: '402, Cyber Heights, Sector 62',
      line2: 'Golf Course Extension Road',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002',
      country: 'India',
      isDefault: true,
    },
  });

  console.log('✓ Seeded Users & Profiles.');

  // 3. Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Audio & Acoustics',
        slug: 'audio-acoustics',
        description: 'Studio-grade spatial headphones, ANC earbuds, and precision sound monitors.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Smart Wearables',
        slug: 'smart-wearables',
        description: 'Next-generation biometric trackers, titanium smartwatches, and focus rings.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Desk & Ergonomics',
        slug: 'desk-ergonomics',
        description: 'Minimalist mechanical keyboards, anodized monitor arms, and ergonomic workstations.',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Travel & Everyday Carry',
        slug: 'travel-edc',
        description: 'Weatherproof ballistic nylon backpacks, magnetic pouches, and urban utility bags.',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Apparel & Performance',
        slug: 'apparel-performance',
        description: 'Technical merino wool tees, breathable water-repellent jackets, and modular gear.',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Smart Home & Tech',
        slug: 'smart-home-tech',
        description: 'Ambient dynamic lighting, smart diffusers, and automated living accessories.',
        image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Photography & Creators',
        slug: 'photography-creator',
        description: 'Rigid carbon fiber tripods, 4K HDR webcams, and motorized phone stabilizers.',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Power & Charging',
        slug: 'power-charging',
        description: '140W multi-port GaN chargers, folding MagSafe travel stands, and laptop power banks.',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Gaming & Precision',
        slug: 'gaming-precision',
        description: 'Ultra-lightweight 4K wireless mice, Cordura hybrid deskpads, and spatial headsets.',
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      },
    }),
  ]);

  const [
    catAudio,
    catWearables,
    catDesk,
    catTravel,
    catApparel,
    catSmartHome,
    catPhotography,
    catPower,
    catGaming,
  ] = categories;
  console.log('✓ Seeded Categories.');

  // 4. Products, Images & Variants
  const productsData = [
    {
      category: catAudio,
      name: 'Nexora Studio Pro Wireless ANC Headphones',
      slug: 'nexora-studio-pro-wireless-anc-headphones',
      description: 'Engineered with 40mm custom beryllium dynamic drivers, hybrid active noise cancellation (up to -42dB), multipoint Bluetooth 5.4, and 50 hours of battery life. Precision aerospace aluminum headband with memory-foam protein leather ear cushions.',
      price: '18999.00',
      compareAtPrice: '22999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80', alt: 'Matte Black Studio Pro Headphones', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80', alt: 'Angle View Ear Cups', sortOrder: 1 },
      ],
      variants: [
        { sku: 'NEX-HP-BLK', attributes: { color: 'Matte Obsidian', finish: 'Anodized' }, stockQuantity: 45 },
        { sku: 'NEX-HP-SLV', attributes: { color: 'Lunar Silver', finish: 'Brushed' }, stockQuantity: 30 },
      ],
    },
    {
      category: catAudio,
      name: 'Nexora Horizon Spatial True Wireless Earbuds',
      slug: 'nexora-horizon-spatial-tw-earbuds',
      description: 'Ultra-low latency lossless audio with dynamic head-tracking spatial audio. IPX7 waterproof rating, wireless Qi charging case with OLED charge indicator, and custom transparency passthrough mode.',
      price: '8499.00',
      compareAtPrice: '10999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80', alt: 'True Wireless Earbuds Case', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80', alt: 'Single Earbud Macro', sortOrder: 1 },
      ],
      variants: [
        { sku: 'NEX-TWS-WHT', attributes: { color: 'Glacier White' }, stockQuantity: 60 },
        { sku: 'NEX-TWS-BLK', attributes: { color: 'Midnight Onyx' }, stockQuantity: 55 },
      ],
    },
    {
      category: catWearables,
      name: 'Apex Horizon Titanium Smartwatch',
      slug: 'apex-horizon-titanium-smartwatch',
      description: 'Grade-5 titanium unibody enclosure with scratch-resistant sapphire crystal glass. Dual-frequency GNSS GPS, continuous ECG and SpO2 sensors, 100m dive-ready water resistance, and 14 days typical battery endurance.',
      price: '27499.00',
      compareAtPrice: '31999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80', alt: 'Apex Titanium Smartwatch Front', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80', alt: 'Watch on Wrist Profile', sortOrder: 1 },
      ],
      variants: [
        { sku: 'NEX-WTCH-44-TI', attributes: { caseSize: '44mm', band: 'Fluorocarbon Sport Band' }, stockQuantity: 28 },
        { sku: 'NEX-WTCH-44-LTH', attributes: { caseSize: '44mm', band: 'Horween Italian Leather' }, priceOverride: '29499.00', stockQuantity: 15 },
      ],
    },
    {
      category: catDesk,
      name: 'Kinesis Artisan Mechanical Keyboard 75%',
      slug: 'kinesis-artisan-mechanical-keyboard-75',
      description: 'Gasket-mounted CNC aluminum keyboard with hot-swappable tactile switches, pre-lubed gold-plated screw-in stabilizers, south-facing per-key RGB, and PBT double-shot keycaps. Tri-mode connectivity (2.4GHz, Bluetooth 5.1, USB-C).',
      price: '11999.00',
      compareAtPrice: '14499.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80', alt: '75% Mechanical Keyboard Angle', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80', alt: 'Keycap Details Top View', sortOrder: 1 },
      ],
      variants: [
        { sku: 'NEX-KB-TTC', attributes: { switch: 'Tactile Gateron Baby Kangaroo', layout: 'ANSI 75%' }, stockQuantity: 40 },
        { sku: 'NEX-KB-LIN', attributes: { switch: 'Linear Oil King', layout: 'ANSI 75%' }, stockQuantity: 35 },
      ],
    },
    {
      category: catTravel,
      name: 'Vanguard 26L Weatherproof Commuter Backpack',
      slug: 'vanguard-26l-weatherproof-commuter-backpack',
      description: 'Built for urban commute and global travel with Cordura 840D ballistic nylon and YKK AquaGuard weatherproof zippers. Dedicated padded 16-inch laptop compartment with suspended bottom protection, magnetic Fidlock buckle, and hidden passport pocket.',
      price: '6499.00',
      compareAtPrice: '7999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80', alt: 'Vanguard Backpack Standing', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80', alt: 'Backpack Internal Compartments', sortOrder: 1 },
      ],
      variants: [
        { sku: 'NEX-BP-BLK', attributes: { capacity: '26L', color: 'Stealth Black' }, stockQuantity: 50 },
        { sku: 'NEX-BP-OLV', attributes: { capacity: '26L', color: 'Tactical Olive' }, stockQuantity: 32 },
      ],
    },
    {
      category: catApparel,
      name: 'Equinox Technical Merino Wool Hoodie',
      slug: 'equinox-technical-merino-wool-hoodie',
      description: 'Crafted from 100% Australian 260gsm ultrafine merino wool blended with elastane for natural thermoregulation, odor resistance, and 4-way stretch comfort. Features thumbhole cuffs and a concealed zipper media pocket.',
      price: '4799.00',
      compareAtPrice: '5999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80', alt: 'Merino Wool Hoodie Flat Lay', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', alt: 'Fabric Weave Texture', sortOrder: 1 },
      ],
      variants: [
        { sku: 'NEX-HD-M-BLK', attributes: { size: 'M', color: 'Deep Navy' }, stockQuantity: 25 },
        { sku: 'NEX-HD-L-BLK', attributes: { size: 'L', color: 'Deep Navy' }, stockQuantity: 30 },
        { sku: 'NEX-HD-XL-GRY', attributes: { size: 'XL', color: 'Heather Charcoal' }, stockQuantity: 18 },
      ],
    },
    // --- 20 NEW PRODUCTS ---
    {
      category: catSmartHome,
      name: 'Aura Horizon Smart Lightbar Pro',
      slug: 'aura-horizon-smart-lightbar-pro',
      description: 'Dynamic dual-zone ambient lighting with 16 million colors, screen mirror sync, and voice control via Apple HomeKit, Google Home, and Alexa. Anti-glare asymmetrical optical design.',
      price: '5999.00',
      compareAtPrice: '7499.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80', alt: 'Smart Lightbar on Desk', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-LIGHT-PRO', attributes: { finish: 'Space Gray Aluminum' }, stockQuantity: 65 },
      ],
    },
    {
      category: catSmartHome,
      name: 'Lumina Minimalist Desk Lamp & Qi Charger',
      slug: 'lumina-minimalist-desk-lamp-charger',
      description: 'Crafted from aircraft-grade anodized aluminum with dual pivot joints. CRI 98 ultra-high color rendering index for eye strain prevention, with integrated 15W MagSafe fast-charging base.',
      price: '3899.00',
      compareAtPrice: '4999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80', alt: 'Minimalist Desk Lamp', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-LMP-SLV', attributes: { color: 'Matte Silver' }, stockQuantity: 28 },
        { sku: 'NEX-LMP-BLK', attributes: { color: 'Stealth Black' }, stockQuantity: 20 },
      ],
    },
    {
      category: catSmartHome,
      name: 'AeroPure Smart Ultrasonic Aroma Diffuser',
      slug: 'aeropure-smart-ultrasonic-aroma-diffuser',
      description: 'Whisper-quiet ultrasonic mist generator with automated scheduling, 450ml capacity water tank for 16-hour continuous diffusion, and gentle amber LED flame simulation.',
      price: '2999.00',
      compareAtPrice: '3999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80', alt: 'Aroma Diffuser with Mist', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-DIF-WHT', attributes: { color: 'Ceramic White' }, stockQuantity: 32 },
        { sku: 'NEX-DIF-GRY', attributes: { color: 'Charcoal Stone' }, stockQuantity: 20 },
      ],
    },
    {
      category: catPhotography,
      name: 'Apex Ultra-Rigid Carbon Fiber Travel Tripod',
      slug: 'apex-ultra-rigid-carbon-fiber-travel-tripod',
      description: '8-layer high-modulus carbon fiber construction with CNC machined Arca-Swiss fluid ball head. Supports up to 14kg camera rigs while weighing only 1.2kg and folding to 38cm.',
      price: '14999.00',
      compareAtPrice: '18999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80', alt: 'Carbon Fiber Tripod Standing', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-TRIPOD-CF', attributes: { material: 'Toray 8X Carbon Fiber' }, stockQuantity: 35 },
      ],
    },
    {
      category: catPhotography,
      name: 'OpticPro 4K HDR Creator Webcam',
      slug: 'opticpro-4k-hdr-creator-webcam',
      description: 'Equipped with a 1/2.8-inch Sony Starvis 2 image sensor, 4K at 60fps streaming, hardware phase-detection autofocus, dual studio beamforming microphones, and magnetic privacy cover.',
      price: '9499.00',
      compareAtPrice: '11999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=1000&q=80', alt: '4K Webcam on Monitor', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-CAM-4K', attributes: { color: 'Matte Obsidian' }, stockQuantity: 60 },
      ],
    },
    {
      category: catPhotography,
      name: 'GimbalFlow 3-Axis Motorized Smartphone Gimbal',
      slug: 'gimbalflow-3-axis-motorized-smartphone-gimbal',
      description: 'Brushless motor 3-axis stabilization with AI visual object tracking, built-in retractable selfie extension rod, magnetic fill light, and 14 hours battery capacity.',
      price: '7999.00',
      compareAtPrice: '9999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?auto=format&fit=crop&w=1000&q=80', alt: 'Handheld Gimbal Stabilizer', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-GIMBAL-GRY', attributes: { color: 'Lunar Gray' }, stockQuantity: 40 },
      ],
    },
    {
      category: catPower,
      name: 'Voltaic 140W Multi-Port GaN Fast Charger',
      slug: 'voltaic-140w-multi-port-gan-fast-charger',
      description: 'Next-gen Gallium Nitride (GaN III) fast charger with 3x USB-C PD 3.1 ports (capable of full 140W MacBook Pro charging) and 1x USB-A port. Compact foldable travel prongs.',
      price: '4499.00',
      compareAtPrice: '5499.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80', alt: 'GaN Power Brick', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-GAN-140-BLK', attributes: { color: 'Midnight Black' }, stockQuantity: 65 },
        { sku: 'NEX-GAN-140-WHT', attributes: { color: 'Pure White' }, stockQuantity: 45 },
      ],
    },
    {
      category: catPower,
      name: 'MagFold 3-in-1 Magnetic Travel Charging Stand',
      slug: 'magfold-3-in-1-magnetic-travel-charging-stand',
      description: 'Precision milled aluminum folding charging station. Powers your iPhone (15W MagSafe), Apple Watch (Fast Charge), and AirPods simultaneously. Folds completely flat for travel.',
      price: '3799.00',
      compareAtPrice: '4699.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=1000&q=80', alt: '3-in-1 Wireless Stand', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-MAG-STAND', attributes: { finish: 'Space Gray' }, stockQuantity: 85 },
      ],
    },
    {
      category: catPower,
      name: 'Titanium Armor 25,000mAh Laptop Power Bank',
      slug: 'titanium-armor-25000mah-laptop-power-bank',
      description: 'Airline approved 99.9Wh flight-ready power bank with dual 100W Power Delivery output, smart TFT digital readout displaying real-time wattage and battery health, wrapped in anodized aluminum.',
      price: '6999.00',
      compareAtPrice: '8999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1609592424364-88981f14ecdf?auto=format&fit=crop&w=1000&q=80', alt: 'High Capacity Power Bank', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-PB-25K', attributes: { capacity: '25,000mAh (100W PD)' }, stockQuantity: 50 },
      ],
    },
    {
      category: catPower,
      name: 'Kevlar Ultra-Durable 240W Braided Cable (2m)',
      slug: 'kevlar-ultra-durable-240w-braided-cable-2m',
      description: 'Reinforced with genuine DuPont Kevlar fibers, tested to withstand 35,000+ bends. Supports USB-PD 3.1 up to 240W power delivery with gold-plated corrosion resistant USB-C terminals.',
      price: '1499.00',
      compareAtPrice: '1999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1595079672139-5470805c567a?auto=format&fit=crop&w=1000&q=80', alt: 'Braided Type-C Cable', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-CBL-2M-BLK', attributes: { length: '2 Meters', color: 'Tactical Black' }, stockQuantity: 90 },
      ],
    },
    {
      category: catGaming,
      name: 'ViperStrike 4K Wireless Ultra-Light Gaming Mouse',
      slug: 'viperstrike-4k-wireless-ultra-light-gaming-mouse',
      description: 'Weighs only 49 grams with a magnesium composite internal structure. PixArt PAW3395 26,000 DPI optical sensor, Nordic 52840 MCU with 4,000Hz hyper-polling rate and zero smoothing.',
      price: '5499.00',
      compareAtPrice: '6999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80', alt: 'Wireless Gaming Mouse', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-MSE-BLK', attributes: { color: 'Matte Black' }, stockQuantity: 35 },
      ],
    },
    {
      category: catGaming,
      name: 'Velocity Hybrid Cordura Gaming Mousepad XL',
      slug: 'velocity-hybrid-cordura-gaming-mousepad-xl',
      description: 'Massive 900x400x4mm deskpad with waterproof Cordura military-grade woven textile. Micro-stitched anti-fray border with non-slip natural tree rubber backing for supreme cursor precision.',
      price: '1999.00',
      compareAtPrice: '2699.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1616400619175-5beda3a17896?auto=format&fit=crop&w=1000&q=80', alt: 'XL Deskpad on Setup', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-PAD-XL-BLK', attributes: { size: '900x400mm', color: 'Stealth Black' }, stockQuantity: 90 },
      ],
    },
    {
      category: catGaming,
      name: 'Apex Phantom Spatial Wireless Gaming Headset',
      slug: 'apex-phantom-spatial-wireless-gaming-headset',
      description: 'Lossless 2.4GHz ultra-low latency wireless + Bluetooth 5.3 multipoint. Custom 50mm neodymium acoustic drivers with DTS Headphone:X v2.0 7.1 spatial surround and memory foam cooling gel pads.',
      price: '8999.00',
      compareAtPrice: '11499.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80', alt: 'Wireless Gaming Headset', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-HS-WRL', attributes: { color: 'Graphite Black' }, stockQuantity: 48 },
      ],
    },
    {
      category: catAudio,
      name: 'SoundWave Studio Audiophile Reference Monitors (Pair)',
      slug: 'soundwave-studio-audiophile-reference-monitors',
      description: 'Active bi-amplified studio monitor pair with 5.25-inch woven Kevlar low-frequency transducers, 1-inch low-mass silk dome tweeters, acoustic room compensation EQ, and balanced XLR/TRS inputs.',
      price: '22999.00',
      compareAtPrice: '27999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80', alt: 'Studio Monitor Speakers', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-SPK-5IN', attributes: { configuration: 'Active Pair (5.25-inch)' }, stockQuantity: 30 },
      ],
    },
    {
      category: catAudio,
      name: 'RetroSound Hi-Fi Bluetooth Tube Amplifier',
      slug: 'retrosound-hi-fi-bluetooth-tube-amplifier',
      description: 'Vintage brushed copper chassis with twin 6N1 vacuum pre-amp tubes delivering lush acoustic warmth. Supports Qualcomm aptX HD 24-bit wireless streaming and optical DAC input.',
      price: '12499.00',
      compareAtPrice: '15999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1000&q=80', alt: 'Vacuum Tube Amplifier', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-AMP-COP', attributes: { finish: 'Brushed Copper & Walnut' }, stockQuantity: 25 },
      ],
    },
    {
      category: catWearables,
      name: 'Nexora BioRing Sleep & Recovery Smart Ring',
      slug: 'nexora-bioring-sleep-recovery-smart-ring',
      description: 'Forged from medical-grade hypoallergenic titanium. Seamlessly monitors sleep stages, Heart Rate Variability (HRV), and body temperature with 7-day battery life and zero mandatory subscriptions.',
      price: '16499.00',
      compareAtPrice: '19999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80', alt: 'Titanium Smart Ring on Finger', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-RNG-BLK-9', attributes: { size: 'Size 9', finish: 'Stealth Matte Black' }, stockQuantity: 25 },
      ],
    },
    {
      category: catWearables,
      name: 'PulseFit Ultra Active Smartwatch 46mm',
      slug: 'pulsefit-ultra-active-smartwatch-46mm',
      description: 'Durable military MIL-STD-810H certified outdoor smartwatch with 2,000 nit sunlight readable AMOLED screen, offline topographical maps, dual-frequency GPS, and 21-day endurance battery.',
      price: '13999.00',
      compareAtPrice: '16999.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80', alt: 'Active GPS Smartwatch', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-PULSE-46', attributes: { case: '46mm Dark Titanium', band: 'Orange Trail Loop' }, stockQuantity: 45 },
      ],
    },
    {
      category: catDesk,
      name: 'ErgoLift Single Monitor Gas Spring Arm',
      slug: 'ergolift-single-monitor-gas-spring-arm',
      description: 'Heavy-duty automotive grade gas spring monitor mount supporting up to 35-inch monitors (up to 12kg). 360-degree rotation, tilt/swivel, integrated internal cable raceways, clamp or grommet mount.',
      price: '4999.00',
      compareAtPrice: '6499.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80', alt: 'Monitor Arm Setup', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-ARM-SNGL', attributes: { finish: 'Matte Black Aluminum' }, stockQuantity: 70 },
      ],
    },
    {
      category: catDesk,
      name: 'Artisan Full-Grain Leather Desk Mat (90x45cm)',
      slug: 'artisan-full-grain-leather-desk-mat',
      description: 'Handcrafted from 2mm vegetable-tanned full-grain leather that develops a rich natural patina over time. Smooth mouse tracking surface with anti-slip suede leather underside.',
      price: '2799.00',
      compareAtPrice: '3499.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?auto=format&fit=crop&w=1000&q=80', alt: 'Leather Desk Pad', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-LTHR-BRN', attributes: { color: 'Cognac Saddle Brown' }, stockQuantity: 30 },
      ],
    },
    {
      category: catTravel,
      name: 'TechOrganizer Modular Cable & Accessory Case',
      slug: 'techorganizer-modular-cable-accessory-case',
      description: 'Weather-resistant Cordura tech pouch with origami-style expandable internal accordion dividers. Dual zip opening, dedicated slots for power banks, cables, SSDs, and stylus pens.',
      price: '1899.00',
      compareAtPrice: '2499.00',
      images: [
        { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80', alt: 'Tech Pouch Open', sortOrder: 0 },
      ],
      variants: [
        { sku: 'NEX-POUCH-BLK', attributes: { color: 'Charcoal Black' }, stockQuantity: 50 },
      ],
    },
  ];

  for (const item of productsData) {
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        compareAtPrice: item.compareAtPrice,
        status: ProductStatus.ACTIVE,
        categoryId: item.category.id,
        images: {
          create: item.images,
        },
        variants: {
          create: item.variants.map((v) => ({
            sku: v.sku,
            attributes: v.attributes,
            priceOverride: v.priceOverride || null,
            stockQuantity: v.stockQuantity,
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    // Create realistic initial reviews for the product
    await prisma.review.create({
      data: {
        customerId: customerProfile.id,
        productId: product.id,
        rating: 5,
        comment: `Incredible build quality and attention to detail. Fast delivery and exceeded my expectations!`,
      },
    });
  }

  console.log(`✓ Seeded ${productsData.length} Products with Variants and Reviews.`);

  // 5. Create Promotional Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'NEXORA10',
        discountType: DiscountType.PERCENTAGE,
        value: '10.00',
        minOrderAmount: '1000.00',
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
        usageLimit: 1000,
        active: true,
      },
      {
        code: 'WELCOME500',
        discountType: DiscountType.FIXED_AMOUNT,
        value: '500.00',
        minOrderAmount: '2500.00',
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        usageLimit: 500,
        active: true,
      },
    ],
  });

  console.log('✓ Seeded Coupons: NEXORA10, WELCOME500.');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
