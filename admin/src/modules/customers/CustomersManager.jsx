const money=value=>`Rs. ${(value||0).toLocaleString()}`;
const addressText=address=>address?[address.line1,address.area,address.city].filter(Boolean).join(', '):'';

function CustomerToggle({label,value,onChange,activeText,inactiveText}){
  return <div className="customer-toggle-control"><span>{label}</span><button type="button" className={value?'on':'off'} onClick={()=>onChange(!value)} aria-pressed={value}><i/><b>{value?activeText:inactiveText}</b></button></div>;
}

export default function CustomersManager({items,patch}){
  return <section className="panel"><div className="section-title toolbar"><div><p>MANAGEMENT</p><h2>Customers <span>{items.length}</span></h2></div></div><div className="table-wrap"><table className="customers-table"><thead><tr><th>Customer</th><th>Phone / latest address</th><th>Orders</th><th>Spent</th><th>Last order</th><th>Customer controls</th></tr></thead><tbody>{items.map(customer=><tr key={customer._id}><td><b>{customer.name}</b>{customer.isVip&&<em className="admin-vip-tag">VIP</em>}<small>{customer.email}</small></td><td>{customer.phone||'No phone'}<small>{addressText(customer.latestAddress||customer.address)||'No delivery address yet'}</small></td><td>{customer.totalOrders}</td><td>{money(customer.totalSpent)}</td><td>{customer.lastOrder?new Date(customer.lastOrder).toLocaleDateString('en-PK'):'—'}</td><td><div className="customer-controls"><CustomerToggle label="VIP" value={Boolean(customer.isVip)} onChange={value=>patch(customer._id,{isVip:value})} activeText="On" inactiveText="Off"/><CustomerToggle label="Account" value={customer.isActive!==false} onChange={value=>patch(customer._id,{isActive:value})} activeText="Active" inactiveText="Inactive"/></div></td></tr>)}</tbody></table></div></section>;
}
