import { useMemo, useState } from 'react';

const productId = value => String(value?._id || value || '');
const dateTime = value => new Date(value).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });

export default function InventoryManager({ products, orders = [], movements = [], patch }) {
  const [query, setQuery] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [amounts, setAmounts] = useState({});
  const [historyType, setHistoryType] = useState('all');

  const soldByProduct = useMemo(() => {
    const totals = new Map();
    orders.filter(order => order.orderStatus === 'delivered').forEach(order => {
      order.items?.forEach(item => {
        const id = productId(item.product);
        if (id) totals.set(id, (totals.get(id) || 0) + (Number(item.quantity) || 0));
      });
    });
    return totals;
  }, [orders]);

  const history = useMemo(() => {
    const ledgerSaleKeys = new Set(movements.filter(item => item.type === 'sale').map(item => `${productId(item.order)}:${productId(item.product)}`));
    const saved = movements.map(item => ({ ...item, productId: productId(item.product), productName: item.product?.name || 'Product', date: item.createdAt }));
    const olderSales = orders.filter(order => order.orderStatus === 'delivered').flatMap(order => order.items?.map(item => ({
      _id: `order-${order._id}-${productId(item.product)}`,
      type: 'sale',
      productId: productId(item.product),
      productName: item.name || products.find(product => productId(product._id) === productId(item.product))?.name || 'Product',
      quantity: Number(item.quantity) || 0,
      date: order.stockDeductedAt || order.updatedAt,
      note: order.orderNumber,
      historical: true,
      key: `${productId(order._id)}:${productId(item.product)}`,
    })) || []).filter(item => item.productId && !ledgerSaleKeys.has(item.key));
    return [...saved, ...olderSales].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [movements, orders, products]);

  const lowStock = products.filter(product => product.stock <= product.lowStockThreshold);
  const outOfStock = products.filter(product => product.stock === 0);
  const restockedUnits = movements.filter(item => item.type === 'restock').reduce((sum, item) => sum + item.quantity, 0);
  const shown = products.filter(product => (!lowOnly || product.stock <= product.lowStockThreshold) && product.name.toLowerCase().includes(query.trim().toLowerCase()));
  const shownHistory = history.filter(item => historyType === 'all' || item.type === historyType).slice(0, 100);
  const quantity = id => Math.max(1, Number(amounts[id]) || 1);
  const adjust = async (product, direction) => { await patch(product._id, quantity(product._id) * direction); setAmounts(current => ({ ...current, [product._id]: 1 })); };
  const activity = type => type === 'sale' ? 'Sold' : type === 'restock' ? 'Restocked' : 'Manually removed';

  return <>
    <div className="stats inventory-summary"><article><span>Total products</span><strong>{products.length}</strong></article><article><span>Low stock</span><strong>{lowStock.length}</strong></article><article><span>Out of stock</span><strong>{outOfStock.length}</strong></article><article><span>Total restocked</span><strong>{restockedUnits}</strong></article></div>
    <section className="panel"><div className="section-title toolbar"><div><p>MANAGEMENT</p><h2>Inventory <span>{shown.length}</span></h2></div><div className="inventory-toolbar-actions"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products..."/><button className={`inventory-filter-button ${lowOnly ? 'active' : ''}`} onClick={() => setLowOnly(value => !value)}>{lowOnly ? 'Showing low stock' : 'Low stock only'}</button></div></div>
      <div className="table-wrap"><table className="inventory-products-table"><thead><tr><th>Product</th><th>Current</th><th>Threshold</th><th>Total sold</th><th>Adjust stock</th></tr></thead><tbody>{shown.map(product => { const isLow = product.stock <= product.lowStockThreshold, isOut = product.stock === 0, sold = Math.max(soldByProduct.get(productId(product._id)) || 0, product.sold || 0); return <tr className={isOut ? 'inventory-low-stock-row inventory-out-of-stock-row' : isLow ? 'inventory-low-stock-row' : ''} key={product._id}><td><b>{product.name}</b>{isOut ? <small>Out of stock</small> : isLow ? <small>Low stock</small> : null}</td><td><span className={isLow ? 'stock' : 'stock good'}>{product.stock}</span></td><td>{product.lowStockThreshold ?? 5}</td><td><b>{sold}</b></td><td><div className="stock-adjustment"><input aria-label={`Stock quantity for ${product.name}`} type="number" min="1" value={amounts[product._id] ?? 1} onChange={event => setAmounts(current => ({ ...current, [product._id]: event.target.value }))}/><button onClick={() => adjust(product, 1)}>Add</button><button className="remove-stock" disabled={product.stock === 0} onClick={() => adjust(product, -1)}>Remove</button></div></td></tr>; })}{!shown.length && <tr><td className="inventory-empty-row" colSpan="5">No matching products found.</td></tr>}</tbody></table></div>
    </section>
    <section className="panel inventory-history"><div className="section-title"><div><p>STOCK LEDGER</p><h2>Inventory history <span>{history.length}</span></h2></div><div className="inventory-history-filters">{[['all','All'],['sale','Sold'],['restock','Restocked'],['manual_removal','Removed']].map(([value,label]) => <button key={value} className={historyType === value ? 'active' : ''} onClick={() => setHistoryType(value)}>{label}</button>)}</div></div>
      <div className="table-wrap"><table><thead><tr><th>Date & time</th><th>Product</th><th>Activity</th><th>Quantity</th><th>Stock balance</th><th>Reference</th></tr></thead><tbody>{shownHistory.map(item => <tr key={item._id}><td>{dateTime(item.date)}</td><td><b>{item.productName}</b></td><td><span className={`movement-badge ${item.type}`}>{activity(item.type)}</span></td><td><b>{item.type === 'restock' ? '+' : '-'}{item.quantity}</b></td><td>{item.historical ? 'Recorded sale' : `${item.stockBefore} → ${item.stockAfter}`}</td><td>{item.note || 'Manual inventory update'}</td></tr>)}{!shownHistory.length && <tr><td className="inventory-empty-row" colSpan="6">No inventory history yet.</td></tr>}</tbody></table></div>
    </section>
  </>;
}
