import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catalog } from '../../data/catalog.js';
import { getProducts } from '../../services/productService.js';
import ProductCard from '../ProductCard.jsx';

export default function FeaturedProducts() {
  const [products, setProducts] = useState(() => catalog.filter(item => item.featured));

  useEffect(() => {
    getProducts().then(data => setProducts(data.products.filter(item => item.featured))).catch(() => {});
  }, []);

  return <section className="content-auto bg-bakery px-6 py-24 md:px-[7vw] md:py-32">
    <div data-reveal>
      <div className="mb-12 flex items-end justify-between">
        <div><p className="eyebrow">Fresh from our oven</p><h2 className="font-display text-5xl tracking-[-.055em] md:text-7xl">Our most loved <em className="font-normal text-gold">cakes</em></h2></div>
        <Link to="/cakes" className="hidden text-[10px] font-bold tracking-[.13em] text-gold uppercase md:block">View all cakes →</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">{products.map(product => <ProductCard key={product.slug} product={product}/>)}</div>
    </div>
  </section>;
}
