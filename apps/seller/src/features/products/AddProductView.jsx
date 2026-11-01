import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  Sparkles,
  Info,
  Image as ImageIcon,
  DollarSign,
  Package,
  Layers,
  FileText,
  Truck,
  ShieldCheck,
  Search,
  RotateCcw,
  Store,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Eye,
  Percent,
  Check,
  HelpCircle,
  Boxes,
  Zap,
  UploadCloud,
  FolderOpen,
  Camera,
  ImagePlus,
  Link2,
  FolderUp,
} from 'lucide-react';
import { sellerRequest, formatINR } from '../../lib/apiClient';

/**
 * Reads a file from device memory / computer and resizes/compresses it via Canvas to base64 Data URL.
 */
function processImageFile(file, maxDim = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPG, PNG, WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image from device memory.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          name: file.name,
          sizeKb: Math.round((dataUrl.length * 0.75) / 1024),
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Indian Ecommerce Predefined Categories with Subcategories
const CATEGORY_PRESETS = [
  {
    id: 'fashion',
    name: 'Fashion & Clothing',
    subcategories: ['Men T-Shirts & Polos', 'Women Dresses & Kurtis', 'Jeans & Trousers', 'Activewear & Sportswear', 'Ethnic Wear', 'Jackets & Winterwear'],
    hsn: '61091000',
    gst: 12,
    specs: [
      { key: 'Fabric', value: '100% Combed Cotton' },
      { key: 'Fit Type', value: 'Regular Fit' },
      { key: 'Pattern', value: 'Solid' },
      { key: 'Occasion', value: 'Casual / Daily Wear' },
      { key: 'Neck Style', value: 'Crew Neck' },
      { key: 'Sleeve Length', value: 'Short Sleeve' },
      { key: 'Care Instructions', value: 'Machine Wash Cold, Tumble Dry Low' },
    ],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    subcategories: ['Headphones & Earbuds', 'Bluetooth Speakers', 'Smart Watches', 'Power Banks', 'Cables & Chargers', 'Cameras & Accessories'],
    hsn: '85183000',
    gst: 18,
    specs: [
      { key: 'Connectivity Technology', value: 'Bluetooth 5.3 & 3.5mm Aux' },
      { key: 'Battery Life', value: 'Up to 40 Hours Playtime' },
      { key: 'Charging Time', value: '1.5 Hours Fast Charge (Type-C)' },
      { key: 'Noise Cancellation', value: 'Active Noise Cancelling (ANC) up to 35dB' },
      { key: 'Driver Size', value: '40mm Dynamic Neodymium Drivers' },
      { key: 'Frequency Response', value: '20Hz - 20,000Hz' },
      { key: 'Water Resistance', value: 'IPX5 Splash & Sweat Resistant' },
    ],
  },
  {
    id: 'mobiles',
    name: 'Mobiles & Accessories',
    subcategories: ['Smartphones', 'Protective Cases', 'Screen Protectors', 'Fast Chargers', 'Car Mounts', 'OTG Adapters'],
    hsn: '85171300',
    gst: 18,
    specs: [
      { key: 'Compatible Models', value: 'Universal Qi / iPhone 15 / Galaxy S24' },
      { key: 'Output Wattage', value: '25W Fast Wireless' },
      { key: 'Cable Length', value: '1.5 Meters Braided Cable' },
      { key: 'Connector Type', value: 'USB Type-C to Type-C' },
    ],
  },
  {
    id: 'computers',
    name: 'Computers & Accessories',
    subcategories: ['Mechanical Keyboards', 'Gaming Mice', 'USB Hubs & Docks', 'Monitors & Mounts', 'Laptop Sleeves', 'Storage & SSDs'],
    hsn: '84716060',
    gst: 18,
    specs: [
      { key: 'Interface', value: 'USB-C 3.2 Gen 2 / 2.4GHz Wireless' },
      { key: 'Switch Type', value: 'Hot-Swappable Tactile Mechanical' },
      { key: 'Backlighting', value: 'Per-Key RGB with 18 Presets' },
      { key: 'Compatibility', value: 'Windows 11, macOS, Linux' },
    ],
  },
  {
    id: 'home',
    name: 'Home & Kitchen',
    subcategories: ['Cookware Sets', 'Storage Containers', 'Water Bottles & Flasks', 'Kitchen Tools', 'Dinnerware', 'Coffee & Tea Makers'],
    hsn: '73239300',
    gst: 12,
    specs: [
      { key: 'Material', value: 'Food-Grade 304 Stainless Steel' },
      { key: 'Capacity', value: '1000 ml / 1 Liter' },
      { key: 'Thermal Insulation', value: '24 Hours Cold / 12 Hours Hot' },
      { key: 'Dishwasher Safe', value: 'Yes' },
      { key: 'BPA Free', value: '100% Certified BPA & Toxin Free' },
    ],
  },
  {
    id: 'furniture',
    name: 'Furniture & Decor',
    subcategories: ['Ergonomic Chairs', 'Standing Desks', 'Wall Shelves', 'Lamps & Lighting', 'Cushions & Curtains', 'Desk Organizers'],
    hsn: '94033000',
    gst: 18,
    specs: [
      { key: 'Frame Material', value: 'Reinforced Aluminum Alloy & Solid Oak' },
      { key: 'Weight Capacity', value: '150 kg' },
      { key: 'Assembly Required', value: 'Minimal (Tools Included)' },
      { key: 'Warranty Duration', value: '3 Years Structural Warranty' },
    ],
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    subcategories: ['Skincare & Serums', 'Hair Care & Oils', 'Fragrances & Perfumes', 'Grooming Kits', 'Makeup & Cosmetics'],
    hsn: '33049990',
    gst: 18,
    specs: [
      { key: 'Item Volume', value: '50 ml / 1.7 fl. oz' },
      { key: 'Skin Type', value: 'All Skin Types (Sensitive Friendly)' },
      { key: 'Key Ingredients', value: 'Hyaluronic Acid 2%, Vitamin C, Niacinamide' },
      { key: 'Cruelty Free', value: '100% Vegan & PETA Approved' },
      { key: 'Dermatologically Tested', value: 'Yes' },
    ],
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    subcategories: ['Supplements & Vitamins', 'Protein Powders', 'Fitness Bands', 'Ayurvedic Products', 'Pain Relief'],
    hsn: '21069099',
    gst: 18,
    specs: [
      { key: 'Form Factor', value: 'Vegetarian Capsules' },
      { key: 'Dosage', value: '1 Capsule Daily after meals' },
      { key: 'Servings per Container', value: '60 Days Supply' },
      { key: 'FSSAI License', value: 'FSSAI Central Lic No. 10020021000123' },
    ],
  },
];

const SECTIONS = [
  { id: 'sec-basic', label: '1. Basic Information', icon: Info },
  { id: 'sec-images', label: '2. Images & Media', icon: ImageIcon },
  { id: 'sec-pricing', label: '3. Pricing & Margins', icon: DollarSign },
  { id: 'sec-stock', label: '4. Inventory & Stock', icon: Package },
  { id: 'sec-variants', label: '5. Variants & Options', icon: Layers },
  { id: 'sec-specs', label: '6. Specifications', icon: FileText },
  { id: 'sec-shipping', label: '7. Shipping & Packaging', icon: Truck },
  { id: 'sec-tax', label: '8. Tax & Compliance', icon: ShieldCheck },
  { id: 'sec-seo', label: '9. SEO & Search Engine', icon: Search },
  { id: 'sec-warranty', label: '10. Warranty & Returns', icon: RotateCcw },
  { id: 'sec-status', label: '11. Status & Publishing', icon: Zap },
  { id: 'sec-seller', label: '12. Seller & Dispatch Info', icon: Store },
];

export function AddProductView({
  categories = [],
  sellerProfile = null,
  initialData = null,
  onBack,
  onSuccess,
}) {
  const isEdit = Boolean(initialData);

  // Active section scroll tracking
  const [activeSection, setActiveSection] = useState('sec-basic');

  // Form State
  const [formData, setFormData] = useState({
    // 1. Basic Info
    name: initialData?.name || '',
    brand: initialData?.brand || initialData?.metadata?.brand || 'Nexora Prime',
    categoryId: initialData?.categoryId || categories[0]?.id || '',
    subcategory: initialData?.metadata?.subcategory || '',
    sku: initialData?.variants?.[0]?.sku || '',
    modelNumber: initialData?.metadata?.modelNumber || '',
    highlights: initialData?.metadata?.highlights || [
      'Engineered with premium aerospace-grade components',
      'Ultra-efficient energy consumption with intelligent power management',
      'Ergonomic comfort-first design crafted for all-day use',
    ],
    description: initialData?.description || '',

    // 2. Images & Media
    mainImage: initialData?.images?.[0]?.url || '',
    galleryImages:
      initialData?.images?.slice(1).map((img) => img.url) || ['', ''],
    videoUrl: initialData?.metadata?.videoUrl || '',

    // 3. Pricing
    price: initialData?.price ? String(initialData.price) : '2499',
    compareAtPrice: initialData?.compareAtPrice ? String(initialData.compareAtPrice) : '3999',
    costPrice: initialData?.metadata?.pricing?.costPrice || '1400',

    // 4. Inventory / Stock
    stockQuantity: initialData?.variants?.[0]?.stockQuantity ?? 50,
    lowStockThreshold: initialData?.metadata?.inventory?.lowStockThreshold ?? 5,
    moq: initialData?.metadata?.inventory?.moq ?? 1,
    maxOrderLimit: initialData?.metadata?.inventory?.maxOrderLimit ?? 5,
    restockLeadTime: initialData?.metadata?.inventory?.restockLeadTime || '1-2 Business Days',
    warehouseCode: initialData?.metadata?.inventory?.warehouseCode || 'WH-MUMBAI-01',

    // 5. Variants
    hasVariants: Boolean(initialData?.variants && initialData.variants.length > 1),
    variantColors: initialData?.metadata?.variantOptions?.colors || [
      { name: 'Space Gray', hex: '#4B4846' },
      { name: 'Midnight Black', hex: '#1C1C1E' },
    ],
    variantSizes: initialData?.metadata?.variantOptions?.sizes || ['Standard'],
    variantsList:
      initialData?.variants?.map((v) => ({
        id: v.id,
        sku: v.sku,
        color: v.attributes?.color || 'Default',
        size: v.attributes?.size || 'Standard',
        priceOverride: v.priceOverride ? String(v.priceOverride) : '',
        stock: v.stockQuantity ?? 10,
        active: true,
      })) || [],

    // 6. Specifications
    specifications: initialData?.metadata?.specifications || [
      { key: 'Product Type', value: 'High Performance Premium Model' },
      { key: 'Country of Assembly', value: 'India' },
      { key: 'In The Box', value: 'Product Unit, Braided Charging Cable, Quick Start Guide, Warranty Card' },
    ],

    // 7. Shipping Information
    deadWeightKg: initialData?.metadata?.shipping?.deadWeightKg || '0.45',
    lengthCm: initialData?.metadata?.shipping?.lengthCm || '20',
    widthCm: initialData?.metadata?.shipping?.widthCm || '15',
    heightCm: initialData?.metadata?.shipping?.heightCm || '6',
    shippingClass: initialData?.metadata?.shipping?.shippingClass || 'Standard Express (2-4 Days)',
    shippingFee: initialData?.metadata?.shipping?.shippingFee ?? '0',
    isFragile: initialData?.metadata?.shipping?.isFragile || false,
    hasBattery: initialData?.metadata?.shipping?.hasBattery || true,
    isLiquid: initialData?.metadata?.shipping?.isLiquid || false,

    // 8. Tax & Compliance
    hsnCode: initialData?.metadata?.tax?.hsnCode || '85183000',
    gstRate: initialData?.metadata?.tax?.gstRate ?? 18,
    countryOfOrigin: initialData?.metadata?.tax?.countryOfOrigin || 'India',
    manufacturerDetails:
      initialData?.metadata?.tax?.manufacturerDetails ||
      `${sellerProfile?.storeName || 'Nexora Prime Solutions'}, Ind. Area Phase 2, Mumbai 400001`,
    packerDetails:
      initialData?.metadata?.tax?.packerDetails ||
      `${sellerProfile?.storeName || 'Nexora Logistics Hub'}, Mumbai 400001`,
    certifications: initialData?.metadata?.tax?.certifications || 'BIS: R-41012345, CE, RoHS Compliant',

    // 9. SEO
    metaTitle: initialData?.metadata?.seo?.metaTitle || '',
    metaDescription: initialData?.metadata?.seo?.metaDescription || '',
    searchTags: initialData?.metadata?.seo?.searchTags || [
      'premium quality',
      'fast shipping',
      'verified merchant',
      'genuine product',
    ],

    // 10. Warranty & Returns
    warrantyDuration: initialData?.metadata?.warranty?.duration || '1 Year Brand Warranty',
    warrantyType: initialData?.metadata?.warranty?.type || 'Brand Replacement / Service Centre',
    returnWindow: initialData?.metadata?.warranty?.returnWindow || '7-Day Replacement Guarantee',
    returnPolicyTerms:
      initialData?.metadata?.warranty?.terms ||
      'Eligible for free replacement within 7 days of delivery in case of damaged, defective, or incorrect item delivered. Original packaging required.',

    // 11. Status & Publishing
    status: initialData?.status || 'PENDING_APPROVAL',
    visibility: initialData?.metadata?.publishing?.visibility || 'PUBLIC',
    isFeatured: initialData?.metadata?.publishing?.isFeatured || false,

    // 12. Seller Information
    dispatchCity: initialData?.metadata?.seller?.dispatchCity || 'Mumbai, Maharashtra',
    dispatchPincode: initialData?.metadata?.seller?.dispatchPincode || '400001',
    supportEmail:
      initialData?.metadata?.seller?.supportEmail ||
      sellerProfile?.user?.email ||
      'support@nexoracommerce.com',
    supportPhone:
      initialData?.metadata?.seller?.supportPhone ||
      sellerProfile?.phone ||
      '+91 98200 12345',
  });

  // Highlight bullet input
  const [newBullet, setNewBullet] = useState('');
  // Tag input
  const [newTag, setNewTag] = useState('');
  // New Color & Size inputs
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2F6FED');
  const [newSizeName, setNewSizeName] = useState('');

  // Submission & Validation States
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [formError, setFormError] = useState('');

  // Image Upload from Device Memory States & Refs
  const primaryFileInputRef = useRef(null);
  const batchFileInputRef = useRef(null);
  const [primaryImageMode, setPrimaryImageMode] = useState(
    initialData?.images?.[0]?.url?.startsWith('http') ? 'url' : 'memory'
  ); // 'memory' | 'url'
  const [primaryImageMeta, setPrimaryImageMeta] = useState(null);
  const [isDraggingPrimary, setIsDraggingPrimary] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);

  const handlePrimaryFile = async (file) => {
    if (!file) return;
    try {
      setImageProcessing(true);
      const res = await processImageFile(file);
      setFormData((prev) => ({ ...prev, mainImage: res.dataUrl }));
      setPrimaryImageMeta({ name: res.name, sizeKb: res.sizeKb });
      setToastMsg(`Primary photo selected from device memory (${res.sizeKb} KB)`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Error processing selected image');
    } finally {
      setImageProcessing(false);
    }
  };

  const handleBatchGalleryFiles = async (files) => {
    if (!files || files.length === 0) return;
    try {
      setImageProcessing(true);
      const fileArr = Array.from(files).slice(0, 8);
      const results = await Promise.all(fileArr.map((f) => processImageFile(f)));
      const newUrls = results.map((r) => r.dataUrl);

      setFormData((prev) => {
        const existing = prev.galleryImages.filter((u) => u && u.trim().length > 5);
        const combined = [...existing, ...newUrls].slice(0, 8);
        return { ...prev, galleryImages: combined };
      });

      setToastMsg(`Loaded ${results.length} photos from device memory into gallery!`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to process gallery images');
    } finally {
      setImageProcessing(false);
    }
  };

  const handleSingleGalleryFile = async (index, file) => {
    if (!file) return;
    try {
      setImageProcessing(true);
      const res = await processImageFile(file);
      handleUpdateGalleryImage(index, res.dataUrl);
      setToastMsg(`Angle #${index + 2} image loaded from device memory (${res.sizeKb} KB)`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to process image');
    } finally {
      setImageProcessing(false);
    }
  };

  // Live Calculations
  const calculations = useMemo(() => {
    const sp = parseFloat(formData.price) || 0;
    const mrp = parseFloat(formData.compareAtPrice) || 0;
    const cp = parseFloat(formData.costPrice) || 0;

    const discountPercent =
      mrp > sp && mrp > 0 ? Math.round(((mrp - sp) / mrp) * 100) : 0;
    const commissionFee = Math.round(sp * 0.1); // 10% platform commission
    const netPayout = Math.max(0, sp - commissionFee);
    const estimatedProfit = netPayout - cp;
    const marginPercent = sp > 0 ? Math.round((estimatedProfit / sp) * 100) : 0;

    // Volumetric Weight: (L * W * H in cm) / 5000
    const l = parseFloat(formData.lengthCm) || 0;
    const w = parseFloat(formData.widthCm) || 0;
    const h = parseFloat(formData.heightCm) || 0;
    const volWeight = (l * w * h) / 5000;
    const deadWeight = parseFloat(formData.deadWeightKg) || 0;
    const billableWeight = Math.max(deadWeight, volWeight).toFixed(2);

    return {
      discountPercent,
      commissionFee,
      netPayout,
      estimatedProfit,
      marginPercent,
      volWeight: volWeight.toFixed(2),
      billableWeight,
    };
  }, [
    formData.price,
    formData.compareAtPrice,
    formData.costPrice,
    formData.lengthCm,
    formData.widthCm,
    formData.heightCm,
    formData.deadWeightKg,
  ]);

  // Form completion progress
  const completionPercentage = useMemo(() => {
    let score = 0;
    const total = 10;
    if (formData.name.trim().length > 3) score += 1;
    if (formData.brand.trim()) score += 1;
    if (formData.categoryId) score += 1;
    if (formData.description.trim().length > 10) score += 1;
    if (formData.mainImage.trim()) score += 1;
    if (parseFloat(formData.price) > 0) score += 1;
    if (formData.sku.trim()) score += 1;
    if (formData.specifications.length >= 2) score += 1;
    if (formData.hsnCode.trim()) score += 1;
    if (formData.deadWeightKg) score += 1;
    return Math.round((score / total) * 100);
  }, [formData]);

  // Auto-generate SKU if blank
  useEffect(() => {
    if (!formData.sku && formData.name) {
      const cleanName = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setFormData((prev) => ({
        ...prev,
        sku: `${cleanName || 'NX'}-${randomSuffix}`,
      }));
    }
  }, [formData.name]);

  // Load category presets
  const handleApplyPreset = (presetId) => {
    const preset = CATEGORY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setFormData((prev) => ({
      ...prev,
      subcategory: preset.subcategories[0],
      hsnCode: preset.hsn,
      gstRate: preset.gst,
      specifications: [...preset.specs],
    }));
    setToastMsg(`Loaded "${preset.name}" preset specifications & HSN`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Generate Variant Matrix
  const handleGenerateMatrix = () => {
    const list = [];
    const baseSku = formData.sku || 'PROD';
    formData.variantColors.forEach((color) => {
      formData.variantSizes.forEach((size) => {
        const colorCode = color.name.substring(0, 3).toUpperCase();
        const sizeCode = size.substring(0, 3).toUpperCase();
        list.push({
          sku: `${baseSku}-${colorCode}-${sizeCode}`,
          color: color.name,
          colorHex: color.hex,
          size,
          priceOverride: '',
          stock: 20,
          active: true,
        });
      });
    });
    setFormData((prev) => ({ ...prev, variantsList: list, hasVariants: true }));
    setToastMsg(`Generated ${list.length} product variants matrix`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Add Feature Bullet
  const handleAddBullet = () => {
    if (!newBullet.trim()) return;
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, newBullet.trim()],
    }));
    setNewBullet('');
  };

  // Remove Feature Bullet
  const handleRemoveBullet = (index) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  // Add Search Tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (!formData.searchTags.includes(newTag.trim().toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        searchTags: [...prev.searchTags, newTag.trim().toLowerCase()],
      }));
    }
    setNewTag('');
  };

  // Remove Search Tag
  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      searchTags: prev.searchTags.filter((t) => t !== tag),
    }));
  };

  // Add Spec Row
  const handleAddSpecRow = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  // Update Spec Row
  const handleSpecChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.specifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, specifications: updated };
    });
  };

  // Remove Spec Row
  const handleRemoveSpec = (index) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  // Add Gallery Image URL
  const handleAddGalleryImage = () => {
    if (formData.galleryImages.length >= 8) {
      alert('Maximum 8 gallery images allowed.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ''],
    }));
  };

  const handleUpdateGalleryImage = (index, url) => {
    setFormData((prev) => {
      const updated = [...prev.galleryImages];
      updated[index] = url;
      return { ...prev, galleryImages: updated };
    });
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
    }));
  };

  // Add Color Variant
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      variantColors: [
        ...prev.variantColors,
        { name: newColorName.trim(), hex: newColorHex },
      ],
    }));
    setNewColorName('');
  };

  // Add Size Variant
  const handleAddSize = () => {
    if (!newSizeName.trim()) return;
    if (!formData.variantSizes.includes(newSizeName.trim())) {
      setFormData((prev) => ({
        ...prev,
        variantSizes: [...prev.variantSizes, newSizeName.trim()],
      }));
    }
    setNewSizeName('');
  };

  // Submit Handler
  const handleSubmit = async (targetStatus = 'PENDING_APPROVAL') => {
    setFormError('');

    // Validations
    if (!formData.name.trim()) {
      setFormError('Please enter a product title.');
      setActiveSection('sec-basic');
      return;
    }
    if (!formData.categoryId) {
      setFormError('Please select a product category.');
      setActiveSection('sec-basic');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setFormError('Please enter a valid selling price greater than 0.');
      setActiveSection('sec-pricing');
      return;
    }
    if (!formData.mainImage.trim()) {
      setFormError('Primary product image URL is required.');
      setActiveSection('sec-images');
      return;
    }

    try {
      setSubmitting(true);

      const generatedSlug = (
        formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') +
        '-' +
        Math.floor(1000 + Math.random() * 9000)
      ).replace(/^-+|-+$/g, '');

      // Construct Images Array
      const imagesPayload = [
        { url: formData.mainImage, alt: `${formData.name} Primary Image` },
        ...formData.galleryImages
          .filter((u) => u && u.trim().length > 5)
          .map((url, idx) => ({ url, alt: `${formData.name} Gallery View ${idx + 1}` })),
      ];

      // Construct Variants Payload
      let variantsPayload = [];
      if (formData.hasVariants && formData.variantsList.length > 0) {
        variantsPayload = formData.variantsList.map((v) => ({
          sku: v.sku,
          attributes: { color: v.color, colorHex: v.colorHex, size: v.size },
          priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : undefined,
          stockQuantity: parseInt(v.stock, 10) || 0,
        }));
      } else {
        variantsPayload = [
          {
            sku: formData.sku || `${generatedSlug.substring(0, 8).toUpperCase()}-DEF`,
            attributes: { standard: true },
            stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
          },
        ];
      }

      // Comprehensive Enterprise Metadata Object
      const metadataPayload = {
        brand: formData.brand,
        subcategory: formData.subcategory,
        modelNumber: formData.modelNumber,
        highlights: formData.highlights,
        videoUrl: formData.videoUrl,
        pricing: {
          costPrice: formData.costPrice,
          estimatedProfit: calculations.estimatedProfit,
          commissionFee: calculations.commissionFee,
          netPayout: calculations.netPayout,
        },
        inventory: {
          lowStockThreshold: parseInt(formData.lowStockThreshold, 10),
          moq: parseInt(formData.moq, 10),
          maxOrderLimit: parseInt(formData.maxOrderLimit, 10),
          restockLeadTime: formData.restockLeadTime,
          warehouseCode: formData.warehouseCode,
        },
        variantOptions: {
          colors: formData.variantColors,
          sizes: formData.variantSizes,
        },
        specifications: formData.specifications.filter(
          (s) => s.key.trim() && s.value.trim(),
        ),
        shipping: {
          deadWeightKg: formData.deadWeightKg,
          lengthCm: formData.lengthCm,
          widthCm: formData.widthCm,
          heightCm: formData.heightCm,
          volumetricWeightKg: calculations.volWeight,
          billableWeightKg: calculations.billableWeight,
          shippingClass: formData.shippingClass,
          shippingFee: formData.shippingFee,
          isFragile: formData.isFragile,
          hasBattery: formData.hasBattery,
          isLiquid: formData.isLiquid,
        },
        tax: {
          hsnCode: formData.hsnCode,
          gstRate: formData.gstRate,
          countryOfOrigin: formData.countryOfOrigin,
          manufacturerDetails: formData.manufacturerDetails,
          packerDetails: formData.packerDetails,
          certifications: formData.certifications,
        },
        seo: {
          metaTitle: formData.metaTitle || `${formData.name} | Nexora Commerce`,
          metaDescription:
            formData.metaDescription ||
            `Buy ${formData.name} online at best price on Nexora Commerce. Free shipping & verified seller warranty.`,
          searchTags: formData.searchTags,
        },
        warranty: {
          duration: formData.warrantyDuration,
          type: formData.warrantyType,
          returnWindow: formData.returnWindow,
          terms: formData.returnPolicyTerms,
        },
        publishing: {
          visibility: formData.visibility,
          isFeatured: formData.isFeatured,
          submittedAt: new Date().toISOString(),
        },
        seller: {
          storeName: sellerProfile?.storeName || 'Nexora Prime Store',
          storeSlug: sellerProfile?.storeSlug || 'nexora-store',
          taxId: sellerProfile?.taxId || 'GSTIN-PENDING',
          dispatchCity: formData.dispatchCity,
          dispatchPincode: formData.dispatchPincode,
          supportEmail: formData.supportEmail,
          supportPhone: formData.supportPhone,
        },
      };

      const payload = {
        name: formData.name,
        slug: initialData?.slug || generatedSlug,
        description: formData.description || formData.highlights.join('\n• '),
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : undefined,
        categoryId: formData.categoryId,
        brand: formData.brand,
        images: imagesPayload,
        variants: variantsPayload,
        metadata: metadataPayload,
      };

      if (isEdit) {
        await sellerRequest(`/seller/products/${initialData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await sellerRequest('/seller/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      onSuccess?.();
    } catch (err) {
      console.error('Save product error:', err);
      setFormError(
        err.message ||
          'Failed to save product listing. Please check required fields.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold border border-royal-blue/30 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-teal" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Sticky Header */}
      <div className="bg-white/95 backdrop-blur-md sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 border-b border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-muted hover:text-navy hover:bg-canvas transition border border-border"
            title="Return to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-royal-blue/10 text-royal-blue">
                {isEdit ? 'Editing Product' : 'Amazon & Flipkart Style Listing'}
              </span>
              <span className="text-[10px] text-muted">
                {completionPercentage}% Completed
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-navy truncate max-w-md">
              {formData.name || 'New Multi-Section Product Listing'}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-border text-navy hover:bg-canvas rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('DRAFT')}
            className="px-4 py-2 bg-canvas hover:bg-border text-navy border border-border rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-muted" />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('PENDING_APPROVAL')}
            className="px-5 py-2 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>
              {isEdit ? 'Update Product' : 'Publish Product for Approval'}
            </span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-royal-blue to-teal h-full transition-all duration-300 rounded-full"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Grid: Left Navigation Anchor Pills + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24 space-y-1 bg-white p-3 rounded-2xl border border-border shadow-xs">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider px-3 py-2">
            Listing Sections (12)
          </div>
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isCurrent = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isCurrent
                    ? 'bg-royal-blue text-white shadow-xs'
                    : 'text-navy hover:bg-canvas'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isCurrent ? 'text-white' : 'text-muted'
                  }`}
                />
                <span className="truncate">{sec.label}</span>
              </a>
            );
          })}

          <div className="mt-4 pt-4 border-t border-border px-3">
            <div className="text-[10px] text-muted flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-teal" />
              <span>Complies with Amazon & Flipkart Seller Standards</span>
            </div>
          </div>
        </div>

        {/* Content Area (12 Sections) */}
        <div className="lg:col-span-9 space-y-8">
          {/* ======================================================== */}
          {/* SECTION 1: Product Basic Information */}
          {/* ======================================================== */}
          <section
            id="sec-basic"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-royal-blue/10 flex items-center justify-center text-royal-blue">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    1. Product Basic Information
                  </h2>
                  <p className="text-xs text-muted">
                    Title, brand, primary category, master SKU, and core feature bullets.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-canvas text-navy px-2 py-1 rounded-lg border border-border">
                Mandatory
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Product Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Product Title *
                  <span className="text-[10px] font-normal text-muted ml-2">
                    (Recommended: Brand + Model Name + Key Spec + Color)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Nexora Sonic ANC Wireless Bluetooth Over-Ear Headphones with 40H Playtime (Midnight Black)"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-border rounded-xl focus:outline-none focus:border-royal-blue font-medium"
                />
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, brand: e.target.value }))
                  }
                  placeholder="e.g. Nexora Acoustics"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Primary Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Subcategory / Product Type
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subcategory: e.target.value,
                    }))
                  }
                  placeholder="e.g. Over-Ear Headphones, T-Shirts, Phone Cases"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* SKU & Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Master SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sku: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="NX-SONIC-BLK"
                    className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Model / Style No.
                  </label>
                  <input
                    type="text"
                    value={formData.modelNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        modelNumber: e.target.value,
                      }))
                    }
                    placeholder="MOD-2026-X1"
                    className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono"
                  />
                </div>
              </div>

              {/* Quick Preset Selector */}
              <div className="md:col-span-2 bg-canvas/70 p-4 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-royal-blue" />
                    Load Category Presets (Auto-fills Specs & HSN Code)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-royal-blue hover:text-white border border-border rounded-lg transition"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bullet Points / Highlights */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-navy">
                  Key Feature Bullet Points (Amazon / Flipkart Highlights)
                </label>
                <div className="space-y-2">
                  {formData.highlights.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-royal-blue w-5">
                        •
                      </span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => {
                            const updated = [...prev.highlights];
                            updated[idx] = val;
                            return { ...prev, highlights: updated };
                          });
                        }}
                        className="flex-1 px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newBullet}
                      onChange={(e) => setNewBullet(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBullet();
                        }
                      }}
                      placeholder="Add another highlight bullet..."
                      className="flex-1 px-3 py-2 text-xs border border-dashed border-border rounded-xl focus:outline-none focus:border-royal-blue"
                    />
                    <button
                      type="button"
                      onClick={handleAddBullet}
                      className="px-3 py-2 bg-navy text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Highlight</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Detailed Product Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Provide comprehensive details about the product, materials, craftsmanship, usage instructions, package contents, and customer benefits..."
                  className="w-full px-4 py-3 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue leading-relaxed"
                />
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 2: Product Images & Media */}
          {/* ======================================================== */}
          <section
            id="sec-images"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center text-teal">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    2. Product Images & Media
                  </h2>
                  <p className="text-xs text-muted">
                    Main product image, 5-8 gallery angles, demo video URL, and compliance guidelines.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-canvas text-navy px-2 py-1 rounded-lg border border-border">
                {1 + formData.galleryImages.filter(Boolean).length} / 9 Images
              </span>
            </div>

            {/* Media Guidelines Box */}
            <div className="bg-canvas/70 p-4 rounded-2xl border border-border flex items-start gap-3">
              <Info className="w-5 h-5 text-royal-blue shrink-0 mt-0.5" />
              <div className="text-xs text-navy/80 space-y-1">
                <span className="font-bold text-navy block">
                  Ecommerce Photography Standards (Amazon & Flipkart Compliant)
                </span>
                <p className="text-[11px] text-muted">
                  • Pure white background (RGB 255, 255, 255) for the primary listing photo.
                  <br />
                  • Minimum resolution: 1000 x 1000 pixels (enables hover-to-zoom on storefront).
                  <br />
                  • Provide front, rear, angled, lifestyle, and dimension graphic views.
                </p>
              </div>
            </div>

            {/* Image Processing Loading Banner */}
            {imageProcessing && (
              <div className="bg-royal-blue/10 border border-royal-blue/20 rounded-2xl p-3 flex items-center gap-3 text-royal-blue animate-pulse">
                <div className="w-5 h-5 rounded-full border-2 border-royal-blue border-t-transparent animate-spin shrink-0" />
                <div className="text-xs font-semibold">
                  Processing and optimizing image from device memory... Please wait.
                </div>
              </div>
            )}

            {/* Primary Image Selection */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-navy">
                    Primary Product Image * (Hero Listing Photo)
                  </label>
                  <p className="text-[11px] text-muted">
                    Main image displayed in search results, catalog, and hero zoom.
                  </p>
                </div>
                {/* Source Selection Toggle (Memory vs URL) */}
                <div className="flex items-center gap-1 bg-canvas p-1 rounded-xl border border-border shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPrimaryImageMode('memory')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                      primaryImageMode === 'memory'
                        ? 'bg-royal-blue text-white shadow-xs'
                        : 'text-navy/70 hover:text-navy hover:bg-white'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Device Memory</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrimaryImageMode('url')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                      primaryImageMode === 'url'
                        ? 'bg-royal-blue text-white shadow-xs'
                        : 'text-navy/70 hover:text-navy hover:bg-white'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Web URL</span>
                  </button>
                </div>
              </div>

              {/* Hidden file input for primary image */}
              <input
                type="file"
                ref={primaryFileInputRef}
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handlePrimaryFile(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />

              {primaryImageMode === 'memory' ? (
                <div>
                  {formData.mainImage ? (
                    /* Selected Image Card */
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-canvas/40 rounded-2xl border-2 border-royal-blue/30 shadow-xs">
                      <div className="relative w-36 h-36 rounded-xl border border-border bg-white overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img
                          src={formData.mainImage}
                          alt="Primary Preview"
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute bottom-1 left-1 right-1 text-center bg-navy/90 text-white text-[9px] font-bold py-0.5 rounded shadow">
                          Hero Photo
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Image loaded from device memory</span>
                        </div>
                        {primaryImageMeta && (
                          <div className="text-[11px] text-muted space-y-0.5">
                            <p className="font-mono text-navy truncate font-medium">
                              {primaryImageMeta.name}
                            </p>
                            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-mono text-[10px] font-bold border border-emerald-200">
                              {primaryImageMeta.sizeKb} KB • Canvas Compressed HD
                            </span>
                          </div>
                        )}
                        <p className="text-[11px] text-muted">
                          Meets ecommerce listing standards. High-resolution hover zoom ready.
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => primaryFileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-royal-blue text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-royal-blue/90 transition-all shadow-xs"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Change Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, mainImage: '' }));
                              setPrimaryImageMeta(null);
                            }}
                            className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Dropzone to select from memory */
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingPrimary(true);
                      }}
                      onDragLeave={() => setIsDraggingPrimary(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingPrimary(false);
                        if (e.dataTransfer.files?.[0]) {
                          handlePrimaryFile(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => primaryFileInputRef.current?.click()}
                      className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all ${
                        isDraggingPrimary
                          ? 'border-royal-blue bg-royal-blue/10 scale-[1.01]'
                          : 'border-royal-blue/40 bg-royal-blue/[0.03] hover:bg-royal-blue/[0.07] hover:border-royal-blue'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-royal-blue/10 text-royal-blue flex items-center justify-center mb-3">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-bold text-navy mb-1">
                        Click to select Primary Image from your computer memory
                      </p>
                      <p className="text-xs text-muted max-w-md mb-4">
                        Drag and drop your product photo here or click the button below. Supports JPG, PNG, WEBP (auto-scaled to 1200px HD).
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          primaryFileInputRef.current?.click();
                        }}
                        className="px-4 py-2 bg-royal-blue text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-royal-blue/90 shadow-xs"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>Browse Device Files / Memory</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* URL Input Mode */
                <div className="flex flex-col sm:flex-row gap-4 items-start p-4 bg-canvas/30 rounded-2xl border border-border">
                  <div className="relative w-28 h-28 rounded-xl border border-border bg-white overflow-hidden shrink-0 flex items-center justify-center p-1">
                    {formData.mainImage ? (
                      <img
                        src={formData.mainImage}
                        alt="Primary Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted" />
                    )}
                    <span className="absolute bottom-1 left-1 right-1 text-center bg-navy/80 text-white text-[9px] font-bold py-0.5 rounded">
                      Primary
                    </span>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="url"
                      required
                      value={formData.mainImage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mainImage: e.target.value,
                        }))
                      }
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono bg-white"
                    />
                    <p className="text-[11px] text-muted">
                      Paste a direct HTTPS image URL from your CDN, Unsplash, or Cloudinary.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Images (5 to 8 angles) */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-navy block">
                    Additional Gallery Angles (5 - 8 angles recommended)
                  </label>
                  <p className="text-[11px] text-muted">
                    Amazon & Flipkart recommend front, back, side, lifestyle, and detail shots.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Hidden batch file input */}
                  <input
                    type="file"
                    ref={batchFileInputRef}
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleBatchGalleryFiles(e.target.files);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => batchFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-royal-blue text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-royal-blue/90 transition-all shadow-xs"
                    title="Select multiple photos at once from your folder"
                  >
                    <FolderUp className="w-3.5 h-3.5" />
                    <span>Select Multiple from Memory</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-3 py-1.5 bg-white hover:bg-canvas text-navy rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-border"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slot</span>
                  </button>
                </div>
              </div>

              {/* Gallery Slots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.galleryImages.map((imgUrl, idx) => {
                  const angleNames = [
                    'Back View',
                    'Side Profile',
                    'Close-up Detail',
                    'In-Use / Lifestyle',
                    'Packaging / Box',
                    'Dimensions / Specs',
                    'Alternative Color',
                    'Interior / Angle',
                  ];
                  const angleLabel = angleNames[idx] || `Angle #${idx + 2}`;

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-canvas/40 rounded-2xl border border-border flex items-center gap-3 relative hover:border-royal-blue/30 transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl border border-border bg-white overflow-hidden shrink-0 flex items-center justify-center p-1 relative">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={`Angle ${idx + 2}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Camera className="w-6 h-6 text-muted" />
                        )}
                        <span className="absolute bottom-0.5 inset-x-0.5 text-center bg-navy/80 text-white text-[8px] font-bold py-0.2 rounded">
                          #{idx + 2}
                        </span>
                      </div>

                      {/* Controls */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-navy truncate">
                            Angle #{idx + 2}: {angleLabel}
                          </span>
                          {imgUrl && imgUrl.startsWith('data:image') && (
                            <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                              Device File
                            </span>
                          )}
                        </div>

                        {/* Hidden individual slot file input */}
                        <input
                          type="file"
                          id={`gallery-file-${idx}`}
                          accept="image/png,image/jpeg,image/webp,image/avif"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleSingleGalleryFile(idx, e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                          className="hidden"
                        />

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById(`gallery-file-${idx}`);
                              if (el) el.click();
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-canvas text-navy text-[11px] font-medium rounded-lg border border-border flex items-center gap-1 shrink-0"
                          >
                            <FolderOpen className="w-3 h-3 text-royal-blue" />
                            <span>{imgUrl ? 'Replace' : 'Browse Memory'}</span>
                          </button>
                          <input
                            type="text"
                            value={imgUrl.startsWith('data:image') ? '[Image from memory]' : imgUrl}
                            onChange={(e) =>
                              handleUpdateGalleryImage(idx, e.target.value)
                            }
                            placeholder="or paste URL..."
                            className="flex-1 min-w-0 px-2 py-1 text-[11px] border border-border rounded-lg focus:outline-none focus:border-royal-blue bg-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Delete Slot Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 self-start mt-1"
                        title="Remove angle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {formData.galleryImages.length === 0 && (
                <div className="p-4 border border-dashed border-border rounded-2xl text-center text-xs text-muted">
                  No additional gallery images added yet. Click &quot;Select Multiple from Memory&quot; to pick photos from your folders.
                </div>
              )}
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-xs font-bold text-navy mb-1.5">
                Product Video URL (Optional YouTube / MP4 demonstration)
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
                }
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono"
              />
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 3: Product Pricing Information */}
          {/* ======================================================== */}
          <section
            id="sec-pricing"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    3. Product Pricing & Margin Intelligence
                  </h2>
                  <p className="text-xs text-muted">
                    Selling price, MRP compare-at price, cost price, and auto-calculated seller payout.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-teal/10 text-teal px-2 py-1 rounded-lg">
                10% Nexora Fee
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Selling Price */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Your Selling Price (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="2499"
                    className="w-full pl-7 pr-3 py-2 text-xs font-bold text-navy border border-border rounded-xl focus:outline-none focus:border-royal-blue text-sm"
                  />
                </div>
              </div>

              {/* MRP / Compare At */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Maximum Retail Price (MRP ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        compareAtPrice: e.target.value,
                      }))
                    }
                    placeholder="3999"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                  />
                </div>
              </div>

              {/* Seller Cost Price */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Cost of Goods / Purchase Cost (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        costPrice: e.target.value,
                      }))
                    }
                    placeholder="1400"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue text-muted font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Financial Intelligence Summary Card */}
            <div className="bg-gradient-to-br from-canvas to-royal-blue/5 p-5 rounded-2xl border border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                  Buyer Discount
                </span>
                <span className="text-base font-extrabold text-teal">
                  {calculations.discountPercent}% OFF
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  vs ₹{formData.compareAtPrice || formData.price} MRP
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                  Platform Fee (10%)
                </span>
                <span className="text-base font-extrabold text-rose-600">
                  - {formatINR(calculations.commissionFee)}
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  Nexora Commission
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                  Net Seller Settlement
                </span>
                <span className="text-base font-extrabold text-navy">
                  {formatINR(calculations.netPayout)}
                </span>
                <span className="text-[10px] text-teal font-semibold block mt-0.5">
                  Direct Bank Payout
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                  Est. Profit Margin
                </span>
                <span className="text-base font-extrabold text-royal-blue">
                  +{formatINR(calculations.estimatedProfit)} ({calculations.marginPercent}%)
                </span>
                <span className="text-[10px] text-muted block mt-0.5">
                  Net Profit per item
                </span>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 4: Product Inventory / Stock Information */}
          {/* ======================================================== */}
          <section
            id="sec-stock"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    4. Product Inventory & Stock Information
                  </h2>
                  <p className="text-xs text-muted">
                    Stock count, reorder triggers, minimum/maximum order limits, and warehouse handling.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Available Stock */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Available Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stockQuantity: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs font-bold text-navy border border-border rounded-xl focus:outline-none focus:border-royal-blue text-sm"
                />
              </div>

              {/* Low Stock Alert Threshold */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lowStockThreshold: parseInt(e.target.value, 10) || 5,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* Restock Lead Time */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Restock / Dispatch SLA
                </label>
                <select
                  value={formData.restockLeadTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      restockLeadTime: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                >
                  <option value="Same Day Dispatch">Same Day Dispatch</option>
                  <option value="1-2 Business Days">1-2 Business Days</option>
                  <option value="3-5 Business Days">3-5 Business Days</option>
                  <option value="Custom Made to Order">Custom Made to Order</option>
                </select>
              </div>

              {/* Minimum Order Quantity */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Minimum Order Quantity (MOQ)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.moq}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      moq: parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* Maximum Order Limit */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Max Order Limit per Customer
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxOrderLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxOrderLimit: parseInt(e.target.value, 10) || 5,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* Warehouse Code */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Fulfillment Node / Warehouse Code
                </label>
                <input
                  type="text"
                  value={formData.warehouseCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      warehouseCode: e.target.value,
                    }))
                  }
                  placeholder="WH-MUMBAI-01"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono"
                />
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 5: Product Variants / Attributes */}
          {/* ======================================================== */}
          <section
            id="sec-variants"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    5. Product Variants & Attributes
                  </h2>
                  <p className="text-xs text-muted">
                    Color swatches, size options, and dynamic multi-attribute variant matrix generator.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasVariants}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hasVariants: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-royal-blue rounded border-border"
                />
                <span className="text-xs font-bold text-navy">
                  Enable Variants
                </span>
              </label>
            </div>

            {formData.hasVariants ? (
              <div className="space-y-6">
                {/* Color and Size Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-canvas/40 rounded-2xl border border-border">
                  {/* Colors */}
                  <div>
                    <span className="text-xs font-bold text-navy block mb-2">
                      Color Options ({formData.variantColors.length})
                    </span>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.variantColors.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-border rounded-xl text-xs font-semibold"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-border shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                variantColors: prev.variantColors.filter(
                                  (_, idx) => idx !== i,
                                ),
                              }))
                            }
                            className="text-muted hover:text-rose-500 ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                      />
                      <input
                        type="text"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        placeholder="Color name (e.g. Navy Blue)"
                        className="flex-1 px-3 py-1.5 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="px-3 py-1.5 bg-navy text-white rounded-xl text-xs font-semibold"
                      >
                        Add Color
                      </button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <span className="text-xs font-bold text-navy block mb-2">
                      Size Options ({formData.variantSizes.length})
                    </span>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.variantSizes.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white border border-border rounded-xl text-xs font-semibold"
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                variantSizes: prev.variantSizes.filter(
                                  (_, idx) => idx !== i,
                                ),
                              }))
                            }
                            className="text-muted hover:text-rose-500 ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSizeName}
                        onChange={(e) => setNewSizeName(e.target.value)}
                        placeholder="Size (e.g. M, L, XL, 128GB)"
                        className="flex-1 px-3 py-1.5 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="px-3 py-1.5 bg-navy text-white rounded-xl text-xs font-semibold"
                      >
                        Add Size
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generator Button */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">
                    Click generate to sync color & size matrix with SKUs and pricing.
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateMatrix}
                    className="px-4 py-2 bg-royal-blue text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Variant Matrix</span>
                  </button>
                </div>

                {/* Variant Table */}
                {formData.variantsList.length > 0 && (
                  <div className="overflow-x-auto border border-border rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-canvas border-b border-border text-muted font-semibold">
                        <tr>
                          <th className="px-4 py-3">Variant SKU</th>
                          <th className="px-4 py-3">Color</th>
                          <th className="px-4 py-3">Size</th>
                          <th className="px-4 py-3">Price Override (₹)</th>
                          <th className="px-4 py-3">Stock Units</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {formData.variantsList.map((v, idx) => (
                          <tr key={idx} className="hover:bg-canvas/30">
                            <td className="px-4 py-2.5 font-mono font-bold text-navy">
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const updated = [...prev.variantsList];
                                    updated[idx] = { ...updated[idx], sku: val };
                                    return { ...prev, variantsList: updated };
                                  });
                                }}
                                className="w-32 px-2 py-1 text-xs border border-border rounded font-mono"
                              />
                            </td>
                            <td className="px-4 py-2.5">{v.color}</td>
                            <td className="px-4 py-2.5">{v.size}</td>
                            <td className="px-4 py-2.5">
                              <input
                                type="number"
                                placeholder={`Same as base (₹${formData.price})`}
                                value={v.priceOverride}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const updated = [...prev.variantsList];
                                    updated[idx] = {
                                      ...updated[idx],
                                      priceOverride: val,
                                    };
                                    return { ...prev, variantsList: updated };
                                  });
                                }}
                                className="w-28 px-2 py-1 text-xs border border-border rounded"
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <input
                                type="number"
                                value={v.stock}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  setFormData((prev) => {
                                    const updated = [...prev.variantsList];
                                    updated[idx] = { ...updated[idx], stock: val };
                                    return { ...prev, variantsList: updated };
                                  });
                                }}
                                className="w-20 px-2 py-1 text-xs border border-border rounded font-bold"
                              />
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    variantsList: prev.variantsList.filter(
                                      (_, i) => i !== idx,
                                    ),
                                  }))
                                }
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 bg-canvas/40 rounded-2xl border border-dashed border-border text-center text-xs text-muted">
                Single product listing without variant options. Check "Enable Variants" above if this item comes in different colors or sizes.
              </div>
            )}
          </section>

          {/* ======================================================== */}
          {/* SECTION 6: Product Specifications / Technical Details */}
          {/* ======================================================== */}
          <section
            id="sec-specs"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    6. Product Specifications & Technical Attributes
                  </h2>
                  <p className="text-xs text-muted">
                    Key-value technical details shown in the Amazon/Flipkart "Specification Table".
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddSpecRow}
                className="px-3 py-1.5 bg-canvas hover:bg-border text-navy rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-border"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Specification</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.specifications.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                    placeholder="Attribute (e.g. Battery Life, Fabric, Material)"
                    className="w-1/3 px-3 py-2 text-xs font-bold text-navy border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(idx, 'value', e.target.value)
                    }
                    placeholder="Value (e.g. 40 Hours, 100% Organic Cotton)"
                    className="flex-1 px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 7: Shipping Information & Packaging */}
          {/* ======================================================== */}
          <section
            id="sec-shipping"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    7. Shipping & Packaging Dimensions
                  </h2>
                  <p className="text-xs text-muted">
                    Package dead weight, box dimensions, volumetric weight calculation, and handling flags.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Dead Weight */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Package Dead Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.deadWeightKg}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deadWeightKg: e.target.value,
                    }))
                  }
                  placeholder="0.45"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* Length */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Length (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.lengthCm}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lengthCm: e.target.value,
                    }))
                  }
                  placeholder="20"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* Width */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Width (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.widthCm}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      widthCm: e.target.value,
                    }))
                  }
                  placeholder="15"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.heightCm}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      heightCm: e.target.value,
                    }))
                  }
                  placeholder="6"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>
            </div>

            {/* Volumetric Weight Calculator Result */}
            <div className="bg-canvas p-4 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-navy space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-royal-blue" />
                  Courier Volumetric Calculation (Formula: L × W × H ÷ 5000)
                </span>
                <p className="text-[11px] text-muted">
                  Volumetric Weight: <strong>{calculations.volWeight} kg</strong> • Actual Dead Weight: <strong>{formData.deadWeightKg} kg</strong>
                </p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-border text-center">
                <span className="text-[10px] uppercase font-bold text-muted block">
                  Billable Weight
                </span>
                <span className="text-sm font-extrabold text-navy">
                  {calculations.billableWeight} kg
                </span>
              </div>
            </div>

            {/* Shipping Class & Hazardous Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Shipping Delivery Class
                </label>
                <select
                  value={formData.shippingClass}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shippingClass: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                >
                  <option value="Nexora Express (1-2 Days)">Nexora Express (1-2 Days Guaranteed)</option>
                  <option value="Standard Surface (3-5 Days)">Standard Surface (3-5 Days)</option>
                  <option value="Heavy & Bulky Cargo (5-7 Days)">Heavy & Bulky Cargo (5-7 Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Customer Shipping Fee
                </label>
                <select
                  value={formData.shippingFee}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shippingFee: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                >
                  <option value="0">Free Delivery (Seller Absorbed - Boosts Sales)</option>
                  <option value="49">₹49 Standard Delivery</option>
                  <option value="99">₹99 Express Delivery</option>
                </select>
              </div>
            </div>

            {/* Safety Handling Flags */}
            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-navy">
                <input
                  type="checkbox"
                  checked={formData.isFragile}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isFragile: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-royal-blue rounded"
                />
                <span>Fragile / Handle With Care</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-navy">
                <input
                  type="checkbox"
                  checked={formData.hasBattery}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hasBattery: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-royal-blue rounded"
                />
                <span>Contains Lithium Battery (UN3481)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-navy">
                <input
                  type="checkbox"
                  checked={formData.isLiquid}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isLiquid: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-royal-blue rounded"
                />
                <span>Contains Liquid / Gel Content</span>
              </label>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 8: Tax & Compliance Information */}
          {/* ======================================================== */}
          <section
            id="sec-tax"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    8. Tax & Legal Compliance Information
                  </h2>
                  <p className="text-xs text-muted">
                    HSN code, Indian GST rate, Country of origin, and manufacturer/packer declarations.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-canvas text-navy px-2 py-1 rounded-lg border border-border">
                GST Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* HSN Code */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  HSN / SAC Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hsnCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hsnCode: e.target.value,
                    }))
                  }
                  placeholder="85183000"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono font-bold"
                />
                <span className="text-[10px] text-muted block mt-1">
                  8-digit GST commodity code
                </span>
              </div>

              {/* GST Rate */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Applicable GST Rate *
                </label>
                <select
                  value={formData.gstRate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gstRate: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white font-bold"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5% (Essential Goods)</option>
                  <option value={12}>12% (Standard Apparel & Tools)</option>
                  <option value={18}>18% (Consumer Electronics & Tech)</option>
                  <option value={28}>28% (Luxury Goods)</option>
                </select>
              </div>

              {/* Country of Origin */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Country of Origin *
                </label>
                <select
                  value={formData.countryOfOrigin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      countryOfOrigin: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                >
                  <option value="India">India (Make in India)</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="Taiwan">Taiwan</option>
                  <option value="Germany">Germany</option>
                  <option value="Japan">Japan</option>
                  <option value="United States">United States</option>
                </select>
              </div>

              {/* Manufacturer Address */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Manufacturer / Importer Name & Registered Address *
                </label>
                <input
                  type="text"
                  value={formData.manufacturerDetails}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      manufacturerDetails: e.target.value,
                    }))
                  }
                  placeholder="e.g. Nexora Prime Ltd, Plot 45, Electronics Zone, Andheri East, Mumbai 400001"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* Packer Details */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Packer Details
                </label>
                <input
                  type="text"
                  value={formData.packerDetails}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      packerDetails: e.target.value,
                    }))
                  }
                  placeholder="e.g. Nexora Fulfillment Center 1, Mumbai 400001"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* Certifications (BIS, FSSAI) */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Certifications / BIS / FSSAI
                </label>
                <input
                  type="text"
                  value={formData.certifications}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      certifications: e.target.value,
                    }))
                  }
                  placeholder="e.g. BIS: R-41012345, FSSAI: 100..."
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono"
                />
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 9: SEO & Search Engine Optimization */}
          {/* ======================================================== */}
          <section
            id="sec-seo"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-royal-blue">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    9. SEO & Search Engine Metadata
                  </h2>
                  <p className="text-xs text-muted">
                    Meta title, description, keyword chips, and Google search snippet live preview.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Meta Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-navy">
                    Meta Page Title
                  </label>
                  <span className="text-[10px] text-muted">
                    {(formData.metaTitle || formData.name).length} / 60 Chars
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metaTitle: e.target.value,
                    }))
                  }
                  placeholder={formData.name || 'e.g. Nexora Sonic ANC Wireless Bluetooth Headphones'}
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-navy">
                    Meta Search Description
                  </label>
                  <span className="text-[10px] text-muted">
                    {(formData.metaDescription || formData.description).substring(0, 160).length} / 160 Chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }))
                  }
                  placeholder="Shop genuine Nexora Sonic ANC Wireless Headphones online in India. Features 40-hour battery, active noise cancellation, fast charging & 1-year brand warranty."
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>

              {/* Search Tags / Keywords Chips */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Customer Search Keywords (Chips)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.searchTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-royal-blue/10 text-royal-blue rounded-xl text-xs font-semibold"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-royal-blue hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type keyword and press Enter (e.g. bluetooth headphones, noise cancelling)..."
                    className="flex-1 px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-navy text-white rounded-xl text-xs font-semibold"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              {/* Google SERP Live Preview */}
              <div className="bg-canvas p-4 rounded-2xl border border-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider block mb-2">
                  Google Search Result Preview
                </span>
                <div className="font-sans">
                  <div className="text-[11px] text-[#202124] flex items-center gap-1.5 truncate">
                    <span className="w-4 h-4 rounded-full bg-royal-blue text-white text-[9px] flex items-center justify-center font-bold">
                      N
                    </span>
                    <span>nexoracommerce.com › products › {formData.sku.toLowerCase() || 'item'}</span>
                  </div>
                  <div className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer truncate mt-0.5">
                    {formData.metaTitle || formData.name || 'Product Title on Nexora Commerce'}
                  </div>
                  <div className="text-xs text-[#4d5156] line-clamp-2 mt-1">
                    {formData.metaDescription ||
                      formData.description ||
                      'Discover top rated authentic products with fast doorstep delivery across India on Nexora Commerce.'}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 10: Warranty & Return Information */}
          {/* ======================================================== */}
          <section
            id="sec-warranty"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center text-teal">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    10. Warranty & Return Policy
                  </h2>
                  <p className="text-xs text-muted">
                    Customer protection period, replacement eligibility, and warranty claims terms.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Warranty Duration */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Warranty Duration
                </label>
                <select
                  value={formData.warrantyDuration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      warrantyDuration: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                >
                  <option value="1 Year Brand Warranty">1 Year Brand Warranty</option>
                  <option value="6 Months Warranty">6 Months Warranty</option>
                  <option value="2 Years Extended Warranty">2 Years Extended Warranty</option>
                  <option value="30 Days Seller Replacement">30 Days Seller Replacement</option>
                  <option value="No Warranty Applicable">No Warranty Applicable</option>
                </select>
              </div>

              {/* Warranty Type */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Warranty Coverage Type
                </label>
                <select
                  value={formData.warrantyType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      warrantyType: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                >
                  <option value="Brand Replacement / Service Centre">Brand Replacement / Service Centre</option>
                  <option value="Seller On-Site Repair">Seller On-Site Repair</option>
                  <option value="Pick-and-Drop Service">Pick-and-Drop Service</option>
                </select>
              </div>

              {/* Return Window */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Return / Replacement Window
                </label>
                <select
                  value={formData.returnWindow}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      returnWindow: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white font-bold"
                >
                  <option value="7-Day Replacement Guarantee">7-Day Replacement Guarantee</option>
                  <option value="10-Day Return & Refund">10-Day Return & Refund</option>
                  <option value="Non-Returnable (Hygiene / Consumable)">Non-Returnable (Hygiene / Consumable)</option>
                </select>
              </div>

              {/* Terms */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Return Conditions & Policy Terms
                </label>
                <textarea
                  rows={2}
                  value={formData.returnPolicyTerms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      returnPolicyTerms: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                />
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 11: Product Status & Publishing */}
          {/* ======================================================== */}
          <section
            id="sec-status"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    11. Product Status & Visibility
                  </h2>
                  <p className="text-xs text-muted">
                    Publishing channel, catalog visibility, and storefront featured promotion toggle.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Publishing Lifecycle Stage
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white font-bold"
                >
                  <option value="PENDING_APPROVAL">Submit for Admin Review (PENDING_APPROVAL)</option>
                  <option value="DRAFT">Save as Draft (DRAFT)</option>
                  <option value="ACTIVE">Active in Catalog (ACTIVE)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Catalog Visibility
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      visibility: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue bg-white"
                >
                  <option value="PUBLIC">Public (Visible in search & browsing)</option>
                  <option value="PRIVATE">Private / Unlisted (Direct link only)</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFeatured: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-royal-blue rounded border-border"
                  />
                  <div>
                    <span className="text-xs font-bold text-navy block">
                      Feature on Storefront Homepage
                    </span>
                    <span className="text-[10px] text-muted">
                      Promotes item in top seller carousel
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 12: Additional Product Info & Seller Profile */}
          {/* ======================================================== */}
          <section
            id="sec-seller"
            className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center text-navy">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy">
                    12. Seller Information & Storefront "Sold By" Badge
                  </h2>
                  <p className="text-xs text-muted">
                    Verified merchant identity, dispatch warehouse location, and customer care details.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-teal/10 text-teal px-2 py-1 rounded-lg">
                Verified Seller
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Storefront "Sold By" Preview Widget */}
              <div className="bg-canvas p-5 rounded-2xl border border-border space-y-3">
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                  Customer Product Page "Sold By" Badge Preview
                </span>
                <div className="bg-white p-4 rounded-xl border border-border space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted block">Sold By</span>
                      <span className="text-sm font-extrabold text-navy">
                        {sellerProfile?.storeName || 'Nexora Prime Electronics'}
                      </span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-teal/10 text-teal text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified Merchant</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted pt-1 border-t border-border/60">
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      ★ 4.8 / 5.0
                    </span>
                    <span>•</span>
                    <span>{formData.dispatchCity}</span>
                    <span>•</span>
                    <span>99% On-Time Dispatch</span>
                  </div>
                </div>
              </div>

              {/* Dispatch & Support Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Dispatch Warehouse Origin City & Pincode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.dispatchCity}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dispatchCity: e.target.value,
                        }))
                      }
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                    />
                    <input
                      type="text"
                      value={formData.dispatchPincode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dispatchPincode: e.target.value,
                        }))
                      }
                      placeholder="400001"
                      className="px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Customer Support Helpline & Email
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.supportPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          supportPhone: e.target.value,
                        }))
                      }
                      placeholder="+91 98200 12345"
                      className="px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue font-mono"
                    />
                    <input
                      type="email"
                      value={formData.supportEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          supportEmail: e.target.value,
                        }))
                      }
                      placeholder="support@store.com"
                      className="px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:border-royal-blue"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-muted">
                  GSTIN: <span className="font-mono font-semibold text-navy">{sellerProfile?.taxId || '27AAACN0123M1Z5'}</span> • Registered Store Slug: <span className="font-mono text-royal-blue">/store/{sellerProfile?.storeSlug || 'prime'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Action Footer */}
          <div className="bg-white p-5 rounded-3xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal" />
              <span className="text-xs font-semibold text-navy">
                All 12 sections configured. Ready to submit for catalog listing.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 border border-border text-navy hover:bg-canvas rounded-xl text-xs font-semibold transition"
              >
                Back to Catalog
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit('DRAFT')}
                className="px-4 py-2 bg-canvas hover:bg-border text-navy border border-border rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-muted" />
                <span>Save Draft</span>
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit('PENDING_APPROVAL')}
                className="px-6 py-2.5 bg-royal-blue hover:bg-royal-blue/90 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {isEdit ? 'Update Product' : 'Publish Product for Approval'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
