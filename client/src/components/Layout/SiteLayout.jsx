import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar.jsx';
import CategoryBar from '../Categories/CategoryBar.jsx';
import Footer from '../Footer/Footer.jsx';
import { useSiteConfig } from '../../services/siteConfig.js';

export default function SiteLayout({children}) {
  const location = useLocation();
  const { pathname } = location;
  const isHomePage = pathname === '/';
  const config = useSiteConfig();

  useEffect(() => {
    const seo = config.seoContent || {};
    const bakeryName = config.bakeryName || 'My New Bakery';
    const pageNames = {
      '/cakes': 'Cakes', '/paties': 'Pastries', '/search': 'Search', '/review': 'Customer Reviews',
      '/cart': 'Shopping Bag', '/checkout': 'Checkout', '/custom-cake': 'Custom Cakes',
      '/custom-cake-requests': 'Custom Cake Requests', '/orders': 'My Orders', '/profile': 'My Profile',
      '/about': 'About Us', '/contact': 'Contact Us', '/login': 'Login', '/register': 'Create Account'
    };
    const defaultTitle = seo.title || `${bakeryName} | Freshly Baked for Every Celebration`;
    const pageName = pathname.startsWith('/products/') ? 'Product Details' : pageNames[pathname];
    const title = pathname === '/' || !pageName ? defaultTitle : `${pageName} | ${bakeryName}`;
    const description = seo.description || `Discover freshly baked cakes, pastries and custom creations at ${bakeryName}, Hyderabad—made with care for birthdays, weddings and everyday moments.`;
    document.title = title;
    const updateMeta = (attribute, name, content) => {
      if (!content) return;
      let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, name); document.head.appendChild(element); }
      element.content = content;
    };
    updateMeta('name', 'description', description);
    updateMeta('name', 'keywords', seo.keywords);
    updateMeta('property', 'og:title', title);
    updateMeta('property', 'og:description', description);
    updateMeta('property', 'og:type', 'website');
    updateMeta('property', 'og:url', window.location.href);
    updateMeta('name', 'twitter:card', 'summary_large_image');
    updateMeta('name', 'twitter:title', title);
    updateMeta('name', 'twitter:description', description);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}${pathname}`;
  }, [config.bakeryName, config.seoContent, pathname]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.key]);

  return <><Navbar/>{!isHomePage && <CategoryBar compact/>}{children}<Footer/></>;
}
