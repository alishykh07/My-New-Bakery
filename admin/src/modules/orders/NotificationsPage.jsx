import { useMemo, useState } from 'react';
import { Bell, CakeSlice, MessageSquare, PackageSearch, ShoppingBag, Star } from 'lucide-react';

const filters = [['all', 'All'], ['order', 'Orders'], ['review', 'Reviews'], ['inquiry', 'Inquiries'], ['low_stock', 'Low Stock'], ['custom', 'Custom Cakes']];

export default function NotificationsPage({ items, onOpen }) {
  const [filter, setFilter] = useState('all');
  const shown = useMemo(() => filter === 'all' ? items : items.filter(item => item.type === filter), [filter, items]);
  const details = item => item.type === 'order'
    ? 'Waiting for order confirmation'
    : item.type === 'review' ? `${item.rating}/5 rating · waiting for approval`
    : item.type === 'inquiry' ? 'Waiting for an admin reply'
    : item.type === 'low_stock' ? `${item.stock} left · threshold ${item.threshold}` : 'Waiting for custom-cake confirmation';

  return <section className="panel notifications-page">
    <div className="section-title"><div><p>ATTENTION REQUIRED</p><h2>Notifications <span>{items.length}</span></h2></div><div className="notification-filters">{filters.map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
    {shown.length ? <div className="notifications-list">{shown.map(item => { const Icon = item.type === 'order' ? ShoppingBag : item.type === 'review' ? Star : item.type === 'inquiry' ? MessageSquare : item.type === 'low_stock' ? PackageSearch : CakeSlice; return <button key={`${item.type}-${item._id}`} onClick={() => onOpen(item)}><span className={`notification-page-icon ${item.type}`}><Icon size={19}/></span><span><b>{item.text}</b><small>{new Date(item.date).toLocaleString()}</small><em>{details(item)}</em></span><strong>Open →</strong></button>; })}</div> : <div className="notification-page-empty"><Bell size={35}/><h3>All caught up.</h3><p>No matching notifications need attention.</p></div>}
  </section>;
}
