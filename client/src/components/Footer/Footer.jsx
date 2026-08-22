import { Ghost, Mail, MessageCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { useSiteConfig } from '../../services/siteConfig.js';

function externalUrl(value, type) {
  if (!value) return '';
  if (type === 'email') return String(value).startsWith('mailto:') ? value : `mailto:${value}`;
  if (/^https?:\/\//i.test(value)) return value;
  if (type === 'whatsapp') return `https://wa.me/${String(value).replace(/\D/g, '')}`;
  return `https://${value}`;
}

function InstagramIcon({ size = 19 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.4" cy="6.7" r="1" fill="currentColor"/></svg>;
}

function FacebookIcon({ size = 19 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.7 21v-8h2.8l.42-3.14H13.7v-2c0-.91.27-1.53 1.62-1.53H17V3.52c-.29-.04-1.29-.12-2.45-.12-2.43 0-4.1 1.44-4.1 4.1v2.36H7.7V13h2.75v8h3.25Z"/></svg>;
}

function XIcon({ size = 19 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.24 2H21l-6.03 6.9L22 22h-5.5l-4.3-5.62L7.28 22H4.51l6.4-7.32L4.17 2h5.64l3.9 5.15L18.24 2Zm-.97 17.7h1.53L8.98 4.18H7.34L17.27 19.7Z"/></svg>;
}

function TikTokIcon({ size = 19 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.3 2h3.05c.23 1.87 1.28 3.25 3.15 3.72v3.1a8.1 8.1 0 0 1-3.12-.84v6.58a7 7 0 1 1-6.05-6.94v3.16a3.87 3.87 0 1 0 2.97 3.78V2Z"/></svg>;
}

function PinterestIcon({ size = 19 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.65 19.3c-.08-1.7-.02-3.74.43-5.66l1.29-5.45s-.32-.66-.32-1.63c0-1.53.88-2.67 1.99-2.67.94 0 1.39.7 1.39 1.55 0 .94-.6 2.35-.91 3.66-.26 1.09.55 1.98 1.62 1.98 1.94 0 3.43-2.05 3.43-5.01 0-2.62-1.88-4.45-4.57-4.45-3.11 0-4.94 2.33-4.94 4.75 0 .94.36 1.95.82 2.5.09.11.1.2.08.32l-.31 1.27c-.05.21-.16.26-.37.16-1.38-.64-2.24-2.66-2.24-4.28 0-3.49 2.53-6.69 7.3-6.69 3.83 0 6.81 2.73 6.81 6.38 0 3.8-2.4 6.86-5.72 6.86-1.12 0-2.17-.58-2.53-1.27l-.69 2.62c-.25.96-.92 2.16-1.37 2.9.98.3 2.01.46 3.08.46A10 10 0 0 0 12 2Z"/></svg>;
}

function YouTubeIcon({ size = 19 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 12s0-3.4-.44-5.04a3 3 0 0 0-2.12-2.12C18.88 4.4 12 4.4 12 4.4s-6.88 0-8.44.44a3 3 0 0 0-2.12 2.12C1 8.5 1 12 1 12s0 3.5.44 5.04a3 3 0 0 0 2.12 2.12c1.56.44 8.44.44 8.44.44s6.88 0 8.44-.44a3 3 0 0 0 2.12-2.12C23 15.5 23 12 23 12Zm-13.2 3.25v-6.5L15.55 12 9.8 15.25Z"/></svg>;
}

function LinkedInIcon({ size = 19 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5.34 7.65H1.76V22h3.58V7.65ZM3.55 2A2.07 2.07 0 1 0 3.55 6.14 2.07 2.07 0 0 0 3.55 2ZM22 13.77c0-4.32-2.3-6.33-5.38-6.33-2.48 0-3.59 1.37-4.21 2.32V7.65H8.83V22h3.58v-7.1c0-1.87.36-3.69 2.68-3.69 2.29 0 2.32 2.14 2.32 3.81V22H22v-8.23Z"/></svg>;
}

export default function Footer() {
  const config = useSiteConfig();
  const bakeryName = config.bakeryName || 'My New Bakery';
  const footer = config.footerContent || {};
  const footerSocials = footer.socialLinks || config.socialLinks || {};
  const footerColumns = footer.columns || [
    { heading: 'Shop', links: [{label:'Cakes',url:'/cakes'},{label:'Pastries',url:'/paties'},{label:'Custom cakes',url:'/custom-cake'}] },
    { heading: 'Explore', links: [{label:'About us',url:'/about'},{label:'Contact',url:'/contact'},{label:'Leave a review',url:'/review'}] },
    { heading: 'Account', links: [{label:'My profile',url:'/profile'},{label:'My orders',url:'/orders'},{label:'Custom requests',url:'/custom-cake-requests'}] },
  ];
  const defaultSocials = [
    { name: 'Instagram', url: externalUrl(footerSocials.instagram || 'https://www.instagram.com/mynewbakeryofficial/?hl=en'), Icon: InstagramIcon },
    { name: 'Facebook', url: externalUrl(footerSocials.facebook || 'https://www.facebook.com/rdpakistan/'), Icon: FacebookIcon },
    { name: 'WhatsApp', url: externalUrl(footerSocials.whatsapp, 'whatsapp'), Icon: MessageCircle },
    { name: 'Email', url: config.email ? `mailto:${config.email}` : '', Icon: Mail },
  ];
  const iconTypes={instagram:InstagramIcon,facebook:FacebookIcon,whatsapp:MessageCircle,youtube:YouTubeIcon,tiktok:TikTokIcon,twitter:XIcon,linkedin:LinkedInIcon,pinterest:PinterestIcon,snapchat:Ghost,telegram:Send,email:Mail};
  const socials=(footer.socialItems?.length?footer.socialItems.map(item=>({name:item.type?.[0]?.toUpperCase()+item.type?.slice(1),url:externalUrl(item.url,item.type),Icon:iconTypes[item.type]||MessageCircle})):defaultSocials).filter(item=>item.url);

  return <footer className="bakery-footer">
    <div className="bakery-footer__top">
      <section className="bakery-footer__intro">
        <div className="bakery-footer__identity"><img src={config.logo || '/images/logo/logo.jfif'} alt=""/><span>{bakeryName}</span></div>
        <p>{footer.description || 'Made for sweet moments, handcrafted fresh and celebrated beautifully.'}</p>
        {socials.length > 0 && <div className="bakery-footer__socials" aria-label="Social links">{socials.map(({ name, url, Icon }) => <a href={url} target={name === 'Email' ? undefined : '_blank'} rel={name === 'Email' ? undefined : 'noreferrer'} aria-label={name} key={name}><Icon size={19} strokeWidth={1.7}/></a>)}</div>}
      </section>
      {footerColumns.map((column,columnIndex) => <nav className="bakery-footer__column" aria-label={column.heading} key={`${column.heading}-${columnIndex}`}><h3>{column.heading}</h3>{(column.links||[]).map((link,linkIndex)=>/^https?:\/\//i.test(link.url||'')?<a href={link.url} target="_blank" rel="noreferrer" key={`${link.url}-${linkIndex}`}>{link.label}</a>:<Link to={link.url||'/'} key={`${link.url}-${linkIndex}`}>{link.label}</Link>)}</nav>)}
    </div>
    <div className="bakery-footer__wordmark" aria-hidden="true">{footer.wordmark || 'MY NEW BAKERY'}</div>
    <div className="bakery-footer__bottom"><span>© {(footer.copyright || '{year} {bakeryName}. All rights reserved.').replace('{year}', new Date().getFullYear()).replace('{bakeryName}', bakeryName)}</span><div><Link to="/contact">Contact</Link><Link to="/about">Our story</Link><Link to="/login">Customer login</Link></div></div>
  </footer>;
}
