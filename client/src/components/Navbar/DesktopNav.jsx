import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useShopCategories } from '../../hooks/useShopCategories.js';

const links = [['Home', '/'], ['Custom Cake', '/custom-cake'], ['About', '/about'], ['Contact', '/contact']];

export default function DesktopNav() {
  const shopCategories = useShopCategories();
  const { pathname } = useLocation();
  const [shopOpen, setShopOpen] = useState(false);
  const suppressHoverRef = useRef(false);
  const shopIsActive = pathname === '/cakes' || pathname === '/paties';

  const closeAfterSelection = event => {
    suppressHoverRef.current = true;
    setShopOpen(false);
    event.currentTarget.blur();
  };

  return <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
    <NavLink to="/" className={({ isActive }) => `text-[10px] font-bold tracking-[0.12em] uppercase transition hover:text-gold ${isActive ? 'text-gold' : 'text-cream'}`}>Home</NavLink>

    <div className="relative" onMouseEnter={() => { if (!suppressHoverRef.current) setShopOpen(true); }} onMouseLeave={() => { suppressHoverRef.current = false; setShopOpen(false); }} onFocus={() => setShopOpen(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setShopOpen(false); }}>
      <button type="button" aria-haspopup="true" aria-expanded={shopOpen} onClick={() => setShopOpen(value => !value)} className={`flex items-center gap-1 py-7 text-[10px] font-bold tracking-[0.12em] uppercase transition hover:text-gold focus-visible:text-gold focus-visible:outline-none ${shopIsActive ? 'text-gold' : 'text-cream'}`}>
        Shop <ChevronDown size={13} className={`transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`}/>
      </button>
      <div className={`absolute left-1/2 top-[calc(100%-10px)] w-[520px] -translate-x-1/2 border border-cream/15 bg-[#3b0e06] p-5 shadow-[0_20px_45px_rgba(20,3,1,.4)] transition duration-200 ${shopOpen ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible translate-y-2 opacity-0'}`}>
        <p className="mb-4 border-b border-cream/15 pb-3 text-[9px] font-extrabold tracking-[.18em] text-gold uppercase">Shop all categories</p>
        <div className="grid grid-cols-2 gap-2">
          {shopCategories.filter(category=>category.showInTopNavigation!==false).map(category => <Link key={category.key} to={category.to} onClick={closeAfterSelection} className="group/link flex items-center justify-between border border-transparent px-3 py-3 text-xs font-bold tracking-[.08em] text-cream uppercase transition hover:border-gold/50 hover:bg-bakery hover:text-gold focus-visible:border-gold focus-visible:bg-bakery focus-visible:text-gold focus-visible:outline-none">
            {category.label}<span className="translate-x-0 opacity-50 transition group-hover/link:translate-x-1 group-hover/link:opacity-100">→</span>
          </Link>)}
        </div>
      </div>
    </div>

    {links.slice(1).map(([label, to]) => <NavLink key={to} to={to} className={({ isActive }) => `text-[10px] font-bold tracking-[0.12em] uppercase transition hover:text-gold ${isActive ? 'text-gold' : 'text-cream'}`}>{label}</NavLink>)}
  </nav>;
}
