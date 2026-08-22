import { useEffect, useId, useState } from 'react';
import { Clock3, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { api } from '../services/api.js';
import { useSiteConfig } from '../services/siteConfig.js';
import ContactGlobeThree from '../components/Contact/ContactGlobeThree.jsx';
import './ContactPage.css';

const branches=[
  {name:'Afandi Town Hyderabad Branch',address:'My New Bakery - Afandi Town, Hyderabad, Sindh 17000, Pakistan',longitude:68.373,latitude:25.397},
  {name:'Auto Bahn Rd Hyderabad Branch',address:'Auto Bahn Road, opposite Unique Shopping Mall and Apartments, Latifabad Unit 2, Hyderabad, Sindh 71000, Pakistan',longitude:68.357,latitude:25.365},
  {name:'Bhurgari Rd Hyderabad Branch',address:'My New Bakery - Bhurgari Rd, Heerabad, Hyderabad, Sindh, Pakistan',longitude:68.368,latitude:25.401},
  {name:'Qasimabad Hyderabad Branch',address:'Plot # 9 Indus Gas Colony, Main Qasimabad Rd, Qasimabad, Hyderabad, Sindh 71000, Pakistan',longitude:68.337,latitude:25.382},
  {name:'Thandi Sarak Hyderabad Branch',address:'My New Bakery - Thandi Sarak, Hyderabad, Sindh 71500, Pakistan',longitude:68.371,latitude:25.378}
];
const routeStarts=[[-18,36],[8,-8],[125,44],[112,-12],[-62,-18]];
const routeBends=[[38,10],[46,-2],[91,5],[86,-18],[18,-7]];

const chartScripts=['https://cdn.amcharts.com/lib/5/index.js','https://cdn.amcharts.com/lib/5/map.js','https://cdn.amcharts.com/lib/5/geodata/worldLow.js','https://cdn.amcharts.com/lib/5/themes/Animated.js'];
let chartLoader;
function loadCharts(){
  if(window.am5&&window.am5map&&window.am5geodata_worldLow)return Promise.resolve();
  if(!chartLoader)chartLoader=chartScripts.reduce((chain,src)=>chain.then(()=>new Promise((resolve,reject)=>{
    const existing=document.querySelector(`script[src="${src}"]`);
    if(existing){if(existing.dataset.loaded==='true'||existing.readyState==='complete')resolve();else{existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true})}return}
    const script=document.createElement('script');script.src=src;script.async=false;script.onload=()=>{script.dataset.loaded='true';resolve()};script.onerror=reject;document.head.appendChild(script);
  })),Promise.resolve());
  return chartLoader;
}

function ContactGlobe(){
  const rawId=useId(),[failed,setFailed]=useState(false),id=`contact-globe-${rawId.replace(/:/g,'')}`;
  useEffect(()=>{let disposed=false,root;
    loadCharts().then(()=>{if(disposed)return;const {am5,am5map,am5geodata_worldLow,am5themes_Animated}=window;
      root=am5.Root.new(id);root.setThemes([am5themes_Animated.new(root)]);
      const chart=root.container.children.push(am5map.MapChart.new(root,{panX:'rotateX',panY:'rotateY',wheelY:'zoom',pinchZoom:true,wheelSensitivity:.22,projection:am5map.geoOrthographic(),rotationX:18,rotationY:0,homeRotationX:-68.35,homeRotationY:-25.38,homeZoomLevel:.76,zoomLevel:.7,minZoomLevel:.6,maxZoomLevel:5}));
      const background=chart.series.push(am5map.MapPolygonSeries.new(root,{}));background.mapPolygons.template.setAll({fill:am5.color(0x180805),strokeOpacity:0});background.data.push({geometry:am5map.getGeoRectangle(90,180,-90,-180)});
      const countries=chart.series.push(am5map.MapPolygonSeries.new(root,{geoJSON:am5geodata_worldLow}));countries.mapPolygons.template.setAll({fill:am5.color(0x3d1a10),stroke:am5.color(0x9a6c48),strokeWidth:.45,strokeOpacity:.45,tooltipText:'{name}'});countries.mapPolygons.template.adapters.add('fill',(fill,target)=>target.dataItem?.get('id')==='PK'?am5.color(0x8a531e):fill);
      const routes=chart.series.push(am5map.MapLineSeries.new(root,{}));routes.mapLines.template.setAll({stroke:am5.color(0xffbf00),strokeWidth:1.6,strokeOpacity:.72,shadowColor:am5.color(0xffb000),shadowBlur:9,shadowOpacity:.62});routes.data.setAll(branches.map((branch,index)=>({...branch,geometry:{type:'LineString',coordinates:[[branch.longitude,branch.latitude],routeBends[index],routeStarts[index]]}})));
      const flowBullet=()=>am5.Bullet.new(root,{locationX:0,sprite:am5.Circle.new(root,{radius:3.2,fill:am5.color(0xffd000),stroke:am5.color(0xfff1bb),strokeWidth:1,shadowColor:am5.color(0xffc400),shadowBlur:7})});
      routes.bullets.push(flowBullet);routes.bullets.push(flowBullet);routes.bullets.push(flowBullet);
      const startRouteParticles=()=>{if(disposed)return;const ready=routes.dataItems.some(item=>item.bullets?.length);if(!ready){window.setTimeout(startRouteParticles,250);return}routes.dataItems.forEach((item,index)=>{item.bullets?.forEach((bullet,particleIndex)=>{const duration=5600+index*360;window.setTimeout(()=>{if(disposed)return;bullet.animate({key:'locationX',from:0,to:1,duration,easing:am5.ease.linear,loops:Infinity})},particleIndex*(duration/3)+index*120)})})};
      const points=chart.series.push(am5map.MapPointSeries.new(root,{}));points.bullets.push((_root,_series,dataItem)=>{const index=dataItem.dataContext.index||0,angles=[-90,-18,54,126,198],angle=angles[index]*Math.PI/180;const holder=am5.Container.new(root,{dx:Math.cos(angle)*13,dy:Math.sin(angle)*13});const pulse=holder.children.push(am5.Circle.new(root,{radius:9,fill:am5.color(0xc8890a),fillOpacity:.2}));pulse.animate({key:'scale',from:.7,to:1.8,duration:1500,loops:Infinity,easing:am5.ease.out(am5.ease.cubic)});pulse.animate({key:'fillOpacity',from:.4,to:0,duration:1500,loops:Infinity});const tooltip=am5.Tooltip.new(root,{getFillFromSprite:false,pointerOrientation:'vertical'});tooltip.get('background').setAll({fill:am5.color(0xfff9ed),fillOpacity:.98,stroke:am5.color(0xc8890a),strokeWidth:1,cornerRadius:8,shadowColor:am5.color(0x2c0903),shadowBlur:12,shadowOpacity:.18});tooltip.label.setAll({fill:am5.color(0x2c0903),fontSize:11,maxWidth:245,oversizedBehavior:'wrap',paddingTop:10,paddingRight:12,paddingBottom:10,paddingLeft:12});holder.children.push(am5.Circle.new(root,{radius:6,fill:am5.color(0xc8890a),stroke:am5.color(0xffefc2),strokeWidth:1.5,tooltip,tooltipText:'[bold]{name}[/]\n{address}',interactive:true,cursorOverStyle:'pointer'}));return am5.Bullet.new(root,{sprite:holder})});
      points.data.setAll(branches.map((branch,index)=>({...branch,index,geometry:{type:'Point',coordinates:[branch.longitude,branch.latitude]}})));
      chart.appear(900,100);window.setTimeout(()=>{if(disposed)return;chart.animate({key:'rotationX',to:-68.35,duration:2400,easing:am5.ease.inOut(am5.ease.cubic)});chart.animate({key:'rotationY',to:-25.38,duration:2400,easing:am5.ease.inOut(am5.ease.cubic)});chart.animate({key:'zoomLevel',to:.76,duration:2400,easing:am5.ease.inOut(am5.ease.cubic)});startRouteParticles()},250);
    }).catch(()=>{if(!disposed)setFailed(true)});
    return()=>{disposed=true;root?.dispose()};
  },[id]);
  return <div className="contact-globe-wrap"><div id={id} className="contact-globe" aria-label="Interactive globe showing My New Bakery branches in Hyderabad"/>{failed&&<div className="contact-globe__fallback"><MapPin/><strong>Hyderabad, Sindh</strong><span>Five bakery branches near you</span></div>}<span className="contact-globe__caption">Drag the globe · Hover a marker for branch details</span></div>;
}

export default function ContactPage(){
  const config=useSiteConfig(),[form,setForm]=useState({name:'',email:'',phone:'',subject:'',message:''}),[state,setState]=useState({sending:false,message:'',error:false});
  const contact=config.contactContent||{},social=config.socialLinks||{};
  const phone=contact.phone||config.phone||'+92 300 0000000',whatsapp=contact.whatsapp||social.whatsapp||phone,email=contact.email||config.email||'hello@mynewbakery.pk';
  const shownBranches=Array.isArray(contact.branches)&&contact.branches.length?contact.branches.filter(branch=>branch?.name&&Number.isFinite(Number(branch.latitude))&&Number.isFinite(Number(branch.longitude))).map(branch=>({...branch,latitude:Number(branch.latitude),longitude:Number(branch.longitude)})):branches;
  const update=event=>setForm(current=>({...current,[event.target.name]:event.target.value}));
  const submit=async event=>{event.preventDefault();setState({sending:true,message:'',error:false});try{const result=await api('/contact-messages',{method:'POST',body:JSON.stringify(form)});setForm({name:'',email:'',phone:'',subject:'',message:''});setState({sending:false,message:result.message,error:false})}catch(error){setState({sending:false,message:error.message,error:true})}};
  return <main className="contact-page">
    <section className="contact-overview"><div className="contact-overview__details"><span className="contact-kicker">{contact.eyebrow||'MY NEW BAKERY'}</span><h1>{contact.title||'Contact us'}</h1><i/><p>{contact.introduction||config.contactText||"We'd love to hear from you. Whether you have a question, need help with an order, or want to discuss a custom cake, our team is here to help."}</p><div className="contact-details">
      <a href={`tel:${phone}`}><span><Phone size={18}/></span><div><strong>Call Us</strong><small>{phone}</small></div></a>
      <a href={`https://wa.me/${String(whatsapp).replace(/\D/g,'')}`} target="_blank" rel="noreferrer"><span><MessageCircle size={18}/></span><div><strong>WhatsApp</strong><small>{whatsapp}</small></div></a>
      <a href={`mailto:${email}`}><span><Mail size={18}/></span><div><strong>Email Us</strong><small>{email}</small></div></a>
      <div><span><MapPin size={18}/></span><div><strong>Visit Our Bakery</strong><small>{contact.address||config.address||'Hyderabad, Sindh, Pakistan'}</small></div></div><div><span><Clock3 size={18}/></span><div><strong>Opening Hours</strong><small>{contact.openingHours||config.orderTimings||'Mon – Sun: 10:00 AM – 9:00 PM'}</small></div></div>
    </div></div><ContactGlobeThree branches={shownBranches}/></section>
    <section className="contact-form-section"><div className="contact-form-copy"><span className="contact-kicker">{contact.formKicker||'GET IN TOUCH'}</span><h2>{contact.formTitle||'Send us a message'}</h2><i/><p>{contact.formDescription||'Tell us how we can help. Our bakery team will get back to you as soon as possible.'}</p></div><form onSubmit={submit}>
      <label><span>Your Name</span><input name="name" value={form.name} onChange={update} required autoComplete="name" placeholder="Your name"/></label><label><span>Email Address</span><input type="email" name="email" value={form.email} onChange={update} required autoComplete="email" placeholder="Email address"/></label>
      <label className="contact-form-wide"><span>Phone Number</span><input name="phone" value={form.phone} onChange={update} autoComplete="tel" placeholder="Phone number"/></label><label className="contact-form-wide"><span>Subject</span><input name="subject" value={form.subject} onChange={update} required placeholder="How can we help?"/></label><label className="contact-form-wide"><span>Message</span><textarea name="message" value={form.message} onChange={update} required rows="6" placeholder="Write your message"/></label>
      {state.message&&<p className={`contact-form-status${state.error?' is-error':''}`} role="status">{state.message}</p>}<button className="contact-send" disabled={state.sending}><Send size={17}/>{state.sending?'Sending...':contact.formButton||'Send Message'}</button>
    </form></section>
  </main>;
}
