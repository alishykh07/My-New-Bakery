import { gsap } from 'gsap';
export const revealHero=(scope)=>gsap.from(scope.querySelectorAll('[data-hero-reveal]'),{y:35,opacity:0,stagger:.12,duration:.8,ease:'power3.out'});
