import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { api } from '../../services/api.js';

const fallbackImage = 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=900&q=90';
const shopLink = (main, sub) => `/${main.productType === 'paties' ? 'paties' : 'cakes'}?department=${encodeURIComponent(main.slug)}${sub ? `&category=${encodeURIComponent(sub.name)}` : ''}`;

export default function FavouriteCategories() {
  const root = useRef(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([api('/main-categories', { cache:'no-store' }), api('/categories', { cache:'no-store' })]).then(([mainData, subData]) => {
      const mains = (mainData.mainCategories || []).filter(main => main.isActive !== false && main.showInHomeFavourite !== false);
      const subs = (subData.categories || []).filter(sub => sub.isActive !== false);
      const visible = mains.map((main, index) => {
        const firstSubcategory = subs.find(sub => (sub.department || (sub.type === 'paties' ? 'pastries' : 'cakes')) === main.slug);
        return { key: `main-${main._id}`, title: main.name, to: shopLink(main), image: main.image || firstSubcategory?.image || fallbackImage, number: String(index + 1).padStart(2, '0') };
      });
      setCategories(visible);
    }).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const section = root.current;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!section || !canHover) return undefined;

    const list = section.querySelector('[data-favourite-list]');
    const image = section.querySelector('[data-preview]');
    const items = gsap.utils.toArray('[data-favourite]', section);
    let visible = false;
    gsap.set(image, { xPercent: -50, yPercent: -50 });
    const setX = gsap.quickTo(image, 'x', { duration: 0.38, ease: 'power3.out' });
    const setY = gsap.quickTo(image, 'y', { duration: 0.32, ease: 'power3.out' });
    const fade = gsap.to(image, { autoAlpha: 1, scale: 1, duration: 0.16, ease: 'power2.out', paused: true });

    const coordinates = (item, event) => {
      const rowBounds = item.getBoundingClientRect();
      const listBounds = list.getBoundingClientRect();
      const halfWidth = image.offsetWidth / 2;
      const rowLeft = rowBounds.left - listBounds.left;
      const minX = rowLeft + halfWidth + 12;
      const maxX = rowLeft + rowBounds.width - halfWidth - 12;
      const pointerX = event.clientX - listBounds.left;
      const pointerY = event.clientY - listBounds.top;
      return {
        x: minX <= maxX ? gsap.utils.clamp(minX, maxX, pointerX) : rowLeft + rowBounds.width / 2,
        y: pointerY,
      };
    };

    const cleanups = items.map(item => {
      const move = event => {
        const { x, y } = coordinates(item, event);
        setX(x);
        setY(y);
      };
      const enter = event => {
        const { x, y } = coordinates(item, event);
        image.src = item.dataset.previewSrc;
        if (!visible) {
          gsap.set(image, { x, y });
          fade.play();
          visible = true;
        } else {
          setX(x);
          setY(y);
        }
      };
      item.addEventListener('pointerenter', enter);
      item.addEventListener('pointermove', move);
      return () => {
        item.removeEventListener('pointerenter', enter);
        item.removeEventListener('pointermove', move);
      };
    });
    const leaveList = () => { visible = false; fade.reverse(); };
    list.addEventListener('pointerleave', leaveList);

    return () => {
      cleanups.forEach(cleanup => cleanup());
      list.removeEventListener('pointerleave', leaveList);
      fade.kill();
      gsap.killTweensOf(image);
    };
  }, [categories]);

  return <section ref={root} className="content-auto relative isolate bg-bakery px-3 py-6 text-bakery md:px-6 md:py-8">
    <div aria-hidden="true" className="absolute bottom-[8%] right-[7%] h-64 w-64 rounded-full bg-cream/20 blur-3xl"/>
    <div data-reveal className="relative z-[1] rounded-[30px] border border-white/30 bg-[#ead8ad] px-6 py-24 shadow-[0_24px_65px_rgba(20,3,1,.38)] md:px-[8vw] md:py-32">
      <p className="eyebrow text-[#8f4a14]">Shop by favourite</p>
      <h2 className="max-w-4xl font-display text-5xl leading-[.95] tracking-[-.055em] md:text-7xl">Cakes for memories.<br/><em className="font-normal text-[#9b5b13]">Patties for every day.</em></h2>
      <div data-favourite-list className="relative mt-14 border-t border-[#d9bd7c]">
      <img data-preview className="invisible absolute left-0 top-0 z-50 h-[165px] w-[230px] scale-95 border-2 border-gold object-cover opacity-0 shadow-[0_18px_40px_rgba(44,9,3,.32)] pointer-events-none md:h-[300px] md:w-[280px]" src={categories[0]?.image} alt=""/>
      {categories.map(({ number, title, to, image, key }) => <Link data-favourite data-preview-src={image} key={key} to={to} className="relative grid grid-cols-[55px_1fr_auto] items-center border-b border-[#d9bd7c] py-6 font-display text-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8f4a14] md:text-5xl">
        <b className="font-body text-[10px] tracking-[.15em]">{number}</b>
        <span>{title}</span>
        <ArrowRight/>
      </Link>)}
      {!categories.length && <p className="py-8 text-sm text-[#79522e]">No favourite categories are enabled yet. Turn on a main category from the dashboard.</p>}
      </div>
    </div>
  </section>;
}
