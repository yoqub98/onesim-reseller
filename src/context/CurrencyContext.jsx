import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CURRENCY_USD, CURRENCY_UZS } from "../constants/currency";

const CURRENCY_STORAGE_KEY = "onesim_currency";

const CurrencyContext = createContext({
  currency: CURRENCY_UZS,
  setCurrency: () => {}
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    return stored === CURRENCY_USD ? CURRENCY_USD : CURRENCY_UZS;
  });

  useEffect(() => {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  }, [currency]);

  const value = useMemo(() => ({ currency, setCurrency }), [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
