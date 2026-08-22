import { Star } from 'lucide-react';

export function RatingStars({value=0,size=18,className=''}){
  return <span className={`inline-flex items-center gap-1 ${className}`} aria-label={`${Number(value).toFixed(1)} out of 5 stars`}>{[0,1,2,3,4].map(index=>{const fill=Math.max(0,Math.min(1,Number(value)-index));return <span key={index} className="relative inline-block shrink-0" style={{width:size,height:size}}><Star className="absolute inset-0 text-[#bd9250]" size={size}/><span className="absolute inset-0 overflow-hidden" style={{width:`${fill*100}%`}}><Star className="absolute left-0 top-0 max-w-none text-gold" size={size} fill="#fece00"/></span></span>})}</span>;
}

export function RatingInput({value,onChange,size=30}){
  return <div className="flex flex-wrap items-center gap-3" role="radiogroup" aria-label="Choose rating"><div className="flex gap-1">{[0,1,2,3,4].map(index=>{const fill=Math.max(0,Math.min(1,value-index));return <button type="button" key={index} className="relative cursor-pointer" style={{width:size,height:size}} onClick={event=>{const rect=event.currentTarget.getBoundingClientRect();onChange(index+(event.clientX-rect.left<rect.width/2?.5:1))}} aria-label={`${index+.5} or ${index+1} stars`}><Star className="absolute inset-0 text-[#bd9250]" size={size}/><span className="absolute inset-0 overflow-hidden" style={{width:`${fill*100}%`}}><Star className="absolute left-0 top-0 max-w-none text-gold" size={size} fill="#fece00"/></span></button>})}</div><strong className="min-w-12 text-sm text-[#8f4a14]">{Number(value).toFixed(1)}/5</strong></div>;
}
