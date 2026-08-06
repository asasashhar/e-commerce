import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type CurrencyCode = 'USD' | 'PKR' | 'EUR' | 'GBP';

interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // relative to USD
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', symbol: '$',  label: 'USD — US Dollar',        rate: 1 },
  { code: 'PKR', symbol: '₨', label: 'PKR — Pakistani Rupee',  rate: 278.5 },
  { code: 'EUR', symbol: '€',  label: 'EUR — Euro',             rate: 0.92 },
  { code: 'GBP', symbol: '£',  label: 'GBP — British Pound',    rate: 0.79 },
];

interface CurrencyContextValue {
  currency: CurrencyOption;
  setCurrency: (code: CurrencyCode) => void;
  format: (usdPrice: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<CurrencyCode>('USD');

  const value = useMemo<CurrencyContextValue>(() => {
    const currency = CURRENCIES.find((c) => c.code === code)!;
    return {
      currency,
      setCurrency: setCode,
      format: (usdPrice: number) => {
        const converted = usdPrice * currency.rate;
        if (code === 'PKR') {
          return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
        }
        return `${currency.symbol}${converted.toFixed(2)}`;
      },
    };
  }, [code]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
