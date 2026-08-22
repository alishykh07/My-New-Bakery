import { useEffect } from 'react';

// Keeps the first render behind the loader until the browser has painted the app.
export default function InitialLoader() {
  useEffect(() => {
    const reveal = () => {
      const finish = () => {
        document.documentElement.classList.add('app-ready');
        const loader = document.getElementById('app-loader');
        if (!loader) return;
        loader.classList.add('is-leaving');
        window.setTimeout(() => loader.remove(), 420);
      };
      window.setTimeout(finish, 260);
    };

    if (document.readyState === 'complete') reveal();
    else window.addEventListener('load', reveal, { once: true });
  }, []);

  return null;
}
