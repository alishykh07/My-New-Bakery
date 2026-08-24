import { useEffect, useState } from 'react';
import { shopCategories as fallbackCategories } from '../data/categories.js';
import { api } from '../services/api.js';

const mainLink = item => `/${item.productType === 'paties' ? 'paties' : 'cakes'}?department=${encodeURIComponent(item.slug)}`;
const subLink = (main, sub) => `${mainLink(main)}&category=${encodeURIComponent(sub.name)}`;
const fallback = fallbackCategories.map(item=>({...item,showInTopNavigation:true,showInCategoryBar:true,subcategories:[]}));
let cachedCategories;
let categoriesRequest;

function loadCategories() {
  if (cachedCategories) return Promise.resolve(cachedCategories);
  if (!categoriesRequest) categoriesRequest=Promise.all([api('/main-categories'),api('/categories')]).then(([mainData,subData])=>{
    const subs=subData.categories.filter(item=>item.isActive!==false&&item.showInNavigation!==false);
    cachedCategories=mainData.mainCategories.filter(item=>item.isActive!==false).map(item=>({
      key:item.slug,label:item.name,to:mainLink(item),productType:item.productType,
      showInTopNavigation:item.showInTopNavigation!==false,showInCategoryBar:item.showInCategoryBar!==false,
      subcategories:subs.filter(sub=>(sub.department||'cakes')===item.slug).map(sub=>({key:sub.slug||sub._id,label:sub.name,to:subLink(item,sub)})),
    }));
    return cachedCategories;
  }).finally(()=>{categoriesRequest=undefined});
  return categoriesRequest;
}

export function useShopCategories() {
  const [categories,setCategories]=useState(cachedCategories||[]);
  useEffect(()=>{let active=true;loadCategories().then(items=>{if(active)setCategories(items)}).catch(()=>{});return()=>{active=false}},[]);
  return categories;
}
