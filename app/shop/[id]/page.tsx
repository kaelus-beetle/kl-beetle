import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, configured } from "../../../lib/supabase";
import ProductPhotoGallery from "./PhotoGallery";

export const dynamic = "force-dynamic";
type Product={id:number;title:string;price:string|null;image_url:string|null;image_urls?:string[]|null;category:string|null;is_sold:boolean;scientific_name:string|null;origin:string|null;specimen_size:string|null;sex:string|null;specimen_description:string|null};

export default async function ProductDetail({params}:{params:Promise<{id:string}>}){
 if(!configured)return <main className="subPage"><p className="notice">Supabase 연결 설정이 필요합니다.</p></main>;
 const {id}=await params;if(!/^\d+$/.test(id))notFound();
 const {data,error}=await supabase.from("products").select("*").eq("id",Number(id)).maybeSingle();if(error||!data)notFound();
 const p=data as Product;const photos=p.image_urls?.length?p.image_urls:(p.image_url?[p.image_url]:[]);
 const facts=[["학명",p.scientific_name],["산지",p.origin],["크기",p.specimen_size],["성별",p.sex]].filter((item):item is [string,string]=>Boolean(item[1]?.trim()));
 return <main className="subPage">
  <section className="pageIntro"><p className="eyebrow">KL BEETLE / SPECIMEN DETAIL</p><h1 style={{fontSize:"clamp(34px,6vw,64px)"}}>{p.title}</h1>{p.scientific_name&&<p style={{fontStyle:"italic"}}>{p.scientific_name}</p>}</section>
  <section className="productDetailLayout" style={{maxWidth:"1180px",margin:"0 auto",padding:"55px 7vw 100px",display:"grid",gridTemplateColumns:"minmax(0,1.1fr) minmax(280px,.9fr)",gap:"clamp(30px,6vw,80px)",alignItems:"start"}}>
   <ProductPhotoGallery title={p.title} photos={photos}/>
   <div style={{color:"#292d25"}}>
    <h2 style={{fontSize:"30px",fontWeight:400,margin:"12px 0 22px"}}>{p.title}</h2>
    {p.price&&<p style={{fontSize:"18px",fontWeight:600,marginBottom:"26px"}}>{p.price}</p>}
    {p.is_sold&&<p style={{display:"inline-block",background:"#34392d",color:"#fff",padding:"8px 14px",fontSize:"10px",letterSpacing:".12em"}}>SOLD OUT</p>}
    <div style={{borderTop:"1px solid #d5d0c5",borderBottom:"1px solid #d5d0c5",padding:"8px 0",margin:"22px 0"}}>
     {facts.length?facts.map(([label,value])=><div key={label} style={{display:"grid",gridTemplateColumns:"90px 1fr",gap:"14px",padding:"13px 0",borderBottom:"1px solid #e0dcd3",fontSize:"13px"}}><span style={{color:"#77786c"}}>{label}</span><span>{value}</span></div>):<p style={{fontSize:"12px",color:"#77786c"}}>등록된 개체 정보가 없습니다.</p>}
    </div>
    {p.specimen_description&&<div style={{margin:"28px 0"}}><h3 style={{fontSize:"15px",fontWeight:500}}>개체 설명</h3><p style={{fontSize:"13px",lineHeight:2.1,whiteSpace:"pre-wrap",color:"#66685e"}}>{p.specimen_description}</p></div>}
    <a href="https://open.kakao.com/o/sunFEYTi" target="_blank" rel="noreferrer" style={{display:"inline-block",marginTop:"16px",padding:"15px 22px",background:"#626a4e",color:"#fff",fontSize:"12px"}}>카카오톡으로 문의하기 ↗</a>
    <div style={{marginTop:"28px"}}><Link href="/shop" style={{fontSize:"11px",borderBottom:"1px solid #626a4e",paddingBottom:"5px"}}>← SHOP으로 돌아가기</Link></div>
   </div>
  </section>
  <style>{`@media(max-width:760px){.subPage section[style*="grid-template-columns:minmax"]{grid-template-columns:1fr !important;}}`}</style>
 </main>;
}
