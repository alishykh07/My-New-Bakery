import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useSiteConfig } from '../../services/siteConfig.js';
import './hero-slider.css';
import './hero-smooth.css';

const shapes=['circle','flower','hexagon','square'];
const maskSvg={
  circle:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><circle cx="150" cy="150" r="140" fill="black"/></svg>',
  flower:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path fill="black" d="M80 10c28 0 52 14 70 37 18-23 42-37 70-37 39 0 70 31 70 70 0 28-14 52-37 70 23 18 37 42 37 70 0 39-31 70-70 70-28 0-52-14-70-37-18 23-42 37-70 37-39 0-70-31-70-70 0-28 14-52 37-70-23-18-37-42-37-70 0-39 31-70 70-70z"/></svg>',
  hexagon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path fill="black" d="M89 15h122l76 135-76 135H89L13 150z"/></svg>',
  square:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect x="10" y="10" width="280" height="280" rx="62" fill="black"/></svg>'
};
const maskUrl=shape=>`url("data:image/svg+xml,${encodeURIComponent(maskSvg[shape]||maskSvg.circle)}")`;
const fallbackSlides=config=>[
  {title:config.heroTitle||'Every celebration deserves a little magic.',description:config.heroDescription||'Handcrafted cakes made for the moments you remember.',image:config.heroImage||'/images/cakes/wedding-hero.png',buttonText:'Explore our cakes',buttonLink:'/cakes',shape:'circle'},
  {title:'Made fresh. Made beautifully.',description:'Celebration cakes and golden little bites, made just the way you imagine them.',image:'/images/cakes/Header.jfif',buttonText:'Shop favourites',buttonLink:'/cakes',shape:'flower'}
];

export default function Hero(){
  const config=useSiteConfig();
  const slides=useMemo(()=>{const saved=(config.heroSlides||[]).filter(slide=>slide?.image||slide?.video);if(saved.length>=2)return saved;const defaults=fallbackSlides(config);return saved.length?[saved[0],defaults.find(slide=>slide.image!==saved[0].image)||defaults[1]]:defaults},[config]);
  const slideShapes=useMemo(()=>{const used=new Set();return slides.map((slide,index)=>{const preferred=shapes.includes(slide.shape)?slide.shape:null;const shape=preferred&&!used.has(preferred)?preferred:shapes.find(item=>!used.has(item))||shapes[index%shapes.length];used.add(shape);return shape})},[slides]);
  const [current,setCurrent]=useState(0),[previous,setPrevious]=useState(-1),[cycle,setCycle]=useState(0),[settled,setSettled]=useState(true);
  const touchX=useRef(0),currentRef=useRef(0),firstReveal=useRef(true);
  const goTo=useCallback(next=>{const active=currentRef.current,target=(next+slides.length)%slides.length;if(target===active)return;currentRef.current=target;setSettled(false);setPrevious(active);setCurrent(target);setCycle(value=>value+1)},[slides.length]);
  useEffect(()=>{const timer=window.setInterval(()=>goTo(current+1),7000);return()=>window.clearInterval(timer)},[current,cycle,goTo]);
  useEffect(()=>{const key=event=>{if(event.key==='ArrowRight')goTo(current+1);if(event.key==='ArrowLeft')goTo(current-1)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[current,goTo]);
  useEffect(()=>{if(current>=slides.length){currentRef.current=0;setCurrent(0)}},[current,slides.length]);
  useEffect(()=>{if(firstReveal.current){firstReveal.current=false;setSettled(true);return}setSettled(false);const timer=window.setTimeout(()=>setSettled(true),1900);return()=>window.clearTimeout(timer)},[current,cycle]);
  useEffect(()=>{
    const upcoming=slides[(current+1)%slides.length];
    if(!upcoming?.image)return undefined;
    const image=new Image();
    image.decoding='async';
    image.src=upcoming.image;
    return()=>{image.onload=null;image.onerror=null};
  },[current,slides]);
  return <section className="labs-hero" aria-label="Featured bakery carousel" onTouchStart={event=>{touchX.current=event.touches[0].clientX}} onTouchEnd={event=>{const distance=event.changedTouches[0].clientX-touchX.current;if(Math.abs(distance)>50)goTo(current+(distance<0?1:-1))}}>
    <div className="sr-only" aria-live="polite">Slide {current+1} of {slides.length}: {slides[current]?.title}</div>
    {slides.map((slide,index)=>{const shape=slideShapes[index];return <article key={`${slide.image||slide.video}-${index}`} className={`labs-hero__slide ${index===current?'is-active':''} ${index===current&&settled?'is-settled':''} ${index===previous?'is-previous':''}`} data-shape={shape} style={{'--hero-mask':maskUrl(shape)}} aria-hidden={index!==current}>
      <div className="labs-hero__media labs-hero__media--counter">{slide.video?<video src={slide.video} poster={slide.image||''} autoPlay={index===current} muted loop playsInline preload={index===current?'auto':'metadata'}/>:<img src={slide.image} alt="" loading={index===0?'eager':'lazy'} fetchPriority={index===0?'high':'auto'} decoding={index===0?'sync':'async'}/>}</div><div className="labs-hero__shade"/>
    </article>})}
    <div key={`${current}-${cycle}`} className="labs-hero__text"><p className="labs-hero__eyebrow">{slides[current]?.eyebrow||'MY NEW BAKERY'}</p><h1>{slides[current]?.title}</h1><p>{slides[current]?.description}</p><Link className="labs-hero__cta" to={slides[current]?.buttonLink||'/cakes'}>{slides[current]?.buttonText||'Explore'} <ArrowUpRight size={17}/></Link></div>
    <div className="labs-hero__bottom-blur" aria-hidden="true"/>
    {slides.length>1&&<div className="labs-hero__controls" aria-label="Hero navigation"><button className="labs-hero__arrow" type="button" onClick={()=>goTo(current-1)} aria-label="Previous slide"><ArrowLeft/></button><div className="labs-hero__progress" role="tablist">{slides.map((slide,index)=><button key={index} className={`labs-hero__dot ${index===current?'is-active':''}`} type="button" onClick={()=>goTo(index)} aria-label={`Go to slide ${index+1}`} aria-selected={index===current}>{index===current&&<span key={`${current}-${cycle}`} className="labs-hero__dot-fill"/>}</button>)}</div><button className="labs-hero__arrow labs-hero__arrow--next" type="button" onClick={()=>goTo(current+1)} aria-label="Next slide"><ArrowLeft/></button></div>}
  </section>;
}
