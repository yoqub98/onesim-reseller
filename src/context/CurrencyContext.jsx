import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CURRENCY_USD, CURRENCY_UZS, FALLBACK_RATE } from "../constants/currency";
import { getExchangeRate } from "../services/currencyService";

const CURRENCY_STORAGE_KEY = "onesim_currency";

const CurrencyContext = createContext({
  currency: CURRENCY_UZS,
  setCurrency: () => {},
  exchangeRate: FALLBACK_RATE,
  isRateLoading: true
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    return stored === CURRENCY_USD ? CURRENCY_USD : CURRENCY_UZS;
  });

  const [exchangeRate, setExchangeRate] = useState(FALLBACK_RATE);
  const [isRateLoading, setIsRateLoading] = useState(true);

  useEffect(() => {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  }, [currency]);

  useEffect(() => {
    let cancelled = false;
    getExchangeRate()
      .then((rate) => {
        if (!cancelled) {
          setExchangeRate(rate);
          setIsRateLoading(false);
        }
      })
      .catch((err) => {
        console.error('[CurrencyContext] Failed to load exchange rate:', err);
        if (!cancelled) setIsRateLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(
    () => ({ currency, setCurrency, exchangeRate, isRateLoading }),
    [currency, exchangeRate, isRateLoading]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
