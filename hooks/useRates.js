import { useEffect, useState } from 'react';

// Exchange rates for showing "≈ default currency" equivalents. Fetched once per page load.
let cached = null;
let inflight = null;

export default function useRates() {
  const [rates, setRates] = useState(cached);
  useEffect(() => {
    if (cached) return;
    inflight = inflight || fetch('/api/rates').then((r) => r.json()).then((d) => (cached = d.rates)).catch(() => null);
    inflight.then((r) => r && setRates(r));
  }, []);
  return rates;
}
