import { useEffect, useState } from 'react';
import { ChevronDown, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useShopCategories } from '../../hooks/useShopCategories.js';
import { useStore } from '../../context/StoreContext.jsx';

const links = [['Home', '/'], ['Custom Cake', '/custom-cake'], ['About', '/about'], ['Contact', '/contact']];

export default function MobileNav({ onClose }) {
  const shopCategories = useShopCategories();
  const { pathname } = useLocation();
  const { user } = useStore();
  const [shopOpen, setShopOpen] = useState(pathname === '/cakes' || pathname === '/paties');

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  return <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-bakery px-7 py-6">
    <div className="flex items-center justify-between border-b border-cream/15 pb-5">
      <span className="text-[10px] font-extrabold tracking-[.18em] text-gold uppercase">Menu</span>
      <button className="p-2 text-cream transition hover:text-gold" onClick={onClose} aria-label="Close menu"><X/></button>
    </div>

    <nav aria-label="Mobile navigation" className="flex flex-col py-7">
      <NavLink onClick={onClose} to="/" className={({ isActive }) => `border-b border-cream/10 py-4 font-display text-3xl transition ${isActive ? 'text-gold' : 'text-cream'}`}>Home</NavLink>

      <button type="button" aria-expanded={shopOpen} onClick={() => setShopOpen(value => !value)} className={`flex items-center justify-between border-b border-cream/10 py-4 text-left font-display text-3xl ${pathname === '/cakes' || pathname === '/paties' ? 'text-gold' : 'text-cream'}`}>
        Shop <ChevronDown size={21} className={`transition-transform duration-300 ${shopOpen ? 'rotate-180' : ''}`}/>
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${shopOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-2 border-b border-cream/10 py-4">
            {shopCategories.filter(category=>category.showInTopNavigation!==false).map(category => <Link key={category.key} onClick={onClose} to={category.to} className="border border-cream/15 px-3 py-3 text-[10px] font-bold tracking-[.1em] text-cream uppercase transition hover:border-gold hover:text-gold">{category.label}</Link>)}
          </div>
        </div>
      </div>

      {links.slice(1).map(([label, to]) => <NavLink key={to} onClick={onClose} to={to} className={({ isActive }) => `border-b border-cream/10 py-4 font-display text-3xl transition ${isActive ? 'text-gold' : 'text-cream'}`}>{label}</NavLink>)}
    </nav>

    <div className="mt-auto grid grid-cols-3 gap-2 border-t border-cream/15 pt-5">
      <Link onClick={onClose} to="/search" className="flex flex-col items-center gap-2 py-3 text-[9px] font-bold tracking-[.1em] uppercase"><Search size={18}/>Search</Link>
      <Link onClick={onClose} to={user ? '/profile' : '/login'} className="flex flex-col items-center gap-2 py-3 text-[9px] font-bold tracking-[.1em] uppercase"><span className="relative"><UserRound size={18}/>{user?.isVip&&<b className="absolute -right-5 -top-3 rounded-full bg-gold px-1.5 py-0.5 text-[7px] text-bakery">VIP</b>}</span>{user?.isVip?'VIP Account':'Account'}</Link>
      <Link onClick={onClose} to="/cart" className="flex flex-col items-center gap-2 py-3 text-[9px] font-bold tracking-[.1em] uppercase"><ShoppingBag size={18}/>Cart</Link>
    </div>
  </div>;
}
