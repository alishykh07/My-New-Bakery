import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/productService.js';
import ProductCard from '../ProductCard.jsx';

const INITIAL_VISIBLE = 8;
const LOAD_STEP = 8;

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getProducts('?featured=true')
      .then(data => {
        if (alive) setProducts((data.products || []).filter(item => item.featured));
      })
      .catch(() => {
        if (alive) setProducts([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const shown = useMemo(() => products.slice(0, visible), [products, visible]);
  const canLoadMore = visible < products.length;

  return <section className="content-auto bg-bakery px-6 py-24 md:px-[7vw] md:py-32">
    <div data-reveal>
      <div className="mb-12 flex items-end justify-between">
        <div><p className="eyebrow">Fresh from our oven</p><h2 className="font-display text-5xl tracking-[-.055em] md:text-7xl">Our most loved <em className="font-normal text-gold">cakes</em></h2></div>
        <Link to="/cakes" className="hidden text-[10px] font-bold tracking-[.13em] text-gold uppercase md:block">View all cakes</Link>
      </div>
      {loading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">{Array.from({length: INITIAL_VISIBLE}, (_, index) => <div key={index} className="min-h-[360px] animate-pulse border border-gold/45 bg-[#4a1008]" />)}</div> : shown.length ? <>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">{shown.map(product => <ProductCard key={product.slug} product={product}/>)}</div>
        {canLoadMore && <div className="mt-10 text-center"><button className="gold-button" onClick={() => setVisible(count => count + LOAD_STEP)}>Load more</button></div>}
      </> : <p className="text-sm text-gold/80">Featured products will appear here soon.</p>}
    </div>
  </section>;
}