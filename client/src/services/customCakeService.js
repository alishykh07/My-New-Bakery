import { api } from './api';
export const submitCustomCake=(form)=>api('/custom-cakes',{method:'POST',body:form});
