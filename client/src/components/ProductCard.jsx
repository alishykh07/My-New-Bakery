import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice.js';

const horizontalPath = 'M1 5 C22 1 35 7 58 4 S96 2 122 5 S166 7 194 3 S236 2 265 5';
const verticalPath = 'M4 1 C1 34 7 58 4 91 S2 147 5 182 S7 238 3 276 S2 337 5 376 S7 438 4 478 S2 526 4 554';
const scribblePath = 'M126 8c-10 10-26 17-41 22-24 9-50 14-74 23 24 5 55 0 94 8 8 4-13 7-15 7-18 3-31 7-45 11 25 6 59 0 90 2 25 2-12 7-38 12-31 6-52 10-64 16 32 7 74 0 113 8 16 4-38 11-61 16-28 6-45 12-56 18 39 8 87 0 127 10 13 4-41 12-66 17-37 8-59 14-70 20 40 6 90 0 130 8 17 4-40 12-64 17-25 5-45 11-57 16 42 7 88 0 126 9 14 4-31 10-52 15-22 5-38 10-48 15 35 7 75 2 111 11';

export default function ProductCard({ product }) {
  const image = product.images?.[0] || product.image;
  const startingPrice = product.variants?.length ? Math.min(...product.variants.map(option => Number(option.price) || 0)) : product.price;

  return <article className="bakery-product-card group">
    <svg aria-hidden="true" viewBox="0 0 266 8" preserveAspectRatio="none" className="bakery-card-line bakery-card-line-top"><path d={horizontalPath}/></svg>
    <svg aria-hidden="true" viewBox="0 0 266 8" preserveAspectRatio="none" className="bakery-card-line bakery-card-line-bottom"><path d={horizontalPath}/></svg>
    <svg aria-hidden="true" viewBox="0 0 8 555" preserveAspectRatio="none" className="bakery-card-line bakery-card-line-left"><path d={verticalPath}/></svg>
    <svg aria-hidden="true" viewBox="0 0 8 555" preserveAspectRatio="none" className="bakery-card-line bakery-card-line-right"><path d={verticalPath}/></svg>
    <svg aria-hidden="true" viewBox="0 0 166 306" preserveAspectRatio="none" className="bakery-card-scribble"><path d={scribblePath}/></svg>

    <div className="relative z-[2] flex items-center justify-between gap-2 text-[10px] font-extrabold tracking-[.08em] text-gold uppercase md:text-xs">
      <span>{product.variants?.length ? 'From ' : ''}{formatPrice(startingPrice)}</span>
      <span>{product.bestSeller ? 'Best Seller' : 'Fresh'}</span>
    </div>

    <Link to={`/products/${product.slug}`} className="relative z-[1] mt-4 block overflow-hidden" aria-label={`View ${product.name}`}>
      <div className="relative mx-auto aspect-[.84] w-[84%] overflow-hidden bg-white/10">{product.bestSeller&&<span className="bakery-best-seller-badge">Best seller</span>}
        <img loading="lazy" decoding="async" className="h-full w-full object-contain p-1 transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-within:scale-[1.03]" src={image} alt={product.name}/>
      </div>
      <span className="bakery-card-action"><span>View item</span><ArrowUpRight size={16}/></span>
    </Link>

    <div className="relative z-[2] mt-4 text-center">
      <p className="text-[8px] font-extrabold tracking-[.14em] text-gold uppercase md:text-[9px]">{product.category?.name || product.category}</p>
      <Link to={`/products/${product.slug}`} className="focus-visible:outline-none"><h3 className="mt-2 font-display text-lg leading-tight text-cream transition-colors group-hover:text-gold md:text-2xl">{product.name}</h3></Link>
    </div>
  </article>;
}
