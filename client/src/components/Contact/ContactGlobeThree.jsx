import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import countriesTopology from 'world-atlas/countries-110m.json';
import { feature as topologyFeature } from 'topojson-client';

const routeStarts=[[-18,36],[8,-8],[125,44],[112,-12],[-62,-18]];
const markerOffsets=[[0,2.2],[2.1,.7],[1.25,-1.8],[-1.35,-1.8],[-2.1,.65]];
const countriesGeo=topologyFeature(countriesTopology,countriesTopology.objects.countries);

function geoPoint(longitude,latitude,radius=1){
  const lon=THREE.MathUtils.degToRad(longitude),lat=THREE.MathUtils.degToRad(latitude),cos=Math.cos(lat);
  return new THREE.Vector3(radius*cos*Math.cos(lon),radius*Math.sin(lat),-radius*cos*Math.sin(lon));
}

function insideRing(longitude,latitude,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if(yi>latitude!==yj>latitude&&longitude<(xj-xi)*(latitude-yi)/(yj-yi||Number.EPSILON)+xi)inside=!inside}return inside}
function countryAt(longitude,latitude){const match=countriesGeo.features.find(country=>{const polygons=country.geometry.type==='Polygon'?[country.geometry.coordinates]:country.geometry.coordinates;return polygons.some(polygon=>insideRing(longitude,latitude,polygon[0])&&!polygon.slice(1).some(hole=>insideRing(longitude,latitude,hole)))});return match?.properties?.name||''}

function drawRing(context,ring,width,height){
  let previousX=null;context.beginPath();ring.forEach(([longitude,latitude],index)=>{const x=(longitude+180)/360*width,y=(90-latitude)/180*height;if(index===0||previousX!==null&&Math.abs(x-previousX)>width/2)context.moveTo(x,y);else context.lineTo(x,y);previousX=x});context.closePath();
}

function useWorldTexture(){
  const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;const context=canvas.getContext('2d');context.fillStyle='#180805';context.fillRect(0,0,canvas.width,canvas.height);countriesGeo.features.forEach(country=>{const polygons=country.geometry.type==='Polygon'?[country.geometry.coordinates]:country.geometry.coordinates;context.fillStyle=country.properties?.name==='Pakistan'?'#8a531e':'#3d1a10';context.strokeStyle='#9a6c48';context.lineWidth=1;polygons.forEach(polygon=>polygon.forEach(ring=>{drawRing(context,ring,canvas.width,canvas.height);context.fill();context.stroke()}))});const next=new THREE.CanvasTexture(canvas);next.colorSpace=THREE.SRGBColorSpace;next.anisotropy=4;next.needsUpdate=true;return next},[]);
  useEffect(()=>()=>texture?.dispose(),[texture]);
  return texture;
}

function FlowParticle({curve,offset=0,speed=.055}){
  const ref=useRef();useFrame(({clock})=>{const progress=(clock.getElapsedTime()*speed+offset)%1;ref.current?.position.copy(curve.getPointAt(progress))});
  return <mesh ref={ref}><sphereGeometry args={[.014,12,12]}/><meshBasicMaterial color="#ffd000" toneMapped={false}/><pointLight color="#ffb000" intensity={.18} distance={.32}/></mesh>;
}

function Route({start,end,index}){
  const curve=useMemo(()=>{const a=geoPoint(start[0],start[1],1.018),b=geoPoint(end[0],end[1],1.018),mid=a.clone().add(b).multiplyScalar(.5).normalize().multiplyScalar(1.27+index*.025);return new THREE.QuadraticBezierCurve3(a,mid,b)},[start,end,index]);
  const points=useMemo(()=>curve.getPoints(90),[curve]);
  return <group><Line points={points} color="#9b5a08" lineWidth={5} transparent opacity={.2}/><Line points={points} color="#d58c00" lineWidth={1.35} transparent opacity={.78}/><FlowParticle curve={curve} offset={0} speed={.042+index*.003}/><FlowParticle curve={curve} offset={.34} speed={.042+index*.003}/><FlowParticle curve={curve} offset={.68} speed={.042+index*.003}/></group>;
}

function BranchMarker({branch,index,onHover}){
  const offset=markerOffsets[index]||[Math.cos(index*2.399)*(.8+Math.floor(index/5)*.35),Math.sin(index*2.399)*(.8+Math.floor(index/5)*.35)],position=geoPoint(branch.longitude+offset[0],branch.latitude+offset[1],1.04);
  const pulse=useRef(),texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=128;canvas.height=160;const context=canvas.getContext('2d');context.shadowColor='rgba(255,180,0,.65)';context.shadowBlur=13;context.beginPath();context.moveTo(64,150);context.bezierCurveTo(53,128,23,94,23,61);context.bezierCurveTo(23,35,41,17,64,17);context.bezierCurveTo(87,17,105,35,105,61);context.bezierCurveTo(105,94,75,128,64,150);context.closePath();context.fillStyle='#c8890a';context.fill();context.shadowBlur=0;context.lineWidth=5;context.strokeStyle='#fff0bd';context.stroke();context.beginPath();context.arc(64,61,18,0,Math.PI*2);context.fillStyle='#2c0903';context.fill();context.lineWidth=4;context.strokeStyle='#ffd86a';context.stroke();const result=new THREE.CanvasTexture(canvas);result.colorSpace=THREE.SRGBColorSpace;result.needsUpdate=true;return result},[]);
  useEffect(()=>()=>texture.dispose(),[texture]);useFrame(({clock})=>{if(pulse.current){const value=1+Math.sin(clock.getElapsedTime()*3+index)*.08;pulse.current.scale.set(.012*value,.016*value,1)}});
  return <group position={position} onPointerEnter={event=>{event.stopPropagation();onHover(branch)}} onPointerLeave={()=>onHover(null)}><sprite ref={pulse} scale={[.012,.016,1]}><spriteMaterial map={texture} transparent depthTest={false} sizeAttenuation={false} toneMapped={false}/></sprite><pointLight color="#ffbd00" intensity={.08} distance={.13}/></group>;
}

function GlobeScene({branches,onHover,onCountryHover}){
  const globe=useRef(),texture=useWorldTexture(),started=useRef(performance.now());
  useFrame(()=>{if(!globe.current)return;const progress=Math.min(1,(performance.now()-started.current)/2400),ease=1-Math.pow(1-progress,3);globe.current.rotation.y=THREE.MathUtils.lerp(THREE.MathUtils.degToRad(-80),THREE.MathUtils.degToRad(-158),ease);globe.current.rotation.x=THREE.MathUtils.lerp(0,THREE.MathUtils.degToRad(25),ease);const scale=THREE.MathUtils.lerp(.82,.9,ease);globe.current.scale.setScalar(scale)});
  return <><ambientLight intensity={1.2}/><directionalLight position={[3,2,4]} intensity={1.5} color="#ffe5b0"/><group ref={globe} scale={.82}>
    <mesh onPointerMove={event=>{event.stopPropagation();if(event.uv)onCountryHover(countryAt(event.uv.x*360-180,event.uv.y*180-90))}} onPointerOut={()=>onCountryHover('')}><sphereGeometry args={[1,96,96]}/><meshStandardMaterial map={texture} color={texture?'#ffffff':'#2c0903'} roughness={.82} metalness={.04}/></mesh>
    <mesh><sphereGeometry args={[1.006,64,64]}/><meshBasicMaterial color="#c8890a" transparent opacity={.035} side={THREE.BackSide}/></mesh>
    {branches.map((branch,index)=><Route key={`route-${branch.name}-${index}`} start={[branch.longitude,branch.latitude]} end={routeStarts[index%routeStarts.length]} index={index}/>)}
    {branches.map((branch,index)=><BranchMarker key={`${branch.name}-${index}`} branch={branch} index={index} onHover={onHover}/>)}
  </group><OrbitControls enablePan={false} enableDamping dampingFactor={.07} minDistance={1.65} maxDistance={5.2} rotateSpeed={.55} zoomSpeed={.7}/></>;
}

export default function ContactGlobeThree({branches}){
  const [hovered,setHovered]=useState(null),[country,setCountry]=useState('');
  return <div className="contact-globe-wrap contact-globe-wrap--three"><Canvas className="contact-globe-three" camera={{position:[0,0,3.15],fov:42}} dpr={[1,1.6]} gl={{antialias:true,alpha:true}}><GlobeScene branches={branches} onHover={setHovered} onCountryHover={setCountry}/></Canvas>{country&&!hovered&&<div className="contact-country-label">{country}</div>}{hovered&&<div className="contact-three-tooltip"><strong>{hovered.name}</strong><span>{hovered.address}</span></div>}<span className="contact-globe__caption">Drag to rotate · Scroll or pinch to zoom · Hover a country or branch</span></div>;
}
