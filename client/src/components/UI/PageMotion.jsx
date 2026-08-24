import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const selector = [
  'main.page-shell > :is(p,h1,h2,h3,form,section,div,article,aside)',
  'main.about-page > section',
  'main.contact-page > section',
  'main:not(.page-shell):not(.about-page):not(.contact-page) > section',
  '.page-shell .surface-card',
  '.page-shell [class*="grid"] > article',
  '.page-shell [class*="grid"] > div',
  '.content-auto > *',
].join(',');

export default function PageMotion() {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add('js-motion');
    const seen = new WeakSet();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-motion-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    const reveal = () => {
      [...document.querySelectorAll(selector)].forEach((element, index) => {
        if (seen.has(element) || element.matches('[data-motion-ignore]')) return;
        seen.add(element);
        element.classList.add('motion-item');
        element.style.setProperty('--motion-delay', `${Math.min(index % 8, 6) * 55}ms`);
        observer.observe(element);
      });
    };
    reveal();
    const mutations = new MutationObserver(reveal);
    mutations.observe(document.querySelector('#root'), { childList: true, subtree: true });
    return () => { mutations.disconnect(); observer.disconnect(); };
  }, [location.key]);

  return null;
}
