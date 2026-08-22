import { useEffect,useRef,useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft,ChevronRight,Quote } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../../services/api.js';
import { RatingStars } from '../Reviews/RatingStars.jsx';

gsap.registerPlugin(ScrollTrigger);
export default function CustomerReviews(){
  const section=useRef(null),[reviews,setReviews]=useState([]),[active,setActive]=useState(0),[paused,setPaused]=useState(false);
  useEffect(()=>{api('/reviews/approved?limit=10').then(data=>setReviews(data.reviews||[])).catch(()=>setReviews([]))},[]);
  useEffect(()=>{if(!reviews.length||paused)return;const timer=window.setInterval(()=>setActive(index=>(index+1)%reviews.length),6500);return()=>window.clearInterval(timer)},[reviews.length,paused]);
  useEffect(()=>{if(!reviews.length)return;const ctx=gsap.context(()=>{gsap.from('.customer-testimonial-shell',{opacity:0,y:45,duration:.85,ease:'power3.out',scrollTrigger:{trigger:section.current,start:'top 82%',once:true}})},section);return()=>ctx.revert()},[reviews]);
  useEffect(()=>{if(active>=reviews.length)setActive(0)},[active,reviews.length]);
  if(!reviews.length)return null;
  const move=direction=>setActive(index=>(index+direction+reviews.length)%reviews.length);
  return <section ref={section} className="customer-reviews-section px-6 py-24 md:px-[7vw] md:py-28"><div className="mx-auto max-w-[1320px]"><div className="customer-reviews-heading"><div><p className="eyebrow text-[#9b4f19]">Fresh words from our customers</p><h2 className="font-display text-5xl tracking-[-.055em] text-bakery md:text-7xl">Made with love, <em className="font-normal text-[#a55b20]">remembered with joy</em></h2></div><Link className="gold-button shrink-0" to="/review">Leave a review</Link></div><div className="customer-testimonial-shell" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}><div className="customer-testimonial-track" style={{transform:`translate3d(-${active*100}%,0,0)`}}>{reviews.map(review=><article className="customer-testimonial-slide" key={review._id}><div className="customer-testimonial-image"><img src={review.product?.images?.[0]||'/images/cakes/Header.jfif'} alt={review.product?.name||'My New Bakery creation'}/><span>{review.product?.name||'My New Bakery'}</span></div><div className="customer-testimonial-copy"><Quote size={34}/><RatingStars value={review.rating} size={19}/><blockquote>{review.comment&&String(review.comment).toLowerCase()!=='nan'?review.comment:'A lovely bakery experience.'}</blockquote><footer><div><b>{review.customer?.name||'Bakery customer'}</b>{review.product?.slug?<Link to={`/products/${review.product.slug}`}>{review.product.name}</Link>:<span>{review.product?.name}</span>}</div><time>{new Date(review.createdAt).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</time></footer></div></article>)}</div><div className="customer-testimonial-controls"><button onClick={()=>move(-1)} aria-label="Previous review"><ChevronLeft/></button><div role="tablist" aria-label="Choose customer review">{reviews.map((review,index)=><button key={review._id} role="tab" aria-label={`Review ${index+1}`} aria-selected={index===active} className={index===active?'active':''} onClick={()=>setActive(index)}/>)}</div><button onClick={()=>move(1)} aria-label="Next review"><ChevronRight/></button></div></div></div></section>;
}
