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
  ]);

  const [catAudio, catWearables, catDesk, catTravel, catApparel] = categories;
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
