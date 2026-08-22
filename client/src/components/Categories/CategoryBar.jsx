import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useShopCategories } from '../../hooks/useShopCategories.js';
import { categoryControlClass, categoryToolbarClass } from '../../utils/categoryControlStyles.js';

export default function CategoryBar({ compact = false }) {
  const shopCategories = useShopCategories();
  const pinTriggerRef = useRef(null);
  const pinPanelRef = useRef(null);
  const navRef = useRef(null);
  const pinnedRef = useRef(false);
  const pinAnimationReadyRef = useRef(false);
  const pointerFrameRef = useRef(0);
  const { pathname, search } = useLocation();
  const [isPinned, setIsPinned] = useState(false);
  const department = new URLSearchParams(search).get('department');
  const searchCategory = new URLSearchParams(search).get('category') || 'all';
  const selectedKey = pathname === '/search' ? searchCategory : new URLSearchParams(search).get('category') || department || (pathname === '/cakes' ? 'cakes' : pathname === '/paties' ? 'pastries' : null);
  const barCategories=shopCategories.filter(group=>group.showInCategoryBar!==false);
  const categories = pathname === '/search'
    ? [{ key: 'all', label: 'All', to: '/search' }, ...barCategories.map(group => ({ ...group, to: `/search?category=${encodeURIComponent(group.key)}` }))]
    : barCategories;

  useEffect(() => {
    const trigger = pinTriggerRef.current;
    if (!trigger) return undefined;

    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const pinThreshold = rootFontSize * 5;
    const observer = new IntersectionObserver(([entry]) => {
      const shouldPin = !entry.isIntersecting && entry.boundingClientRect.top <= pinThreshold;
      if (shouldPin !== pinnedRef.current) {
        pinnedRef.current = shouldPin;
        setIsPinned(shouldPin);
      }
    }, {
      rootMargin: `-${pinThreshold}px 0px 0px 0px`,
      threshold: 0,
    });

    observer.observe(trigger);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const panel = pinPanelRef.current;
    if (!panel) return undefined;
    if (!pinAnimationReadyRef.current) {
      pinAnimationReadyRef.current = true;
      return undefined;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    gsap.fromTo(panel,
      { y: isPinned ? -12 : 8, opacity: 0.84 },
      { y: 0, opacity: 1, duration: 0.38, ease: 'power2.out', clearProps: 'transform,opacity', overwrite: true },
    );
    return () => gsap.killTweensOf(panel);
  }, [isPinned]);

  useEffect(() => {
    const nav = navRef.current;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!nav || !canHover) return undefined;

    const items = Array.from(nav.querySelectorAll('[data-category-item]'));
    const reset = () => gsap.to(items, { x: 0, scale: 1, duration: 0.3, ease: 'power2.out', overwrite: true });
    const move = event => {
      if(pointerFrameRef.current)return;
      const pointerX=event.clientX;
      pointerFrameRef.current=requestAnimationFrame(()=>{
      pointerFrameRef.current=0;
      const radius = 150;
      items.forEach(item => {
        const bounds = item.getBoundingClientRect();
        const distance = bounds.left + bounds.width / 2 - pointerX;
        const proximity = Math.max(0, 1 - Math.abs(distance) / radius);
        const influence = Math.sin(proximity * Math.PI / 2);
        gsap.to(item, {
          x: Math.sign(distance) * 18 * influence,
          scale: 1 + 0.55 * influence,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: true,
        });
      });
      });
    };

    gsap.set(items, { transformOrigin: '50% 100%' });
    nav.addEventListener('pointermove', move);
    nav.addEventListener('pointerleave', reset);
    return () => {
      nav.removeEventListener('pointermove', move);
      nav.removeEventListener('pointerleave', reset);
      gsap.killTweensOf(items);
      gsap.set(items, { clearProps: 'transform,transformOrigin' });
      cancelAnimationFrame(pointerFrameRef.current);
    };
  }, [categories]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;
    const horizontalWheel = event => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || nav.scrollWidth <= nav.clientWidth) return;
      event.preventDefault();
      nav.scrollLeft += event.deltaY;
    };
    nav.addEventListener('wheel', horizontalWheel, { passive: false });
    return () => nav.removeEventListener('wheel', horizontalWheel);
  }, [categories]);

  const categoryNav = <nav ref={navRef} aria-label="Shop categories" className={categoryToolbarClass}>
    <div className="flex w-max min-w-full items-end justify-center gap-2">
      {categories.map(group => <Link data-category-item key={group.key} to={group.to} className={categoryControlClass(selectedKey === group.key)}>
        {group.label}
      </Link>)}
    </div>
  </nav>;

  return <section className={`relative bg-bakery text-bakery ${compact ? 'px-4 py-4 md:px-6' : 'px-3 py-6 md:px-6 md:py-8'}`}>
    <div aria-hidden="true" className="absolute left-[8%] top-[12%] h-48 w-48 rounded-full bg-gold/20 blur-3xl"/>
    <div aria-hidden="true" className={`absolute inset-x-3 rounded-[30px] border border-white/35 bg-[#f6e7bd]/58 shadow-[0_24px_65px_rgba(20,3,1,.38)] backdrop-blur-2xl md:inset-x-6 ${compact ? 'inset-y-2' : 'inset-y-4'}`}/>
    {!compact && <div className="relative z-[1] mx-auto max-w-[1440px] px-2 py-8 md:px-[5vw] md:py-12"><div className="flex flex-col justify-between gap-5 border-b border-[#9c6c32]/35 pb-8 md:flex-row md:items-end"><div><p className="eyebrow text-[#8f4a14]">My New Bakery</p><h2 className="section-heading text-[#3b0e06]">Shop by category</h2></div><p className="max-w-sm text-sm leading-6 text-[#79522e]">Choose a bakery favourite, then explore its fresh flavours and made-to-order options.</p></div></div>}
    <div ref={pinTriggerRef} aria-hidden="true" className="relative z-[1] h-px" />
    <div className={`${compact ? '' : 'mt-1'} relative z-[1] h-[82px]`}>
      <div ref={pinPanelRef} className={`${isPinned ? 'fixed inset-x-0 top-[var(--site-nav-offset,0px)] z-[35] border-b border-white/25 bg-[#2c0903]/58 py-3 shadow-[0_16px_38px_rgba(20,3,1,.4)] backdrop-blur-2xl will-change-[top,transform]' : 'absolute inset-x-0 top-0 border-b border-transparent bg-transparent py-3 shadow-none backdrop-blur-none'} transition-[top,background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out`}>
        <div className="px-5 md:px-[6vw]">{categoryNav}</div>
      </div>
    </div>
  </section>;
}
