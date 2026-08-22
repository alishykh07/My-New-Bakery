import { useMemo, useState } from 'react';
import { CheckCheck, Eye, Mail, Search, Trash2 } from 'lucide-react';

const statusLabel=value=>value==='replied'?'Replied':value==='read'?'Read':'New';

export default function InquiriesManager({items=[],patch,remove}){
  const [search,setSearch]=useState(''),[status,setStatus]=useState('all'),[open,setOpen]=useState(null);
  const shown=useMemo(()=>items.filter(item=>{
    const text=`${item.name} ${item.email} ${item.phone||''} ${item.subject} ${item.message}`.toLowerCase();
    return (status==='all'||item.status===status)&&text.includes(search.toLowerCase().trim());
  }),[items,search,status]);
  const view=async item=>{setOpen(item._id);if(item.status==='new')await patch(item._id,{status:'read'})};
  const selected=items.find(item=>item._id===open);
  return <section className="panel inquiries-panel">
    <div className="section-title toolbar"><div><p>CUSTOMER MESSAGES</p><h2>Inquiries <span>{items.length}</span></h2></div></div>
    <div className="inquiry-filters"><label><Search size={18}/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search name, email, subject or message..."/></label><select value={status} onChange={event=>setStatus(event.target.value)}><option value="all">All statuses</option><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option></select></div>
    {shown.length?<div className="table-wrap"><table className="inquiries-table"><thead><tr><th>Customer</th><th>Subject</th><th>Message</th><th>Received</th><th>Status</th><th>Actions</th></tr></thead><tbody>{shown.map(item=><tr key={item._id} className={item.status==='new'?'is-new':''}><td><b>{item.name}</b><small>{item.email}</small><small>{item.phone||'No phone'}</small></td><td><b>{item.subject}</b></td><td className="inquiry-message"><span>{item.message}</span></td><td>{new Date(item.createdAt).toLocaleString('en-PK')}</td><td><span className={`inquiry-status ${item.status}`}>{statusLabel(item.status)}</span></td><td><div className="inquiry-actions"><button onClick={()=>view(item)}><Eye size={16}/> View</button>{item.status!=='replied'&&<button onClick={()=>patch(item._id,{status:'replied'})}><CheckCheck size={16}/> Replied</button>}<button className="danger" onClick={()=>window.confirm('Delete this inquiry permanently?')&&remove(item._id)}><Trash2 size={16}/> Delete</button></div></td></tr>)}</tbody></table></div>:<div className="inquiry-empty"><Mail size={32}/><h3>No inquiries found.</h3></div>}
    {selected&&<div className="inquiry-modal" role="dialog" aria-modal="true"><article><button className="inquiry-close" onClick={()=>setOpen(null)} aria-label="Close">×</button><p>CONTACT INQUIRY</p><h2>{selected.subject}</h2><div className="inquiry-person"><b>{selected.name}</b><a href={`mailto:${selected.email}`}>{selected.email}</a>{selected.phone&&<a href={`tel:${selected.phone}`}>{selected.phone}</a>}</div><blockquote>{selected.message}</blockquote><small>Received {new Date(selected.createdAt).toLocaleString('en-PK')}</small><div className="inquiry-modal-actions"><a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}>Reply by Email</a>{selected.status!=='replied'&&<button onClick={async()=>{await patch(selected._id,{status:'replied'});setOpen(null)}}>Mark as Replied</button>}</div></article></div>}
  </section>;
}
