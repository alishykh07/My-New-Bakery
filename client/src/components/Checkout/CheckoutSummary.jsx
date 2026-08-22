import { formatPrice } from '../../utils/formatPrice.js';

export default function CheckoutSummary({ cart, subtotal, deliveryFee = 0, isUrgent, freeDeliveryThreshold = 0, fulfillmentType = 'delivery' }) {
  const remaining = Math.max(0, freeDeliveryThreshold - subtotal);
  return <aside className="dark-card h-fit">
    <h2 className="font-display text-3xl">Your order</h2>
    {cart.map(item => <div className="mt-4 flex justify-between gap-4 border-b border-cream/20 pb-3 text-xs" key={`${item.slug}-${item.size}`}><span>{item.name} × {item.quantity}</span><strong className="shrink-0">{formatPrice(item.price * item.quantity)}</strong></div>)}
    <div className="mt-5 flex justify-between text-sm"><span>{fulfillmentType === 'pickup' ? 'Bakery pickup' : 'Delivery'}</span><strong>{deliveryFee ? formatPrice(deliveryFee) : 'Free'}</strong></div>
    {fulfillmentType === 'pickup' ? <p className="mt-2 text-[11px] font-semibold text-[#ffd96a]">Collect from the bakery — no delivery fee.</p> : freeDeliveryThreshold > 0 && <p className="mt-2 text-[11px] leading-5 text-[#ffd96a]"><b className="block">Free delivery above {formatPrice(freeDeliveryThreshold)}</b>{remaining > 0 ? `Add ${formatPrice(remaining)} more to unlock it.` : 'Free delivery unlocked for this order.'}</p>}
    {isUrgent && <div className="mt-3 flex justify-between text-sm"><span>Urgent delivery</span><strong>{formatPrice(100)}</strong></div>}
    <div className="mt-3 flex justify-between text-sm"><span>Total</span><strong>{formatPrice(subtotal + deliveryFee + (isUrgent ? 100 : 0))}</strong></div>
  </aside>;
}
