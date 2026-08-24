import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { catalog } from '../data/catalog.js';
import ProductCard from '../components/ProductCard.jsx';
import { matchesProductSearch, productSearchText } from '../utils/productSearch.js';

const matchesCategory = (product, category) => {
  if (category === 'all') return true;
  const wanted = category.toLowerCase().trim();
  const productCategory = String(product.category?.name || product.category || '').toLowerCase();
  const department = String(product.department || '').toLowerCase();
  return productCategory === wanted || department === wanted || productSearchText(product).includes(wanted);
};

export default function SearchPage() {
  const [params] = useSearchParams();
  const category = params.get('category') || 'all';
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  useEffect(() => { api('/products').then(data => setProducts(data.products)).catch(() => {}); }, []);
  const results = useMemo(() => products.filter(product => matchesCategory(product, category) && matchesProductSearch(product, query)), [products, query, category]);

  return <main className="page-shell">
    <p className="eyebrow text-[#8f4a14]">Find your favourite</p><h1 className="page-title">Search the bakery.</h1>
    <p className="page-copy">Search by product name, flavour, category or type—like chocolate, anniversary, birthday, chicken or pastries.</p>
    <label className="relative mt-9 block max-w-3xl"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8f4a14]" size={18}/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} className="input-field pl-11" placeholder="Search cakes, flavours, categories or savoury items" /></label>
    <div className="mt-10 flex items-center justify-between border-b border-[#d9bd7c] pb-4"><p className="text-[10px] font-bold tracking-[.14em] text-[#8f4a14] uppercase">{results.length} item{results.length === 1 ? '' : 's'} found</p><p className="text-xs capitalize text-[#805941]">{category === 'all' ? 'All bakery items' : category}</p></div>
    {results.length ? <div className="mt-7 grid grid-cols-2 gap-5 md:grid-cols-4">{results.map(product => <ProductCard key={product.slug} product={product}/>)}</div> : <div className="surface-card mt-7 max-w-2xl"><h2 className="font-display text-3xl">No bakery item found.</h2><p className="mt-3 text-sm leading-6 text-[#805941]">Try another product name, flavour or choose All to explore every available item.</p></div>}
  </main>;
}
