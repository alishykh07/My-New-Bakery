import { Link } from 'react-router-dom';import { ShoppingBag } from 'lucide-react';
export default function EmptyCart(){return <main className="page-shell text-center"><ShoppingBag className="mx-auto text-[#9b5b13]" size={45}/><h1 className="page-title mt-5">Your bag is waiting.</h1><Link className="gold-button mt-7" to="/cakes">Shop cakes</Link></main>}
