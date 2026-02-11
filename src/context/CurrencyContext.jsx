import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CURRENCY_STORAGE_KEY = "onesim_currency";

const CurrencyContext = createContext({
  currency: "UZS",
  setCurrency: () => {}
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    return stored === "USD" ? "USD" : "UZS";
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
