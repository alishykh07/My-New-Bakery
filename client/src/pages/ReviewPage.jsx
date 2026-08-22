import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { catalog } from '../data/catalog.js';
import { useStore } from '../context/StoreContext.jsx';
import { RatingInput } from '../components/Reviews/RatingStars.jsx';

export default function ReviewPage(){
  const {user}=useStore();const [products,setProducts]=useState(catalog),[product,setProduct]=useState(''),[rating,setRating]=useState(5),[comment,setComment]=useState(''),[message,setMessage]=useState('');
  useEffect(()=>{api('/products').then(data=>setProducts(data.products)).catch(()=>{})},[]);
  async function submit(event){event.preventDefault();if(!user){setMessage('Please login before leaving a review.');return}if(!product){setMessage('Please select a product.');return}try{const data=await api('/reviews',{method:'POST',body:JSON.stringify({product,rating,comment})});setMessage(data.message);setComment('');setRating(5)}catch(error){setMessage(error.message)}}
  return <main className="page-shell"><p className="eyebrow text-[#8f4a14]">Share your experience</p><h1 className="page-title">Leave a review.</h1><p className="page-copy">Choose the bakery item you tried, select full or half stars and tell us what you loved.</p><form onSubmit={submit} className="surface-card mt-10 max-w-2xl"><label className="text-[10px] font-bold tracking-[.14em] uppercase">Bakery item</label><select className="input-field mt-3" value={product} onChange={e=>setProduct(e.target.value)} required><option value="">Select a product</option>{products.map(item=><option key={item._id||item.slug} value={item._id||''}>{item.name}</option>)}</select><label className="mt-7 block text-[10px] font-bold tracking-[.14em] uppercase">Your rating</label><div className="mt-3"><RatingInput value={rating} onChange={setRating}/></div><p className="mt-2 text-xs text-[#805941]">Click the left or right half of a star for half or full rating.</p><textarea className="input-field mt-6 min-h-32" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Tell us about the taste, freshness and experience" required/><button className="gold-button mt-5">Submit review</button>{!user&&<p className="mt-4 text-sm"><Link className="font-bold underline" to="/login">Login</Link> to submit your review.</p>}<p className="mt-4 text-sm text-[#8f4a14]">{message}</p></form></main>;
}
