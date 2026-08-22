const API_URL=import.meta.env.VITE_API_URL||'http://localhost:5000/api';

function endSession(inactive=false){
  localStorage.removeItem('mnb_token');
  localStorage.removeItem('mnb_user');
  sessionStorage.setItem('mnb_auth_message',inactive?'Your account is inactive. Please contact the bakery.':'Your 30-day session expired. Please login again.');
  window.location.assign('/login');
}

export async function api(path,options={}){
  const token=localStorage.getItem('mnb_token');
  let response;
  const fetchRequest=()=>fetch(`${API_URL}${path}`,{...options,headers:{...(options.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(token?{Authorization:`Bearer ${token}`}:{}) ,...options.headers}});
  try{
    response=await fetchRequest();
  }catch{
    await new Promise(resolve=>window.setTimeout(resolve,450));
    try{response=await fetchRequest()}catch{throw new Error('Server is temporarily unreachable. Your login is محفوظ.')}
  }
  const data=await response.json().catch(()=>({}));
  const isLoginRequest=path==='/auth/login'||path==='/auth/register';
  if(response.status===401&&token&&!isLoginRequest){
    if(data.code==='ACCOUNT_INACTIVE'){
      endSession(true);
      throw new Error(data.message||'Your account is inactive.');
    }
    throw new Error(`${data.message||'Request was not authorized'}. Your login has been kept.`);
  }
  if(!response.ok)throw new Error(data.message||'Request failed');
  return data;
}
