/**
 * Currency Service - Fetches USD to UZS exchange rate from Central Bank of Uzbekistan (CBU)
 * - Fetches daily exchange rate from CBU API
 * - Caches rate for 24 hours in localStorage
 * - Applies 1% markup on top of official rate
 * - Fallback rate: 12800 UZS/USD
 */

const CBU_API_BASE = 'https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD';

const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/raw?url=',
];

const CACHE_KEY = 'cbu_exchange_rate';
const CACHE_TIMESTAMP_KEY = 'cbu_exchange_rate_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const FALLBACK_RATE = 12800;
const MARKUP = 1.01; // 1% markup on official CBU rate

const isCacheValid = () => {
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!timestamp) return false;
  return Date.now() - parseInt(timestamp, 10) < CACHE_DURATION;
};

const getCachedRate = () => {
  if (!isCacheValid()) {
    console.log('[CurrencyService] Cache expired or not found');
    return null;
  }
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  console.log('[CurrencyService] Using cached rate:', cached);
  return parseFloat(cached);
};

const setCachedRate = (rate) => {
  localStorage.setItem(CACHE_KEY, rate.toString());
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  console.log('[CurrencyService] Rate cached:', rate);
};

const getTodayDate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const processApiResponse = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid response format from CBU API');
  }
  const officialRate = parseFloat(data[0].Rate);
  if (isNaN(officialRate) || officialRate <= 0) {
    throw new Error('Invalid exchange rate value from CBU API');
  }
  console.log('[CurrencyService] Official CBU rate:', officialRate);
  const finalRate = Math.round(officialRate * MARKUP);
  console.log('[CurrencyService] Final rate with 1% markup:', finalRate);
  setCachedRate(finalRate);
  return finalRate;
};

const fetchFromCBU = async () => {
  const url = `${CBU_API_BASE}/${getTodayDate()}/`;
  console.log('[CurrencyService] Fetching from CBU:', url);

  // Try direct first (works if no CORS restriction)
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) return processApiResponse(await res.json());
  } catch {
    console.log('[CurrencyService] Direct fetch failed, trying CORS proxies...');
  }

  // Try CORS proxies in order
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = CORS_PROXIES[i] + encodeURIComponent(url);
      console.log(`[CurrencyService] Trying proxy ${i + 1}/${CORS_PROXIES.length}...`);
      const res = await fetch(proxyUrl, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Proxy status ${res.status}`);
      return processApiResponse(await res.json());
    } catch (err) {
      console.warn(`[CurrencyService] Proxy ${i + 1} failed:`, err.message);
    }
  }

  throw new Error('All fetch methods failed');
};

/**
 * Get current USD→UZS exchange rate.
 * Returns cached value if fresh, otherwise fetches from CBU.
 * Falls back to FALLBACK_RATE if all methods fail.
 * @returns {Promise<number>}
 */
export const getExchangeRate = async () => {
  const cached = getCachedRate();
  if (cached) return cached;

  try {
    return await fetchFromCBU();
  } catch (err) {
    console.error('[CurrencyService] All fetch methods failed:', err.message);
    console.log('[CurrencyService] Using fallback rate:', FALLBACK_RATE);
    return FALLBACK_RATE;
  }
};

/**
 * Force refresh (bypasses cache).
 * @returns {Promise<number>}
 */
export const refreshExchangeRate = async () => {
  console.log('[CurrencyService] Force refreshing exchange rate...');
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  return getExchangeRate();
};

export const currencyService = { getExchangeRate, refreshExchangeRate };
export default currencyService;
