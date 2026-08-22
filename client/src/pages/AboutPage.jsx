import { useEffect, useMemo, useRef, useState } from 'react';
import { Award, CakeSlice, CalendarDays, Heart, Leaf, Smile, Star, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../services/api.js';
import { useSiteConfig } from '../services/siteConfig.js';
import './AboutPage.css';

gsap.registerPlugin(ScrollTrigger);
const reasons=[[Leaf,'Fresh ingredients','Premium ingredients selected fresh for everything we bake.'],[Heart,'Handmade with love','Every product is handcrafted with patience and care.'],[CakeSlice,'Custom cakes','From birthdays to weddings, we create cakes just for you.'],[Truck,'On-time delivery','Careful preparation and dependable delivery for your moments.'],[Award,'Quality you trust','Quality and hygiene remain at the heart of every order.']];
const numbers=[[CakeSlice,'500+','Cakes delivered'],[Smile,'1000+','Happy customers'],[Star,'50+','Custom cakes'],[CalendarDays,'5+','Years of experience']];

export default function AboutPage(){
  const config=useSiteConfig(),root=useRef(null),[products,setProducts]=useState([]),[mainCategories,setMainCategories]=useState([]);
  useEffect(()=>{Promise.all([api('/products',{cache:'no-store'}),api('/main-categories',{cache:'no-store'})]).then(([productData,categoryData])=>{setProducts(productData.products||productData||[]);setMainCategories((categoryData.mainCategories||[]).filter(item=>item.isActive!==false))}).catch(()=>{})},[]);
  useEffect(()=>{const context=gsap.context(()=>{gsap.utils.toArray('[data-about-reveal]').forEach(element=>gsap.from(element,{opacity:0,y:28,duration:.7,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 88%',once:true}}))},root);return()=>context.revert()},[]);
  const about=config.aboutContent||{};
  const gallery=useMemo(()=>mainCategories.map((category,index)=>{const department=category.slug,product=products.find(item=>String(item.department||'').toLowerCase()===department&&item.images?.[0]),base=category.productType==='paties'?'/paties':'/cakes';return{name:category.name,department,to:`${base}?department=${encodeURIComponent(department)}`,image:about.creationImages?.[department]||product?.images?.[0]||['/images/cakes/wedding-hero.png','/images/cakes/Header.jfif'][index%2]}}),[mainCategories,products,about.creationImages]);
  const story=about.storyText||config.aboutText||'My New Bakery was founded with a simple idea—to make every celebration a little sweeter. From our humble beginning, we have grown into a trusted name known for quality, taste and love.';
  const shownReasons=reasons.map(([Icon,title,text],index)=>[Icon,about.reasons?.[index]?.title||title,about.reasons?.[index]?.text||text]);
  const shownNumbers=numbers.map(([Icon,value,label],index)=>[Icon,about.stats?.[index]?.value||value,about.stats?.[index]?.label||label]);
  return <main className="about-page" ref={root}>
    <section className="about-hero"><img src={about.heroImage||'/images/cakes/wedding-hero.png'} alt="A celebration cake from My New Bakery"/><div className="about-hero__shade"/><div className="about-shell about-hero__copy" data-about-reveal><span>{about.heroEyebrow||'MY NEW BAKERY'}</span><h1>{about.heroTitle||'Our story'}</h1><i/><p>{about.heroDescription||'We bake thoughtful cakes and golden little bites for the moments you will remember.'}</p></div></section>
    <section className="about-story about-shell" data-about-reveal><div><span className="about-kicker">{about.storyKicker||'OUR STORY'}</span><h2>{about.storyTitle||'Baked with passion, served with love.'}</h2><i/><p>{story}</p><p>{about.storyExtra||'Every cake is made with carefully selected ingredients, skilled hands and attention to the smallest details.'}</p></div><figure><img src={about.storyImage||'/images/cakes/Header.jfif'} alt="Inside My New Bakery"/><figcaption>{about.storyImageLabel||config.bakeryName||'My New Bakery'}</figcaption></figure></section>
    <section className="about-reasons" data-about-reveal><div className="about-shell"><header><span className="about-kicker">{about.reasonsKicker||'WHY CHOOSE US'}</span><h2>{about.reasonsTitle||'What makes us special?'}</h2><i/></header><div className="about-reasons__grid">{shownReasons.map(([Icon,title,text])=><article key={title}><span><Icon size={21}/></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
    <section className="about-creations about-shell" data-about-reveal><header><span className="about-kicker">{about.creationKicker||'OUR CREATIONS'}</span><h2>{about.creationTitle||'Made to make you smile.'}</h2><i/></header><div className="about-gallery">{gallery.map(category=><Link to={category.to} key={category.department}><img src={category.image} alt={category.name}/><span>{category.name}</span></Link>)}</div><Link className="gold-button" to="/cakes">{about.creationButton||'View our products'} →</Link></section>
    <section className="about-numbers" data-about-reveal><div className="about-shell"><header><span className="about-kicker">{about.numbersKicker||'OUR NUMBERS'}</span><h2>{about.numbersTitle||'Serving happiness every day'}</h2></header><div>{shownNumbers.map(([Icon,value,label])=><article key={label}><Icon size={22}/><strong>{value}</strong><span>{label}</span></article>)}</div></div></section>
  </main>
}
