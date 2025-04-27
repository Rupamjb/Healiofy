/**
 * Currency formatter utility for consistent price formatting
 */

/**
 * Format a number as Indian Rupees (₹)
 * @param price - The price to format
 * @returns Formatted price string with ₹ symbol
 */
export const formatCurrency = (price: number): string => {
  // Format as Indian Rupees (₹)
  return `₹${price.toLocaleString('en-IN')}`;
};

/**
 * Get the currency symbol
 * @returns The currency symbol (₹)
 */
export const getCurrencySymbol = (): string => {
  return '₹';
};

/**
 * Constants for currency-related values
 */
export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee'
}; 