import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const targets = [
  '.route-motion .page-shell > *',
  '.route-motion .contact-page > section',
  '.route-motion main:not(.page-shell):not(.about-page):not(.contact-page) > section:not(.labs-hero):not(.customer-reviews-section)',
  '.route-motion .bakery-product-card',
  '.route-motion .surface-card',
  '.route-motion .about-reasons article',
  '.route-motion .about-gallery > *',
  '.route-motion .about-numbers article',
  '.bakery-footer',
].join(',');

export default function MotionLayer() {
  const location = useLocation();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    document.documentElement.classList.add('motion-enabled');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('motion-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    const register = () => {
      document.querySelectorAll(targets).forEach((element, index) => {
        if (element.dataset.motionRegistered || element.matches('[data-about-reveal], [data-favourite], .customer-testimonial-shell')) return;
        element.dataset.motionRegistered = 'true';
        element.classList.add('motion-reveal');
        element.style.setProperty('--motion-stagger', `${Math.min(index % 7, 6) * 60}ms`);
        observer.observe(element);
      });
    };
    register();
    const mutationObserver = new MutationObserver(register);
    const root = document.getElementById('root');
    mutationObserver.observe(root, { childList: true, subtree: true });
    return () => { mutationObserver.disconnect(); observer.disconnect(); };
  }, [location.key]);

  return null;
}
