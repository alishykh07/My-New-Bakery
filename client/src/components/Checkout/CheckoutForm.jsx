import { ArrowRight, MapPin, Store } from 'lucide-react';

const labels = { cash_on_delivery: 'Cash on delivery', bank_transfer: 'Bank transfer', card: 'Card' };

export default function CheckoutForm({ onSubmit, message, isUrgent, onUrgentChange, paymentMethods = ['cash_on_delivery', 'bank_transfer'], deliveryAreas = [], pickupAvailable = true, fulfillmentType = 'delivery', onFulfillmentTypeChange }) {
  const methods = paymentMethods?.length ? paymentMethods : ['cash_on_delivery'];
  const pickup = fulfillmentType === 'pickup';
  return <section className="surface-card">
    <h2 className="font-display text-3xl">{pickup ? 'Bakery pickup details' : 'Where should we deliver?'}</h2>
    <p className="mt-2 text-sm text-[#805941]">{pickup ? 'We will prepare the order for collection.' : 'We will confirm your preferred delivery date with you.'}</p>
    {pickupAvailable && <div className="mt-6 grid grid-cols-2 gap-3">
      <button type="button" onClick={() => onFulfillmentTypeChange('delivery')} className={`flex items-center justify-center gap-2 border p-3 text-sm font-bold ${!pickup ? 'border-[#ffc800] bg-[#fff0bd]' : 'border-[#d8b568] bg-white/40'}`}><MapPin size={17}/>Delivery</button>
      <button type="button" onClick={() => onFulfillmentTypeChange('pickup')} className={`flex items-center justify-center gap-2 border p-3 text-sm font-bold ${pickup ? 'border-[#ffc800] bg-[#fff0bd]' : 'border-[#d8b568] bg-white/40'}`}><Store size={17}/>Bakery pickup</button>
    </div>}
    <form onSubmit={onSubmit}>
      <input className="input-field mt-6" name="phone" placeholder="Phone number" required/>
      {!pickup && <><input className="input-field mt-4" name="address" placeholder="House / street address" required/><div className="mt-4 grid gap-4 md:grid-cols-2">{deliveryAreas.length ? <select className="input-field" name="area" defaultValue="" required><option value="" disabled>Select delivery area</option>{deliveryAreas.map(area => <option key={area} value={area}>{area}</option>)}</select> : <input className="input-field" name="area" placeholder="Area" required/>}<input className="input-field" name="city" defaultValue="Hyderabad" required/></div></>}
      <label className="mt-4 block text-xs font-bold text-[#74452d]">{pickup ? 'Pickup date' : 'Preferred delivery date'}<input className="input-field mt-2" name="deliveryDate" type="date" required/></label>
      {!pickup && <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 border border-[#d8b568] bg-white/40 p-4"><span><b className="block text-sm">Urgent delivery</b><small className="text-[#805941]">Priority delivery — Rs. 100 extra</small></span><input type="checkbox" checked={isUrgent} onChange={event => onUrgentChange(event.target.checked)} className="h-5 w-5 accent-[#ffc800]"/></label>}
      <select className="input-field mt-4" name="paymentMethod">{methods.map(method => <option value={method} key={method}>{labels[method] || method}</option>)}</select>
      <button className="gold-button mt-6 w-full">Place order <ArrowRight size={17}/></button><p className="mt-4 text-sm text-[#8f4a14]">{message}</p>
    </form>
  </section>;
}
