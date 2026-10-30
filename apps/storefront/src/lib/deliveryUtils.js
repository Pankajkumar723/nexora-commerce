// Delivery date calculation & Pincode intelligence utility for Nexora Commerce

// Popular Indian Pincodes and Cities
const KNOWN_PINCODES = {
  // Metro Cities (Tier 1) - Next Day / Fast Express Available
  '110001': { city: 'New Delhi', state: 'Delhi', tier: 1, standardDays: 2, expressDays: 1 },
  '110020': { city: 'Okhla, New Delhi', state: 'Delhi', tier: 1, standardDays: 2, expressDays: 1 },
  '400001': { city: 'Fort, Mumbai', state: 'Maharashtra', tier: 1, standardDays: 2, expressDays: 1 },
  '400050': { city: 'Bandra, Mumbai', state: 'Maharashtra', tier: 1, standardDays: 2, expressDays: 1 },
  '560001': { city: 'MG Road, Bengaluru', state: 'Karnataka', tier: 1, standardDays: 2, expressDays: 1 },
  '560103': { city: 'Outer Ring Road, Bengaluru', state: 'Karnataka', tier: 1, standardDays: 2, expressDays: 1 },
  '560025': { city: 'Richmond Town, Bengaluru', state: 'Karnataka', tier: 1, standardDays: 2, expressDays: 1 },
  '500001': { city: 'Hyderabad GPO', state: 'Telangana', tier: 1, standardDays: 2, expressDays: 1 },
  '500081': { city: 'HITEC City, Hyderabad', state: 'Telangana', tier: 1, standardDays: 2, expressDays: 1 },
  '600001': { city: 'Chennai GPO', state: 'Tamil Nadu', tier: 1, standardDays: 2, expressDays: 1 },
  '700001': { city: 'Kolkata GPO', state: 'West Bengal', tier: 1, standardDays: 2, expressDays: 1 },
  '411001': { city: 'Pune Station, Pune', state: 'Maharashtra', tier: 1, standardDays: 2, expressDays: 1 },
  '380001': { city: 'Ahmedabad GPO', state: 'Gujarat', tier: 1, standardDays: 2, expressDays: 1 },
  '302001': { city: 'Jaipur GPO', state: 'Rajasthan', tier: 2, standardDays: 3, expressDays: 2 },
  '226001': { city: 'Lucknow GPO', state: 'Uttar Pradesh', tier: 2, standardDays: 3, expressDays: 2 },
  '201301': { city: 'Noida Sector 1', state: 'Uttar Pradesh', tier: 1, standardDays: 2, expressDays: 1 },
  '122001': { city: 'Gurugram Central', state: 'Haryana', tier: 1, standardDays: 2, expressDays: 1 },
  '160017': { city: 'Chandigarh Sector 17', state: 'Chandigarh', tier: 2, standardDays: 3, expressDays: 2 },
  '682001': { city: 'Kochi GPO', state: 'Kerala', tier: 2, standardDays: 3, expressDays: 2 },
  '452001': { city: 'Indore GPO', state: 'Madhya Pradesh', tier: 2, standardDays: 3, expressDays: 2 },
};

// Region prefix fallback mapping for unknown pincodes (India Postal Circles)
const POSTAL_CIRCLE_PREFIXES = {
  '11': { state: 'Delhi', city: 'Delhi NCR', tier: 1 },
  '12': { state: 'Haryana', city: 'Haryana Region', tier: 2 },
  '13': { state: 'Haryana', city: 'Haryana Region', tier: 2 },
  '14': { state: 'Punjab', city: 'Punjab Region', tier: 2 },
  '15': { state: 'Punjab', city: 'Punjab Region', tier: 2 },
  '16': { state: 'Chandigarh', city: 'Chandigarh', tier: 2 },
  '17': { state: 'Himachal Pradesh', city: 'Shimla Region', tier: 3 },
  '18': { state: 'Jammu & Kashmir', city: 'Jammu Region', tier: 3 },
  '19': { state: 'Jammu & Kashmir', city: 'Srinagar Region', tier: 3 },
  '20': { state: 'Uttar Pradesh', city: 'Western UP', tier: 2 },
  '21': { state: 'Uttar Pradesh', city: 'Central UP', tier: 2 },
  '22': { state: 'Uttar Pradesh', city: 'Lucknow Region', tier: 2 },
  '24': { state: 'Uttarakhand', city: 'Dehradun Region', tier: 3 },
  '25': { state: 'Uttar Pradesh', city: 'Meerut Region', tier: 2 },
  '28': { state: 'Uttar Pradesh', city: 'Agra Region', tier: 2 },
  '30': { state: 'Rajasthan', city: 'Jaipur Region', tier: 2 },
  '31': { state: 'Rajasthan', city: 'Udaipur Region', tier: 3 },
  '34': { state: 'Rajasthan', city: 'Jodhpur Region', tier: 3 },
  '36': { state: 'Gujarat', city: 'Rajkot Region', tier: 2 },
  '38': { state: 'Gujarat', city: 'Ahmedabad Region', tier: 1 },
  '39': { state: 'Gujarat', city: 'Surat / Vadodara', tier: 2 },
  '40': { state: 'Maharashtra', city: 'Mumbai Region', tier: 1 },
  '41': { state: 'Maharashtra', city: 'Pune Region', tier: 1 },
  '42': { state: 'Maharashtra', city: 'Nashik Region', tier: 2 },
  '44': { state: 'Maharashtra', city: 'Nagpur Region', tier: 2 },
  '45': { state: 'Madhya Pradesh', city: 'Indore Region', tier: 2 },
  '46': { state: 'Madhya Pradesh', city: 'Bhopal Region', tier: 2 },
  '49': { state: 'Chhattisgarh', city: 'Raipur Region', tier: 3 },
  '50': { state: 'Telangana', city: 'Hyderabad Region', tier: 1 },
  '51': { state: 'Andhra Pradesh', city: 'Tirupati Region', tier: 3 },
  '52': { state: 'Andhra Pradesh', city: 'Vijayawada Region', tier: 2 },
  '53': { state: 'Andhra Pradesh', city: 'Visakhapatnam', tier: 2 },
  '56': { state: 'Karnataka', city: 'Bengaluru Region', tier: 1 },
  '57': { state: 'Karnataka', city: 'Mangaluru / Mysuru', tier: 2 },
  '60': { state: 'Tamil Nadu', city: 'Chennai Region', tier: 1 },
  '62': { state: 'Tamil Nadu', city: 'Madurai Region', tier: 2 },
  '64': { state: 'Tamil Nadu', city: 'Coimbatore Region', tier: 2 },
  '67': { state: 'Kerala', city: 'Calicut Region', tier: 2 },
  '68': { state: 'Kerala', city: 'Kochi Region', tier: 2 },
  '69': { state: 'Kerala', city: 'Thiruvananthapuram', tier: 2 },
  '70': { state: 'West Bengal', city: 'Kolkata Region', tier: 1 },
  '75': { state: 'Odisha', city: 'Bhubaneswar Region', tier: 2 },
  '78': { state: 'Assam', city: 'Guwahati Region', tier: 3 },
  '80': { state: 'Bihar', city: 'Patna Region', tier: 2 },
  '83': { state: 'Jharkhand', city: 'Ranchi Region', tier: 2 },
};

export const DEFAULT_PINCODE = '560103';

/**
 * Validates a 6-digit Indian Postal Code
 */
export function isValidPincode(pincode) {
  if (!pincode) return false;
  const cleaned = String(pincode).trim();
  return /^[1-9][0-9]{5}$/.test(cleaned);
}

/**
 * Get geographic details and shipping serviceability for a pincode
 */
export function getPincodeInfo(pincode) {
  const code = String(pincode || DEFAULT_PINCODE).trim();

  if (!isValidPincode(code)) {
    return {
      valid: false,
      pincode: code,
      error: 'Please enter a valid 6-digit Indian PIN code',
    };
  }

  // Exact match
  if (KNOWN_PINCODES[code]) {
    const info = KNOWN_PINCODES[code];
    return {
      valid: true,
      pincode: code,
      city: info.city,
      state: info.state,
      tier: info.tier,
      standardDays: info.standardDays,
      expressDays: info.expressDays,
      codAvailable: true,
      expressAvailable: true,
      freeShippingEligible: true,
      courierPartner: 'BlueDart Express & Delhivery Air',
    };
  }

  // Prefix match
  const prefix = code.slice(0, 2);
  const circle = POSTAL_CIRCLE_PREFIXES[prefix] || {
    state: 'India',
    city: 'Direct Service Area',
    tier: 2,
  };

  const isTier1 = circle.tier === 1;
  const isTier3 = circle.tier === 3;

  return {
    valid: true,
    pincode: code,
    city: circle.city,
    state: circle.state,
    tier: circle.tier,
    standardDays: isTier1 ? 2 : isTier3 ? 5 : 3,
    expressDays: isTier1 ? 1 : isTier3 ? 3 : 2,
    codAvailable: true,
    expressAvailable: !isTier3,
    freeShippingEligible: true,
    courierPartner: isTier1 ? 'BlueDart Express' : 'Delhivery Logistics',
  };
}

/**
 * Calculates delivery date object based on days from reference date
 */
export function calculateDeliveryDate(daysToAdd = 2, baseDate = new Date()) {
  const result = new Date(baseDate);
  let added = 0;

  // Add days skipping Sundays if desirable, or standard business days
  while (added < daysToAdd) {
    result.setDate(result.getDate() + 1);
    // If Sunday (0), we can still deliver via express air or skip
    if (result.getDay() !== 0) {
      added++;
    } else if (daysToAdd === 1) {
      // If next day is Sunday, standard courier delivers Monday
      added++;
    }
  }

  return result;
}

/**
 * Format date for e-commerce delivery display
 * e.g., "Wednesday, 4 Nov" or "Tomorrow, 31 Oct"
 */
export function formatDeliveryDate(date, isRelative = true) {
  if (!date) return '';
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  const formattedStandard = d.toLocaleDateString('en-IN', options);

  if (isRelative) {
    if (diffDays === 0) return `Today, ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    if (diffDays === 1) return `Tomorrow, ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    if (diffDays === 2) return `In 2 days (${formattedStandard})`;
  }

  return formattedStandard;
}

/**
 * Get full delivery timeline quotes for a pincode
 */
export function getDeliveryQuotes(pincode, baseDate = new Date()) {
  const info = getPincodeInfo(pincode);
  if (!info.valid) return null;

  const standardDate = calculateDeliveryDate(info.standardDays, baseDate);
  const expressDate = calculateDeliveryDate(info.expressDays, baseDate);

  return {
    pincode: info.pincode,
    city: info.city,
    state: info.state,
    codAvailable: info.codAvailable,
    courierPartner: info.courierPartner,
    standard: {
      days: info.standardDays,
      date: standardDate,
      formattedDate: formatDeliveryDate(standardDate),
      price: 0, // Free for standard orders over threshold
      label: 'Standard Delivery',
      sublabel: 'Free with Nexora Express',
    },
    express: {
      days: info.expressDays,
      date: expressDate,
      formattedDate: formatDeliveryDate(expressDate),
      price: 99,
      available: info.expressAvailable,
      label: 'Priority Lightning Delivery',
      sublabel: 'Guaranteed fastest air transit',
    },
  };
}

/**
 * Get saved pincode from localStorage
 */
export function getStoredPincode() {
  try {
    const saved = localStorage.getItem('nexora_delivery_pincode');
    if (saved && isValidPincode(saved)) {
      return saved;
    }
  } catch (e) {
    console.warn('Storage read warning:', e);
  }
  return DEFAULT_PINCODE;
}

/**
 * Save pincode to localStorage
 */
export function setStoredPincode(pincode) {
  if (isValidPincode(pincode)) {
    try {
      localStorage.setItem('nexora_delivery_pincode', String(pincode).trim());
    } catch (e) {
      console.warn('Storage write warning:', e);
    }
  }
}

/**
 * Generate simulated AWB tracking number & OTP
 */
export function generateTrackingInfo(orderId) {
  const num = (orderId || '').replace(/[^0-9]/g, '') || String(Math.floor(1000 + Math.random() * 9000));
  return {
    awbNumber: `NEX-BD-982${num.slice(-4)}`,
    courierName: 'BlueDart Express Air',
    deliveryOtp: String(1000 + (parseInt(num, 10) * 17) % 9000).padStart(4, '7'),
    deliveryAgent: {
      name: 'Ramesh Kumar',
      phone: '+91 98765 12345',
      rating: 4.9,
      vehicle: 'Electric Delivery Van (KA-03-EX-2026)',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  };
}
