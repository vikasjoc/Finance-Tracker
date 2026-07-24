/**
 * Currency formatting utilities.
 * Centralizes all currency display logic so we don't
 * repeat toLocaleString('en-IN') a hundred times.
 */

const LOCALE = 'en-IN';
const CURRENCY = 'INR';

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatWithSign(amount, type) {
  const formatted = formatCurrency(amount);
  if (type === 'income') return `+${formatted}`;
  if (type === 'expense') return `-${formatted}`;
  return formatted;
}

export function parseIndianNumber(value) {
  // Remove non-numeric chars except decimal
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

