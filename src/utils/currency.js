import {
  CURRENCY_USD,
  CURRENCY_UZS,
  FALLBACK_RATE
} from "../constants/currency";

function formatUzsNumber(value) {
  return Number(value || 0).toLocaleString("ru-RU").replace(/,/g, " ");
}

/**
 * @param {number} usdAmount
 * @param {string} currency - CURRENCY_USD or CURRENCY_UZS
 * @param {number} [rate]   - live exchange rate (falls back to FALLBACK_RATE)
 */
export function formatMoneyFromUsd(usdAmount, currency, rate = FALLBACK_RATE) {
  if (currency === CURRENCY_USD) {
    return `$${Number(usdAmount || 0).toFixed(2)}`;
  }
  return `${formatUzsNumber(Math.round(Number(usdAmount || 0) * rate))} ${CURRENCY_UZS}`;
}

/**
 * @param {number} uzsAmount
 * @param {string} currency
 * @param {number} [rate]
 */
export function formatMoneyFromUzs(uzsAmount, currency, rate = FALLBACK_RATE) {
  if (currency === CURRENCY_USD) {
    return `$${(Number(uzsAmount || 0) / rate).toFixed(2)}`;
  }
  return `${formatUzsNumber(uzsAmount)} ${CURRENCY_UZS}`;
}

/**
 * @param {number} uzsAmount
 * @param {string} currency
 * @param {number} [rate]
 */
export function formatMoneyPartsFromUzs(uzsAmount, currency, rate = FALLBACK_RATE) {
  if (currency === CURRENCY_USD) {
    return {
      amount: `${(Number(uzsAmount || 0) / rate).toFixed(2)}`,
      code: CURRENCY_USD,
      prefix: "$"
    };
  }
  return {
    amount: formatUzsNumber(uzsAmount),
    code: CURRENCY_UZS,
    prefix: ""
  };
}
