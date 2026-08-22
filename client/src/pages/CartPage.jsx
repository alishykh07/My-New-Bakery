import { useStore } from '../context/StoreContext.jsx';
import CartItem from '../components/Cart/CartItem.jsx';
import CartSummary from '../components/Cart/CartSummary.jsx';
import EmptyCart from '../components/Cart/EmptyCart.jsx';
import { useSiteConfig } from '../services/siteConfig.js';
export default function CartPage(){const {cart,change,remove}=useStore();const config=useSiteConfig();const subtotal=cart.reduce((sum,item)=>sum+item.price*item.quantity,0);if(!cart.length)return <EmptyCart/>;return <main className="page-shell"><p className="eyebrow text-[#8f4a14]">Your selection</p><h1 className="page-title">Shopping bag</h1><div className="mt-10 grid gap-10 lg:grid-cols-[1fr_350px]"><div>{cart.map(item=><CartItem key={`${item.slug}-${item.size}`} item={item} onChange={amount=>change(item.slug,item.size,amount)} onRemove={()=>remove(item.slug,item.size)}/>)}</div><CartSummary subtotal={subtotal} freeDeliveryThreshold={Number(config.freeDeliveryThreshold)||0}/></div></main>}
