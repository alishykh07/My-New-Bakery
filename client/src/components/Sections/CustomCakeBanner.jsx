import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CustomCakeBanner() {
  return <section className="relative isolate bg-bakery p-3 md:p-6">
    <div aria-hidden="true" className="absolute right-[18%] top-[12%] h-72 w-72 rounded-full bg-gold/20 blur-3xl"/>
    <div className="relative grid min-h-[620px] overflow-hidden rounded-[30px] border border-white/25 shadow-[0_24px_65px_rgba(20,3,1,.4)] md:grid-cols-2">
    <div className="min-h-[400px] bg-[url('https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=1300&q=85')] bg-cover bg-center"/>
    <div className="flex flex-col justify-center bg-cream/62 px-8 py-20 text-bakery backdrop-blur-2xl md:px-[9vw]">
      <div data-reveal>
        <p className="eyebrow text-[#8f4a14]">Made for your moment</p>
        <h2 className="font-display text-5xl leading-[.94] tracking-[-.055em] md:text-7xl">Your dream cake,<br/><em className="font-normal">in every detail.</em></h2>
        <p className="mt-7 max-w-md text-sm leading-7 text-[#6d3b22]">Tell us your flavour, colours, theme and date. We will turn it into a cake worth talking about.</p>
        <Link to="/custom-cake" className="mt-8 inline-flex items-center gap-3 text-[10px] font-extrabold tracking-[.13em] uppercase">Start a custom order <ArrowRight size={17}/></Link>
      </div>
    </div>
    </div>
  </section>;
}
