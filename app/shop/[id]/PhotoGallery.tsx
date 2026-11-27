"use client";
import { useEffect, useState } from "react";

export default function ProductPhotoGallery({title,photos}:{title:string;photos:string[]}){
 const [selected,setSelected]=useState(0);
 const [lightboxOpen,setLightboxOpen]=useState(false);
 useEffect(()=>{
  if(!lightboxOpen)return;
  const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setLightboxOpen(false);};
  document.addEventListener("keydown",closeOnEscape);
  document.body.style.overflow="hidden";
  return ()=>{document.removeEventListener("keydown",closeOnEscape);document.body.style.overflow="";};
 },[lightboxOpen]);
 return <div className="productDetailGallery">
  <div className="productDetailMainPhoto">
   {photos.length?<button type="button" className="productDetailPhotoButton" onClick={()=>{if(window.matchMedia("(max-width: 700px)").matches)setLightboxOpen(true);}} aria-label="사진 크게 보기">
    <img src={photos[selected]} alt={title+` 사진 ${selected+1}`}/>
    <span className="productDetailZoomHint">사진을 누르면 크게 볼 수 있습니다</span>
   </button>:<div className="productDetailEmpty">KL BEETLE</div>}
  </div>
  {photos.length>1&&<div className="productDetailThumbnails">{photos.map((url,i)=><button key={url+i} type="button" onClick={()=>setSelected(i)} aria-label={`사진 ${i+1} 보기`} aria-pressed={selected===i} className={selected===i?"active":""}><img src={url} alt=""/></button>)}</div>}
  {lightboxOpen&&photos.length>0&&<div className="productPhotoLightbox" role="dialog" aria-modal="true" aria-label="상품 사진 크게 보기" onClick={()=>setLightboxOpen(false)}>
   <button type="button" className="productPhotoLightboxClose" onClick={()=>setLightboxOpen(false)} aria-label="닫기">×</button>
   <img src={photos[selected]} alt={title+` 사진 ${selected+1}`} onClick={event=>event.stopPropagation()}/>
   {photos.length>1&&<div className="productPhotoLightboxCount">{selected+1} / {photos.length}</div>}
  </div>}
 </div>;
}
