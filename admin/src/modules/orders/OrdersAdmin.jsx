import { useState } from 'react';
import './orders-admin.css';

const money = value => `Rs. ${(value || 0).toLocaleString()}`;
const dateTime = value => value
  ? new Date(value).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
  : 'Date unavailable';
const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[char]));

function isInPeriod(order, period, from, to) {
  if (period === 'all') return true;
  const date = new Date(order.createdAt);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
    end.setTime(start.getTime()); end.setDate(end.getDate() + 1);
  } else if (period === 'week') {
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    end.setTime(start.getTime()); end.setDate(end.getDate() + 7);
  } else if (period === 'month') {
    start.setFullYear(now.getFullYear(), now.getMonth(), 1); start.setHours(0, 0, 0, 0);
    end.setFullYear(now.getFullYear(), now.getMonth() + 1, 1); end.setHours(0, 0, 0, 0);
  } else if (period === 'year') {
    start.setFullYear(now.getFullYear(), 0, 1); start.setHours(0, 0, 0, 0);
    end.setFullYear(now.getFullYear() + 1, 0, 1); end.setHours(0, 0, 0, 0);
  } else {
    if (!from && !to) return true;
    const customStart = from ? new Date(`${from}T00:00:00`) : new Date(0);
    const customEnd = to ? new Date(`${to}T23:59:59.999`) : new Date(8640000000000000);
    return date >= customStart && date <= customEnd;
  }
  return date >= start && date < end;
}

const printableImage=value=>{
  const image=String(value||'').trim();
  if(!image)return '';
  return /^(https?:|data:|blob:)/i.test(image)?image:`http://localhost:5000${image.startsWith('/')?'':'/'}${image}`;
};

export function printOrders(orders) {
  if (!orders.length) return;
  const invoices = orders.map(order => `<article class="invoice">
    <header><div><p>MY NEW BAKERY</p><h1>Order Invoice</h1></div><strong>${safe(order.orderNumber)}</strong></header>
    <div class="meta"><span><b>Ordered:</b> ${safe(dateTime(order.createdAt))}</span><span><b>Delivery:</b> ${safe(dateTime(order.deliveryDate))}</span></div>
    <section><h2>Customer</h2><p>${safe(order.customer?.name)}<br>${safe(order.customer?.email)}<br>${safe(order.phone)}<br>${safe([order.address?.line1, order.address?.area, order.address?.city].filter(Boolean).join(', '))}</p></section>
    <table><thead><tr><th>Image</th><th>Item</th><th>Size / flavour</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>${(order.items || []).map(item => {const image=printableImage(item.image||item.product?.images?.[0]);return `<tr><td>${image ? `<img class="item-image" src="${safe(image)}" alt="${safe(item.name)}">` : '<span class="image-placeholder">No image</span>'}</td><td>${safe(item.name)}</td><td>${safe([item.size, item.flavor].filter(Boolean).join(' / ') || 'Standard')}</td><td>${safe(item.quantity)}</td><td>${safe(money(item.price))}</td><td>${safe(money((item.price || 0) * (item.quantity || 0)))}</td></tr>`}).join('')}</tbody></table>
    <div class="totals"><p>Subtotal <b>${safe(money(order.subtotal))}</b></p><p>Delivery <b>${safe(money(order.deliveryFee))}</b></p>${order.isUrgent ? `<p>Urgent delivery <b>${safe(money(order.urgentFee || 100))}</b></p>` : ''}<p class="grand">Total <b>${safe(money(order.total))}</b></p></div>
    <footer><span>Payment: ${safe(order.paymentStatus)} (${safe(order.paymentMethod)})</span><span>Order status: ${safe(order.orderStatus)}</span></footer>
  </article>`).join('');
  const popup = window.open('', '_blank', 'width=900,height=700');
  if (!popup) return;
  popup.document.write(`<!doctype html><html><head><title>Bakery orders</title><style>
    *{box-sizing:border-box}body{margin:0;background:#eee;color:#2c0903;font:14px Arial,sans-serif}.invoice{width:190mm;min-height:270mm;margin:10mm auto;padding:16mm;background:#fff;page-break-after:always}.invoice:last-child{page-break-after:auto}header,.meta,footer,.totals p{display:flex;justify-content:space-between;gap:20px}header{align-items:center;border-bottom:3px solid #2c0903;padding-bottom:15px}header p{margin:0;color:#9b621a;font-weight:700;letter-spacing:2px}h1{margin:4px 0;font:36px Georgia,serif}h2{font:22px Georgia,serif;margin:22px 0 8px}.meta{padding:12px 0;border-bottom:1px solid #d9bd81;font-size:12px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{text-align:left;padding:10px;border-bottom:1px solid #e8d7b2;vertical-align:middle}th{color:#8f4a14;font-size:11px;text-transform:uppercase}.item-image{display:block;width:52px;height:52px;border-radius:7px;object-fit:cover}.image-placeholder{display:grid;width:52px;height:52px;place-items:center;border-radius:7px;background:#f5ead1;color:#98745b;font-size:8px;text-align:center}.totals{width:280px;margin:22px 0 22px auto}.totals p{margin:7px 0}.grand{font-size:18px;border-top:2px solid #2c0903;padding-top:10px}footer{border-top:1px solid #d9bd81;padding-top:14px;text-transform:capitalize}@media print{body{background:#fff}.invoice{margin:0;width:auto;min-height:auto}}
  </style></head><body>${invoices}<script>window.onload=async()=>{const images=[...document.images];await Promise.all(images.map(image=>image.complete?(image.decode?image.decode().catch(()=>{}):Promise.resolve()):new Promise(resolve=>{image.onload=resolve;image.onerror=resolve})));setTimeout(()=>window.print(),250)}<\/script></body></html>`);
  popup.document.close();
}

function printOrderReport(orders, period) {
  if (!orders.length) return;
  const sorted = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const groups = period === 'year'
    ? Object.values(sorted.reduce((all, order) => {
        const date = new Date(order.createdAt);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!all[key]) all[key] = { title: date.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' }), orders: [] };
        all[key].orders.push(order);
        return all;
      }, {}))
    : [{
        title: period === 'today' ? "Today's Orders" : period === 'week' ? 'This Week Orders' : period === 'month' ? 'This Month Orders' : period === 'custom' ? 'Custom Date Orders' : 'All Orders',
        orders: sorted
      }];
  const pages = groups.map(group => {
    const total = group.orders.reduce((sum, order) => sum + (order.total || 0), 0);
    return `<article class="report-page"><header><div><p>MY NEW BAKERY / ADMIN</p><h1>${safe(group.title)}</h1></div><div class="summary"><b>${group.orders.length}</b> orders<br><b>${safe(money(total))}</b> sales</div></header><p class="printed">Printed ${safe(dateTime(new Date()))}</p><table><thead><tr><th>Date & time</th><th>Order / customer</th><th>Items</th><th>Payment</th><th>Status</th><th>Total</th></tr></thead><tbody>${group.orders.map(order => `<tr><td>${safe(dateTime(order.createdAt))}</td><td><b>${safe(order.orderNumber)}</b><br>${safe(order.customer?.name)}<br>${safe(order.phone)}</td><td>${safe((order.items || []).map(item => `${item.name} × ${item.quantity}`).join(', '))}<br><small>Delivery: ${safe(dateTime(order.deliveryDate))}</small></td><td>${safe(order.paymentStatus)}<br><small>${safe(order.paymentMethod)}</small></td><td>${safe(order.orderStatus)}</td><td><b>${safe(money(order.total))}</b></td></tr>`).join('')}</tbody></table><footer>Total orders: <b>${group.orders.length}</b><span>Report total: <b>${safe(money(total))}</b></span></footer></article>`;
  }).join('');
  const popup = window.open('', '_blank', 'width=1100,height=750');
  if (!popup) return;
  popup.document.write(`<!doctype html><html><head><title>Orders report</title><style>
    @page{size:A4 landscape;margin:8mm}*{box-sizing:border-box}body{margin:0;background:#eee;color:#2c0903;font:10px Arial,sans-serif}.report-page{width:277mm;min-height:190mm;margin:8mm auto;padding:10mm;background:#fff;page-break-after:always}.report-page:last-child{page-break-after:auto}header{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:3px solid #2c0903;padding-bottom:10px}header p{margin:0;color:#9b621a;font-size:9px;font-weight:700;letter-spacing:2px}h1{margin:3px 0 0;font:30px Georgia,serif}.summary{text-align:right;line-height:1.6}.summary b{font-size:14px}.printed{margin:8px 0;color:#8c6547;text-align:right}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{text-align:left;vertical-align:top;padding:6px;border-bottom:1px solid #e8d7b2;overflow-wrap:anywhere}th{color:#8f4a14;font-size:8px;text-transform:uppercase}th:nth-child(1){width:14%}th:nth-child(2){width:18%}th:nth-child(3){width:30%}th:nth-child(4){width:12%}th:nth-child(5){width:12%}th:nth-child(6){width:14%}small{color:#8c6547}footer{display:flex;justify-content:space-between;border-top:2px solid #2c0903;margin-top:10px;padding-top:8px;font-size:12px}@media print{body{background:#fff}.report-page{width:auto;min-height:auto;margin:0;padding:0;break-inside:avoid;page-break-inside:avoid}}
  </style></head><body>${pages}<script>window.onload=()=>window.print()<\/script></body></html>`);
  popup.document.close();
}

export default function OrdersAdmin({ orders, patch }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [period, setPeriod] = useState('today');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const shown = orders.filter(order =>
    (status === 'all' || order.orderStatus === status) &&
    isInPeriod(order, period, from, to) &&
    `${order.orderNumber} ${order.customer?.name} ${order.customer?.email}`.toLowerCase().includes(query.toLowerCase())
  );

  return <section className="panel orders-panel">
    <div className="section-title toolbar orders-toolbar">
      <div><p>MANAGEMENT</p><h2>Orders <span>{shown.length}</span></h2></div>
      <div className="filters">
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search order/customer" />
        <select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option>{['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(value => <option key={value}>{value}</option>)}</select>
        <select value={period} onChange={event => setPeriod(event.target.value)}><option value="today">Today</option><option value="week">This week</option><option value="month">This month</option><option value="year">This year</option><option value="custom">Custom dates</option></select>
        {period === 'custom' && <><label className="date-filter">From<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label><label className="date-filter">To<input type="date" min={from} value={to} onChange={event => setTo(event.target.value)} /></label></>}
        <button disabled={!shown.length} onClick={() => printOrderReport(shown, period)}>Print shown orders</button>
      </div>
    </div>
    <div className="table-wrap"><table><thead><tr><th>Order/customer</th><th>Items & delivery</th><th>Payment</th><th>Status</th><th>Total</th><th>Invoice</th></tr></thead><tbody>{shown.map(order => <tr key={order._id}>
      <td><b>{order.orderNumber}</b><small>Ordered: {dateTime(order.createdAt)}<br />{order.customer?.name} · {order.customer?.email}<br />{order.phone}</small></td>
      <td>{order.items?.map(item => `${item.name} × ${item.quantity} (${item.size || 'standard'})`).join(', ')}<small>{order.fulfillmentType === 'pickup' ? 'Bakery pickup' : [order.address?.line1, order.address?.area].filter(Boolean).join(', ')}<br />{order.fulfillmentType === 'pickup' ? 'Pickup' : 'Delivery'}: {dateTime(order.deliveryDate)}</small></td>
      <td><select value={order.paymentStatus} onChange={event => patch(order._id, { paymentStatus: event.target.value })}>{['pending', 'paid', 'failed'].map(value => <option key={value}>{value}</option>)}</select><small>{order.paymentMethod}</small></td>
      <td><select value={order.orderStatus} onChange={event => patch(order._id, { orderStatus: event.target.value })}>{['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(value => <option key={value}>{value}</option>)}</select></td>
      <td><b>{money(order.total)}</b></td><td><button className="secondary" onClick={() => printOrders([order])}>Print</button></td>
    </tr>)}</tbody></table>{!shown.length && <p className="orders-empty">No orders found for these filters.</p>}</div>
  </section>;
}
