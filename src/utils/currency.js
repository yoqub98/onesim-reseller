import {
  CURRENCY_USD,
  CURRENCY_UZS,
  USD_TO_UZS_RATE
} from "../constants/currency";

function formatUzsNumber(value) {
  return Number(value || 0).toLocaleString("ru-RU").replace(/,/g, " ");
}

export function formatMoneyFromUsd(usdAmount, currency) {
  if (currency === CURRENCY_USD) {
    return `$${Number(usdAmount || 0).toFixed(2)}`;
  }

  return `${formatUzsNumber(Number(usdAmount || 0) * USD_TO_UZS_RATE)} ${CURRENCY_UZS}`;
}

export function formatMoneyFromUzs(uzsAmount, currency) {
  if (currency === CURRENCY_USD) {
    return `$${(Number(uzsAmount || 0) / USD_TO_UZS_RATE).toFixed(2)}`;
  }

  return `${formatUzsNumber(uzsAmount)} ${CURRENCY_UZS}`;
}

export function formatMoneyPartsFromUzs(uzsAmount, currency) {
  if (currency === CURRENCY_USD) {
    return {
      amount: `${(Number(uzsAmount || 0) / USD_TO_UZS_RATE).toFixed(2)}`,
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
