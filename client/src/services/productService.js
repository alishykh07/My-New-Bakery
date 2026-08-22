import { api } from './api';
export const getProducts=(params='')=>api(`/products${params}`);
export const getProduct=(slug)=>api(`/products/${slug}`);
