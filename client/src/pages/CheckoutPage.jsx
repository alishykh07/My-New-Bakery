import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../services/api.js';
import { useSiteConfig } from '../services/siteConfig.js';
import CheckoutForm from '../components/Checkout/CheckoutForm.jsx';
import CheckoutSummary from '../components/Checkout/CheckoutSummary.jsx';

export default function CheckoutPage() {
  const { cart, clear, user } = useStore();
  const config = useSiteConfig();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState('delivery');
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const threshold = Number(config.freeDeliveryThreshold) || 0;
  const deliveryFee = fulfillmentType === 'pickup' || (threshold > 0 && subtotal >= threshold) ? 0 : Number(config.deliveryFee) || 0;

  async function submit(event) {
    event.preventDefault();
    if (!user) return navigate('/login');
    try {
      const form = new FormData(event.currentTarget);
      const items = cart.map(item => ({ product: item._id, name: item.name, image: item.images?.[0] || item.image, price: item.price, quantity: item.quantity, size: item.size }));
      const data = await api('/orders', { method: 'POST', body: JSON.stringify({ items, subtotal, fulfillmentType, deliveryFee, isUrgent: fulfillmentType === 'delivery' && isUrgent, address: fulfillmentType === 'delivery' ? { line1: form.get('address'), city: form.get('city'), area: form.get('area') } : {}, phone: form.get('phone'), paymentMethod: form.get('paymentMethod'), deliveryDate: form.get('deliveryDate') }) });
      clear(); navigate(`/order-success/${data.order._id}`);
    } catch (error) { setMessage(error.message); }
  }

  if (!cart.length) return <main className="page-shell"><h1 className="page-title">Your bag is empty.</h1></main>;
  return <main className="page-shell"><p className="eyebrow text-[#8f4a14]">Secure checkout</p><h1 className="page-title">Order details</h1><div className="mt-6 grid gap-3 border border-[#d7bc80] bg-white/45 p-4 text-sm text-[#764c35] md:grid-cols-2"><div><b className="block text-[#3b0e06]">Free delivery</b>{threshold > 0 ? `Available on orders above ${new Intl.NumberFormat('en-PK',{style:'currency',currency:'PKR',maximumFractionDigits:0}).format(threshold).replace('PKR','Rs.')}` : 'No minimum order amount configured.'}</div><div><b className="block text-[#3b0e06]">Delivery areas</b>{(config.deliveryAreas || []).length ? (config.deliveryAreas || []).join(' · ') : 'No restricted areas configured — enter your area below.'}</div>{(config.deliveryNote || config.estimatedDeliveryTime) && <div className="md:col-span-2"><b className="text-[#3b0e06]">Delivery details:</b> {config.deliveryNote}{config.deliveryNote && config.estimatedDeliveryTime ? ' · ' : ''}{config.estimatedDeliveryTime && `Estimated ${config.estimatedDeliveryTime}`}</div>}</div><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_330px]"><CheckoutForm onSubmit={submit} message={message} isUrgent={isUrgent} onUrgentChange={setIsUrgent} paymentMethods={config.paymentMethods} deliveryAreas={config.deliveryAreas || []} pickupAvailable={config.pickupAvailable !== false} fulfillmentType={fulfillmentType} onFulfillmentTypeChange={type => { setFulfillmentType(type); if (type === 'pickup') setIsUrgent(false); }}/><CheckoutSummary cart={cart} subtotal={subtotal} deliveryFee={deliveryFee} isUrgent={fulfillmentType === 'delivery' && isUrgent} freeDeliveryThreshold={threshold} fulfillmentType={fulfillmentType}/></div></main>;
}
