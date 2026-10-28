/**
 * Format numeric value as Indian Rupee (INR)
 */
export function formatPrice(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num || 0);
}

/**
 * Calculate discount percentage from price and compareAtPrice
 */
export function calculateDiscount(price, compareAtPrice) {
  if (!compareAtPrice || Number(compareAtPrice) <= Number(price)) return 0;
  const p = Number(price);
  const cp = Number(compareAtPrice);
  return Math.round(((cp - p) / cp) * 100);
}

/**
 * Format ISO date string into readable Indian standard format
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
