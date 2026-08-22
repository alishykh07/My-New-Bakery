import { useEffect, useState } from 'react';
import { ChevronDown, MapPin, Package, ReceiptText, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';

const label = value => String(value || '').replaceAll('_', ' ');

export default function OrdersPage() {
  const { user } = useStore();
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => { if (user) api('/orders').then(data => setOrders(data.orders)).catch(() => {}); }, [user]);
  if (!user) return <main className="page-shell"><h1 className="page-title">Login to see your orders.</h1><Link className="gold-button mt-6" to="/login">Login</Link></main>;

  return <main className="page-shell">
    <p className="eyebrow text-[#8f4a14]">Your bakery history</p>
    <h1 className="page-title">My orders</h1>
    <div className="max-w-5xl space-y-5" style={{ marginTop: '4.5rem' }}>
      {orders.length ? orders.map(order => {
        const expanded = open === order._id;
        const address = [order.address?.line1, order.address?.area, order.address?.city].filter(Boolean).join(', ');
        return <article key={order._id} className="overflow-hidden rounded-2xl border border-white/55 bg-white/70 shadow-[0_12px_30px_rgba(68,22,3,.1)] backdrop-blur-xl">
          <button type="button" className="flex w-full items-center justify-between gap-5 p-5 text-left transition hover:bg-white/45 md:px-7 md:py-6" onClick={() => setOpen(expanded ? null : order._id)} aria-expanded={expanded}>
            <div><b className="text-base">{order.orderNumber}</b><p className="mt-1 text-xs text-[#8f4a14]">Placed {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
            <div className="flex items-center gap-4 text-right"><div><span className="bg-[#fff0bd] px-2.5 py-1 text-[10px] font-bold uppercase text-[#75432a]">{label(order.orderStatus)}</span><strong className="mt-2 block text-sm">{formatPrice(order.total)}</strong></div><ChevronDown size={19} className={`text-[#8f4a14] transition-transform ${expanded ? 'rotate-180' : ''}`}/></div>
          </button>
          {expanded && <div className="border-t border-[#e5cfa4] bg-[#fffaf0]/80 px-5 py-8 md:px-7 md:py-9">
            <div className="grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
              <div><div className="mb-3 flex items-center gap-2 text-[#8f4a14]"><Package size={17}/><h2 className="text-xs font-extrabold tracking-[.13em] uppercase">Your items</h2></div><div className="space-y-3">{order.items?.map((item, index) => <div className="flex items-center justify-between gap-4 border-b border-[#ead8b3] pb-3 text-sm" key={`${item.product || item.name}-${index}`}><div className="flex min-w-0 items-center gap-3">{(item.image || item.product?.images?.[0]) ? <img className="h-14 w-14 shrink-0 rounded-lg border border-[#e5cfa4] object-cover" src={item.image || item.product?.images?.[0]} alt={item.name}/> : <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-[#f3dfb7] text-[9px] font-bold text-[#8f4a14]">ITEM</div>}<div className="min-w-0"><b className="block truncate">{item.name}</b><span className="text-xs text-[#805941]">{item.size || 'Standard'} · Qty {item.quantity}</span></div></div><strong className="shrink-0">{formatPrice(item.price * item.quantity)}</strong></div>)}</div></div>
              <div className="space-y-3"><div className="rounded-xl border border-[#e5cfa4] bg-white/70 p-4 text-xs text-[#6d4934]"><div className="mb-3 flex items-center gap-2 font-bold text-[#8f4a14]"><ReceiptText size={16}/>Payment summary</div><p className="flex justify-between gap-3"><span>Subtotal</span><b>{formatPrice(order.subtotal)}</b></p><p className="mt-2 flex justify-between gap-3"><span>Delivery charges</span><b>{order.deliveryFee ? formatPrice(order.deliveryFee) : 'Free'}</b></p>{order.urgentFee ? <p className="mt-2 flex justify-between gap-3"><span>Urgent delivery</span><b>{formatPrice(order.urgentFee)}</b></p> : null}<p className="mt-3 flex justify-between gap-3 border-t border-[#e5cfa4] pt-3 text-sm text-[#3b0e06]"><b>Total</b><b>{formatPrice(order.total)}</b></p><p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-[#8f4a14]">Payment: {label(order.paymentStatus)}</p></div><div className="rounded-xl border border-[#e5cfa4] bg-white/70 p-4 text-xs leading-5 text-[#6d4934]"><div className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-[#8f4a14]"/><div><b className="block text-[#3b0e06]">{order.fulfillmentType === 'pickup' ? 'Bakery pickup' : 'Delivery schedule'}</b><span>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date to be confirmed'}</span></div></div>{order.fulfillmentType !== 'pickup' && <div className="mt-3 flex gap-2 border-t border-[#ead8b3] pt-3"><MapPin size={16} className="mt-0.5 shrink-0 text-[#8f4a14]"/><div><b className="block text-[#3b0e06]">Delivery address</b><span>{address || 'Address to be confirmed'}</span></div></div>}</div></div>
            </div>
          </div>}
        </article>;
      }) : <p>No orders yet.</p>}
    </div>
  </main>;
}
