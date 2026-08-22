import { createContext,useContext,useEffect,useMemo,useState } from 'react';
import { api } from '../services/api.js';

const StoreContext=createContext(null);
const CART_KEY='mnb_cart';
const USER_KEY='mnb_user';

export function StoreProvider({children}){
  const [cart,setCart]=useState(()=>JSON.parse(localStorage.getItem(CART_KEY)||'[]'));
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem(USER_KEY)||'null'));
  useEffect(()=>localStorage.setItem(CART_KEY,JSON.stringify(cart)),[cart]);
  useEffect(()=>user?localStorage.setItem(USER_KEY,JSON.stringify(user)):localStorage.removeItem(USER_KEY),[user]);
  useEffect(()=>{
    if(!localStorage.getItem('mnb_token'))return undefined;
    const syncAccount=()=>api('/auth/me').then(data=>setUser(data.user)).catch(()=>{});
    syncAccount();
    const interval=window.setInterval(syncAccount,30000);
    window.addEventListener('focus',syncAccount);
    return()=>{window.clearInterval(interval);window.removeEventListener('focus',syncAccount)};
  },[]);
  const value=useMemo(()=>({cart,user,setUser,add(item){setCart(current=>{const found=current.find(x=>x.slug===item.slug&&x.size===item.size);return found?current.map(x=>x.slug===item.slug&&x.size===item.size?{...x,quantity:x.quantity+item.quantity}:x):[...current,item]})},change(slug,size,amount){setCart(current=>current.map(x=>x.slug===slug&&x.size===size?{...x,quantity:x.quantity+amount}:x).filter(x=>x.quantity>0))},remove(slug,size){setCart(current=>current.filter(x=>!(x.slug===slug&&x.size===size)))},clear(){setCart([])}}),[cart,user]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore=()=>useContext(StoreContext);
