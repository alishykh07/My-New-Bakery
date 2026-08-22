import { useEffect, useState } from 'react';
import { api } from './api.js';

const STORAGE_KEY = 'mnb-site-config-v1';
const fallback = {
  bakeryName: 'My New Bakery',
  email: 'hello@mynewbakery.pk',
  phone: '+92 300 0000000',
  heroTitle: 'Every celebration deserves a little magic.',
  heroDescription: 'Handcrafted cakes, birthday dreams and golden little bites—made just the way you imagine them.',
  heroImage: '/images/cakes/wedding-hero.png',
  deliveryFee: 250,
  freeDeliveryThreshold: 3000,
  deliveryAreas: [],
  pickupAvailable: true,
  paymentMethods: ['cash_on_delivery', 'bank_transfer']
};

function readSavedConfig() {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
  } catch {
    return fallback;
  }
}

let cached = readSavedConfig();

export function useSiteConfig() {
  const [config, setConfig] = useState(cached);

  useEffect(() => {
    let active = true;
    const load = () => api('/site-config', { cache: 'no-store' })
      .then((response) => {
        const next = { ...fallback, ...(response.config || {}) };
        cached = next;
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(response.config || {}));
        } catch {
          // Storage failure must not stop the website from rendering.
        }
        if (active) setConfig(next);
      })
      .catch(() => {});

    load();
    window.addEventListener('focus', load);
    return () => {
      active = false;
      window.removeEventListener('focus', load);
    };
  }, []);

  return config;
}
