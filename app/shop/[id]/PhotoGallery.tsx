"use client";
import { useState } from "react";

export default function ProductPhotoGallery({title,photos}:{title:string;photos:string[]}){
 const [selected,setSelected]=useState(0);
 return <div>
  <div style={{width:"100%",minHeight:"280px",background:"#d6d1c4",display:"grid",placeItems:"center"}}>
   {photos.length?<img src={photos[selected]} alt={title+` 사진 ${selected+1}`} style={{display:"block",width:"100%",maxHeight:"720px",minHeight:"280px",objectFit:"contain",background:"#e2ded4"}}/>:<div style={{minHeight:"280px",display:"grid",placeItems:"center"}}>KL BEETLE</div>}
  </div>
  {photos.length>1&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(76px,1fr))",gap:"10px",marginTop:"12px"}}>{photos.map((url,i)=><button key={url+i} type="button" onClick={()=>setSelected(i)} aria-label={`사진 ${i+1} 보기`} style={{padding:0,border:selected===i?"2px solid #626a4e":"1px solid #d5d0c5",background:"#e2ded4",cursor:"pointer",height:"86px",overflow:"hidden"}}><img src={url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></button>)}</div>}
 </div>;
}
