"use client";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";

export default function ProductPhotoGallery({title,photos}:{title:string;photos:string[]}){
 const [selected,setSelected]=useState(0);
 const [lightboxOpen,setLightboxOpen]=useState(false);
 const [zoom,setZoom]=useState(1);
 const [pan,setPan]=useState({x:0,y:0});
 const pointers=useRef(new Map<number,{x:number;y:number}>());
 const pinchStart=useRef<{distance:number;zoom:number}|null>(null);
 const dragStart=useRef<{x:number;y:number;panX:number;panY:number}|null>(null);
 const showPrevious=()=>{setSelected(current=>(current-1+photos.length)%photos.length);resetZoom();};
 const showNext=()=>{setSelected(current=>(current+1)%photos.length);resetZoom();};
 function resetZoom(){setZoom(1);setPan({x:0,y:0});}
 const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
 const handlePointerDown=(event:ReactPointerEvent<HTMLImageElement>)=>{
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId);
  pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.current.size===2){
   const pts=[...pointers.current.values()];
   pinchStart.current={distance:distance(pts[0],pts[1]),zoom};
   dragStart.current=null;
  }else{
   dragStart.current={x:event.clientX,y:event.clientY,panX:pan.x,panY:pan.y};
  }
 };
 const handlePointerMove=(event:ReactPointerEvent<HTMLImageElement>)=>{
  if(!pointers.current.has(event.pointerId))return;
  pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.current.size>=2&&pinchStart.current){
   const pts=[...pointers.current.values()];
   const next=Math.max(1,Math.min(5,pinchStart.current.zoom*distance(pts[0],pts[1])/Math.max(1,pinchStart.current.distance)));
   setZoom(next);
   if(next===1)setPan({x:0,y:0});
  }else if(zoom>1&&dragStart.current){
   setPan({x:dragStart.current.panX+(event.clientX-dragStart.current.x),y:dragStart.current.panY+(event.clientY-dragStart.current.y)});
  }
 };
 const handlePointerUp=(event:ReactPointerEvent<HTMLImageElement>)=>{
  const start=dragStart.current;
  const wasPinching=Boolean(pinchStart.current);
  pointers.current.delete(event.pointerId);
  if(pointers.current.size<2)pinchStart.current=null;
  if(pointers.current.size===0){
   if(start&&!wasPinching&&zoom===1){
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2){if(dx<0)showNext();else showPrevious();}
   }
   dragStart.current=null;
  }
 };
 const handleWheel=(event:ReactWheelEvent<HTMLImageElement>)=>{
  event.preventDefault();
  setZoom(current=>Math.max(1,Math.min(5,current+(event.deltaY<0?.25:-.25))));
  if(zoom<=1&&event.deltaY>0)setPan({x:0,y:0});
 };
 useEffect(()=>{
  if(!lightboxOpen)return;
  const handleKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape")setLightboxOpen(false);
   if(photos.length>1&&event.key==="ArrowRight")showNext();
   if(photos.length>1&&event.key==="ArrowLeft")showPrevious();
   if(event.key==="+"||event.key==="=")setZoom(current=>Math.min(5,current+.25));
   if(event.key==="-")setZoom(current=>Math.max(1,current-.25));
   if(event.key==="0")resetZoom();
  };
  document.addEventListener("keydown",handleKey);
  document.body.style.overflow="hidden";
  return ()=>{document.removeEventListener("keydown",handleKey);document.body.style.overflow="";};
 },[lightboxOpen,photos.length]);
 return <div className="productDetailGallery">
  <div className="productDetailMainPhoto">
   {photos.length?<button type="button" className="productDetailPhotoButton" onClick={()=>{resetZoom();setLightboxOpen(true);}} aria-label="사진 크게 보기">
    <img src={photos[selected]} alt={title+` 사진 ${selected+1}`}/>
    <span className="productDetailZoomHint">사진을 누르면 크게 볼 수 있습니다</span>
   </button>:<div className="productDetailEmpty">KL BEETLE</div>}
  </div>
  {photos.length>1&&<div className="productDetailThumbnails">{photos.map((url,i)=><button key={url+i} type="button" onClick={()=>{setSelected(i);resetZoom();}} aria-label={`사진 ${i+1} 보기`} aria-pressed={selected===i} className={selected===i?"active":""}><img src={url} alt=""/></button>)}</div>}
  {lightboxOpen&&photos.length>0&&<div className="productPhotoLightbox" role="dialog" aria-modal="true" aria-label="상품 사진 크게 보기" onClick={()=>setLightboxOpen(false)}>
   <button type="button" className="productPhotoLightboxClose" onClick={()=>setLightboxOpen(false)} aria-label="닫기">×</button>
   <div className="productPhotoZoomControls" onClick={event=>event.stopPropagation()}>
    <button type="button" onClick={()=>setZoom(current=>Math.max(1,current-.25))} aria-label="축소" disabled={zoom<=1}>−</button>
    <span>{Math.round(zoom*100)}%</span>
    <button type="button" onClick={()=>setZoom(current=>Math.min(5,current+.25))} aria-label="확대" disabled={zoom>=5}>＋</button>
    <button type="button" onClick={resetZoom}>초기화</button>
   </div>
   {photos.length>1&&<button type="button" className="productPhotoLightboxNav productPhotoLightboxPrev" onClick={event=>{event.stopPropagation();showPrevious();}} aria-label="이전 사진">‹</button>}
   <img className="productPhotoZoomImage" src={photos[selected]} alt={title+` 사진 ${selected+1}`} draggable={false}
    style={{transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`}}
    onClick={event=>event.stopPropagation()} onDoubleClick={()=>setZoom(current=>current>1?1:2)}
    onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}/>
   {photos.length>1&&<button type="button" className="productPhotoLightboxNav productPhotoLightboxNext" onClick={event=>{event.stopPropagation();showNext();}} aria-label="다음 사진">›</button>}
   <div className="productPhotoLightboxCount">{photos.length>1?`${selected+1} / ${photos.length} · `:""}두 손가락으로 확대 · 드래그로 이동</div>
  </div>}
 </div>;
}
