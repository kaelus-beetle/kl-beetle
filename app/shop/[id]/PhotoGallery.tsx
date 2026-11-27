"use client";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export default function ProductPhotoGallery({title,photos}:{title:string;photos:string[]}){
 const [selected,setSelected]=useState(0);
 const [lightboxOpen,setLightboxOpen]=useState(false);
 const dragStart=useRef<{x:number;y:number}|null>(null);
 const showPrevious=()=>setSelected(current=>(current-1+photos.length)%photos.length);
 const showNext=()=>setSelected(current=>(current+1)%photos.length);
 const handleDragStart=(event:ReactPointerEvent<HTMLImageElement>)=>{
  dragStart.current={x:event.clientX,y:event.clientY};
  event.currentTarget.setPointerCapture(event.pointerId);
 };
 const handleDragEnd=(event:React.PointerEvent<HTMLImageElement>)=>{
  if(!dragStart.current)return;
  const dx=event.clientX-dragStart.current.x;
  const dy=event.clientY-dragStart.current.y;
  dragStart.current=null;
  if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2){
   if(dx<0)showNext();else showPrevious();
  }
 };
 useEffect(()=>{
  if(!lightboxOpen)return;
  const handleKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape")setLightboxOpen(false);
   if(photos.length>1&&event.key==="ArrowRight")showNext();
   if(photos.length>1&&event.key==="ArrowLeft")showPrevious();
  };
  document.addEventListener("keydown",handleKey);
  document.body.style.overflow="hidden";
  return ()=>{document.removeEventListener("keydown",handleKey);document.body.style.overflow="";};
 },[lightboxOpen,photos.length]);
 return <div className="productDetailGallery">
  <div className="productDetailMainPhoto">
   {photos.length?<button type="button" className="productDetailPhotoButton" onClick={()=>setLightboxOpen(true)} aria-label="사진 크게 보기">
    <img src={photos[selected]} alt={title+` 사진 ${selected+1}`}/>
    <span className="productDetailZoomHint">사진을 누르면 크게 볼 수 있습니다</span>
   </button>:<div className="productDetailEmpty">KL BEETLE</div>}
  </div>
  {photos.length>1&&<div className="productDetailThumbnails">{photos.map((url,i)=><button key={url+i} type="button" onClick={()=>setSelected(i)} aria-label={`사진 ${i+1} 보기`} aria-pressed={selected===i} className={selected===i?"active":""}><img src={url} alt=""/></button>)}</div>}
  {lightboxOpen&&photos.length>0&&<div className="productPhotoLightbox" role="dialog" aria-modal="true" aria-label="상품 사진 크게 보기" onClick={()=>setLightboxOpen(false)}>
   <button type="button" className="productPhotoLightboxClose" onClick={()=>setLightboxOpen(false)} aria-label="닫기">×</button>
   {photos.length>1&&<button type="button" className="productPhotoLightboxNav productPhotoLightboxPrev" onClick={event=>{event.stopPropagation();showPrevious();}} aria-label="이전 사진">‹</button>}
   <img src={photos[selected]} alt={title+` 사진 ${selected+1}`} draggable={false} onClick={event=>event.stopPropagation()} onPointerDown={handleDragStart} onPointerUp={handleDragEnd} onPointerCancel={()=>{dragStart.current=null;}}/>
   {photos.length>1&&<button type="button" className="productPhotoLightboxNav productPhotoLightboxNext" onClick={event=>{event.stopPropagation();showNext();}} aria-label="다음 사진">›</button>}
   {photos.length>1&&<div className="productPhotoLightboxCount">{selected+1} / {photos.length} · 좌우로 드래그</div>}
  </div>}
 </div>;
}
