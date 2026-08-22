import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '../components/Hero/Hero.jsx';
import CategoryBar from '../components/Categories/CategoryBar.jsx';
import FavouriteCategories from '../components/Sections/FavouriteCategories.jsx';
import FeaturedProducts from '../components/Sections/FeaturedProducts.jsx';
import CustomerReviews from '../components/Sections/CustomerReviews.jsx';
import CustomCakeBanner from '../components/Sections/CustomCakeBanner.jsx';

gsap.registerPlugin(ScrollTrigger);
export default function HomePage(){const root=useRef(null);useEffect(()=>{const ctx=gsap.context(()=>{gsap.from('[data-hero]',{y:42,stagger:.12,duration:.85,ease:'power3.out'});gsap.utils.toArray('[data-reveal]').forEach(element=>gsap.from(element,{opacity:0,y:35,duration:.7,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 88%',once:true}}))},root);return()=>ctx.revert()},[]);return <main ref={root}><Hero/><CategoryBar/><FavouriteCategories/><FeaturedProducts/><CustomerReviews/><CustomCakeBanner/></main>}
