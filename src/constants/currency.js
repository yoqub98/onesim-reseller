// Currency constants
// Exchange rate is fetched dynamically from CBU (Central Bank of Uzbekistan) via currencyService.
// FALLBACK_RATE is used only when the CBU API is unreachable.

export const FALLBACK_RATE = 12800;

// Keep USD_TO_UZS_RATE as alias for backwards compatibility
export const USD_TO_UZS_RATE = FALLBACK_RATE;

export const CURRENCY_UZS = "UZS";
export const CURRENCY_USD = "USD";
