import { useEffect, useState } from 'react';
import { CakeSlice, CalendarDays, ChevronDown, Palette, ReceiptText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';

const labels = { new:'Request received', reviewing:'Under review', quoted:'Price ready', confirmed:'Order confirmed', completed:'Completed', cancelled:'Cancelled' };
const imageSrc = value => value?.startsWith('/uploads/') ? `http://localhost:5000${value}` : value;

export default function CustomCakeRequestsPage() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => { if (user) api('/custom-cakes').then(data => setItems(data.requests)).catch(error => setMessage(error.message)); }, [user]);
  if (!user) return <main className="page-shell"><h1 className="page-title">Login to view your custom cakes.</h1><Link className="gold-button mt-6" to="/login">Login</Link></main>;

  async function send(item, body) {
    try { setBusy(item._id); const data = await api(`/custom-cakes/${item._id}/respond`, { method:'POST', body:JSON.stringify(body) }); setItems(current => current.map(request => request._id === item._id ? data.request : request)); return data; }
    catch (error) { setMessage(error.message); }
    finally { setBusy(''); }
  }
  async function confirm(event, item) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const data = await send(item, { action:'confirm', paymentMethod:form.get('paymentMethod'), phone:form.get('phone'), address:form.get('address'), area:form.get('area'), city:form.get('city') });
    if (data) { setMessage(`Order ${data.order.orderNumber} confirmed.`); navigate('/orders'); }
  }
  async function cancel(item) { if (!window.confirm('Cancel this custom cake request?')) return; const data = await send(item, { action:'cancel' }); if (data) setMessage('Request cancelled.'); }

  return <main className="page-shell">
    <p className="eyebrow text-[#8f4a14]">Your personalised orders</p>
    <h1 className="page-title">My custom cake requests</h1>
    <p className="page-copy">Review your cake details and confirm only when you are happy with the quote.</p>
    {message && <p className="mt-6 max-w-4xl rounded-lg bg-gold/20 p-4 text-sm text-[#8f4a14]">{message}</p>}
    <div className="max-w-5xl space-y-5" style={{ marginTop:'4.5rem' }}>
      {items.map(item => {
        const expanded = open === item._id;
        const total = Number(item.estimatedPrice || 0) * Number(item.quantity || 1);
        const referenceImage = imageSrc(item.referenceImage);
        return <article className="overflow-hidden rounded-2xl border border-white/55 bg-white/70 shadow-[0_12px_30px_rgba(68,22,3,.1)] backdrop-blur-xl" key={item._id}>
          <button type="button" className="flex w-full items-center justify-between gap-5 p-5 text-left transition hover:bg-white/45 md:px-7 md:py-6" onClick={() => setOpen(expanded ? null : item._id)} aria-expanded={expanded}>
            <div className="flex min-w-0 items-center gap-4">{referenceImage ? <img className="h-15 w-15 shrink-0 rounded-xl border border-[#e5cfa4] object-cover" src={referenceImage} alt={item.cakeType}/> : <span className="grid h-15 w-15 shrink-0 place-items-center rounded-xl bg-[#fff0bd] text-[#8f4a14]"><CakeSlice size={25}/></span>}<div className="min-w-0"><b className="block truncate text-base">{item.cakeType}</b><p className="mt-1 text-xs text-[#8f4a14]">Requested {new Date(item.createdAt).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' })}</p></div></div>
            <div className="flex items-center gap-4 text-right"><div><span className="bg-[#fff0bd] px-2.5 py-1 text-[10px] font-bold uppercase text-[#75432a]">{labels[item.status] || item.status}</span>{total ? <strong className="mt-2 block text-sm">{formatPrice(total)}</strong> : <span className="mt-2 block text-xs text-[#805941]">Quote pending</span>}</div><ChevronDown size={19} className={`text-[#8f4a14] transition-transform ${expanded ? 'rotate-180' : ''}`}/></div>
          </button>
          {expanded && <div className="border-t border-[#e5cfa4] bg-[#fffaf0]/80 px-5 py-8 md:px-7 md:py-9"><div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
            <div><div className="mb-4 flex items-center gap-2 text-[#8f4a14]"><CakeSlice size={17}/><h2 className="text-xs font-extrabold tracking-[.13em] uppercase">Cake details</h2></div><div className="grid gap-3 text-sm sm:grid-cols-2">{referenceImage && <img className="aspect-[1.2] w-full rounded-xl border border-[#e5cfa4] object-cover sm:col-span-2" src={referenceImage} alt={`${item.cakeType} reference`}/>}<div className="rounded-xl border border-[#e5cfa4] bg-white/70 p-4"><span className="text-[10px] font-bold tracking-[.1em] text-[#8f4a14] uppercase">Flavour</span><b className="mt-1 block">{item.flavor || 'Not selected'}</b></div><div className="rounded-xl border border-[#e5cfa4] bg-white/70 p-4"><span className="text-[10px] font-bold tracking-[.1em] text-[#8f4a14] uppercase">Size & quantity</span><b className="mt-1 block">{item.size || 'Not selected'} · {item.quantity || 1} cake</b></div><div className="rounded-xl border border-[#e5cfa4] bg-white/70 p-4 sm:col-span-2"><span className="flex items-center gap-1 text-[10px] font-bold tracking-[.1em] text-[#8f4a14] uppercase"><Palette size={13}/>Theme & instructions</span><b className="mt-1 block">{item.theme || 'No theme selected'}</b>{item.instructions && <p className="mt-2 text-xs leading-5 text-[#805941]">{item.instructions}</p>}</div></div></div>
            <div className="space-y-3"><div className="rounded-xl border border-[#e5cfa4] bg-white/70 p-4 text-xs leading-5 text-[#6d4934]"><div className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-[#8f4a14]"/><div><b className="block text-[#3b0e06]">Required date</b><span>{new Date(item.requiredDate).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}</span></div></div></div>{total ? <div className="rounded-xl border border-[#e5cfa4] bg-white/70 p-4 text-xs text-[#6d4934]"><div className="mb-3 flex items-center gap-2 font-bold text-[#8f4a14]"><ReceiptText size={16}/>Your quote</div><p className="flex justify-between gap-3"><span>Price per cake</span><b>{formatPrice(item.estimatedPrice)}</b></p><p className="mt-2 flex justify-between gap-3"><span>Quantity</span><b>{item.quantity || 1}</b></p><p className="mt-3 flex justify-between gap-3 border-t border-[#e5cfa4] pt-3 text-sm text-[#3b0e06]"><b>Total</b><b>{formatPrice(total)}</b></p></div> : <div className="rounded-xl border border-[#e5cfa4] bg-white/70 p-4 text-xs leading-5 text-[#6d4934]">Our bakery team is reviewing your request and will add a quote shortly.</div>}</div>
          </div>
          {item.status === 'quoted' && <form className="mt-8 grid gap-3 border-t border-[#e3c681] pt-7 md:grid-cols-2" onSubmit={event => confirm(event, item)}><p className="md:col-span-2 text-sm"><b>Your quote is ready.</b> Add your delivery details and we will start preparing your cake.</p><select className="input-field" name="paymentMethod"><option value="cash_on_delivery">Cash on delivery</option><option value="bank_transfer">Bank transfer</option></select><input className="input-field" name="phone" placeholder="Phone number" required/><input className="input-field md:col-span-2" name="address" placeholder="Delivery address" required/><input className="input-field" name="area" placeholder="Area" required/><input className="input-field" name="city" defaultValue="Karachi" required/><button disabled={busy === item._id} className="gold-button justify-center">Confirm order</button><button disabled={busy === item._id} type="button" className="border border-[#8f4a14] px-5 py-3 text-xs font-bold text-[#8f4a14]" onClick={() => cancel(item)}>Cancel request</button></form>}
          {item.status === 'confirmed' && <p className="mt-7 rounded-lg bg-green-100 p-4 text-sm text-green-800">Confirmed — this cake is now visible in My Orders.</p>}{item.status === 'cancelled' && <p className="mt-7 text-sm text-red-700">This request was cancelled.</p>}
          </div>}
        </article>;
      })}
      {!items.length && <p>No custom cake requests yet.</p>}
    </div>
  </main>;
}
