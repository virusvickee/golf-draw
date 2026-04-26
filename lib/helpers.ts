// ============================================================================
// Shared Helper Utilities
// ============================================================================

/**
 * Format a number as currency (GBP by default).
 */
export function formatCurrency(amount: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format an ISO date string to a readable format.
 */
export function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaults: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  };
  return new Date(dateString).toLocaleDateString("en-GB", defaults);
}

/**
 * Clamp a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a human-readable draw month label, e.g. "April 2026".
 */
export function drawMonthLabel(monthDate: string): string {
  return new Date(monthDate).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Absolute URL builder for API routes and redirects.
 */
export function getURL(path = ""): string {
  let url =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";

  // Ensure protocol
  url = url.startsWith("http") ? url : `https://${url}`;
  // Ensure trailing slash
  url = url.endsWith("/") ? url : `${url}/`;
  // Remove leading slash from path
  path = path.startsWith("/") ? path.substring(1) : path;

  return `${url}${path}`;
}
