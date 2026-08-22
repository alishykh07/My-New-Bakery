import { createContext,useContext,useMemo,useState } from 'react';
const CartContext=createContext(null);
export function CartProvider({children}){const [items,setItems]=useState([]);const value=useMemo(()=>({items,setItems,count:items.reduce((sum,item)=>sum+item.quantity,0)}),[items]);return <CartContext.Provider value={value}>{children}</CartContext.Provider>}
export const useCart=()=>{const context=useContext(CartContext);if(!context)throw new Error('useCart must be used within CartProvider');return context};
