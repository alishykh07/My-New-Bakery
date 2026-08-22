import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage(){return <main className="page-shell text-center"><CheckCircle2 className="mx-auto text-[#9b5b13]" size={52}/><p className="eyebrow mt-6 text-[#8f4a14]">Order received</p><h1 className="page-title">Thank you for your order.</h1><p className="page-copy mx-auto">Your bakery order is now with our team. You can track its preparation from My Orders.</p><Link className="gold-button mt-8" to="/orders">View my orders <ArrowRight size={17}/></Link></main>}
