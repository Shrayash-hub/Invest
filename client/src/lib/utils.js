import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * @param  {...string} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency with T/B/M suffixes.
 * @param {number|null|undefined} value
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(value, currency = "USD") {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const symbol = currency === "INR" ? "₹" : "$";

  if (abs >= 1e12) return `${sign}${symbol}${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${sign}${symbol}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${symbol}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}${symbol}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${symbol}${abs.toFixed(2)}`;
}

/**
 * Format a ratio as percentage.
 * @param {number|null|undefined} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a plain number.
 * @param {number|null|undefined} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";
  return value.toFixed(decimals);
}

/**
 * Get sentiment label from score (-1 to 1).
 * @param {number|null} score
 * @returns {string}
 */
export function getSentimentLabel(score) {
  if (score === null || score === undefined) return "Unknown";
  if (score <= -0.6) return "Very Negative";
  if (score <= -0.2) return "Negative";
  if (score <= 0.2) return "Neutral";
  if (score <= 0.6) return "Positive";
  return "Very Positive";
}

/**
 * Format elapsed time from start timestamp.
 * @param {number} startTime
 * @param {number} endTime
 * @returns {string}
 */
export function formatElapsed(startTime, endTime) {
  if (!startTime) return "";
  const seconds = ((endTime ?? Date.now()) - startTime) / 1000;
  return `${seconds.toFixed(1)}s`;
}

/**
 * Format relative timestamp from research start.
 * @param {number} eventTimestamp
 * @param {number} startTime
 * @returns {string}
 */
export function formatRelativeTime(eventTimestamp, startTime) {
  if (!startTime || !eventTimestamp) return "+0.0s";
  const diff = (eventTimestamp - startTime) / 1000;
  return `+${diff.toFixed(1)}s`;
}
