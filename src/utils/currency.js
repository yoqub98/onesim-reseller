export const USD_TO_UZS_RATE = 12800;

function formatUzsNumber(value) {
  return Number(value || 0).toLocaleString("ru-RU").replace(/,/g, " ");
}

export function formatMoneyFromUsd(usdAmount, currency) {
  if (currency === "USD") {
    return `$${Number(usdAmount || 0).toFixed(2)}`;
  }

  return `${formatUzsNumber(Number(usdAmount || 0) * USD_TO_UZS_RATE)} UZS`;
}

export function formatMoneyFromUzs(uzsAmount, currency) {
  if (currency === "USD") {
    return `$${(Number(uzsAmount || 0) / USD_TO_UZS_RATE).toFixed(2)}`;
  }

  return `${formatUzsNumber(uzsAmount)} UZS`;
}

export function formatMoneyPartsFromUzs(uzsAmount, currency) {
  if (currency === "USD") {
    return {
      amount: `${(Number(uzsAmount || 0) / USD_TO_UZS_RATE).toFixed(2)}`,
      code: "USD",
      prefix: "$"
    };
  }

  return {
    amount: formatUzsNumber(uzsAmount),
    code: "UZS",
    prefix: ""
  };
}
