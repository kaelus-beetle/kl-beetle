"use client";
import { useEffect, useState } from "react";
import { supabase, configured } from "../../lib/supabase";
type Product = { id:number; title:string; description:string|null; price:string|null; image_url:string|null; category:string|null; is_sold:boolean };
export default function Shop() {
  const [items,setItems] = useState<Product[]>([]);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ if(!configured){setLoading(false);return;} supabase.from("products").select("*").order("created_at",{ascending:false}).then(({data})=>{setItems((data||[]) as Product[]);setLoading(false);}); },[]);
  return <main className="subPage"><section className="pageIntro"><p className="eyebrow">KL BEETLE COLLECTION</p><h1>SHOP</h1><p>Available specimens and breeding updates.</p></section>
    {!configured ? <p className="notice">Supabase 연결 설정이 필요합니다. 관리자 안내서의 환경변수 단계를 완료해 주세요.</p> : loading ? <p className="notice">불러오는 중...</p> : items.length===0 ? <p className="notice">현재 등록된 판매글이 없습니다.</p> :
    <section className="productGrid">{items.map(p=><article className="product" key={p.id}><div className="productImage">{p.image_url?<img src={p.image_url} alt={p.title}/>:<span>KL BEETLE</span>}{p.is_sold&&<b>SOLD OUT</b>}</div><div className="productInfo" style={{display:"block",visibility:"visible",opacity:1,color:"#292d25",background:"#f2efe8",padding:"22px"}}><small style={{display:"block",visibility:"visible",color:"#626a4e"}}>{p.category||"COLLECTION"}</small><h2 style={{display:"block",visibility:"visible",color:"#292d25"}}>{p.title}</h2><p style={{display:"block",visibility:"visible",color:"#77786c"}}>{p.description||""}</p><strong style={{display:"block",visibility:"visible",color:"#292d25"}}>{p.price||""}</strong><a style={{display:"inline-block",visibility:"visible",color:"#292d25"}} href="https://open.kakao.com/o/sunFEYTi" target="_blank" rel="noreferrer">카카오톡으로 문의하기 ↗</a></div></article>)}</section>}
  </main>;
}
