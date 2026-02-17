import { createContext, useContext, useEffect, useMemo, useState } from "react";
import ru from "../i18n/ru";
import uz from "../i18n/uz";

const LOCALE_STORAGE_KEY = "onesim_locale";

const dictionaries = {
  uz,
  ru
};

const LocaleContext = createContext({
  locale: "uz",
  setLocale: () => {},
  dict: uz
});

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return ["uz", "ru"].includes(stored) ? stored : "uz";
  });

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const dict = dictionaries[locale] || uz;
  const value = useMemo(() => ({ locale, setLocale, dict }), [locale, dict]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
