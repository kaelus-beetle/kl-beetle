import Link from "next/link";
import { supabase, configured } from "../../lib/supabase";

type Product = { id:number; title:string; price:string|null; image_url:string|null; category:string|null; is_sold:boolean };
export const dynamic = "force-dynamic";

export default async function Shop() {
 let items:Product[]=[];let errorMessage="";let shopBackground="";
 if(configured){const {data}=await supabase.from("site_settings").select("setting_value").eq("setting_key","shop_intro_background").maybeSingle();shopBackground=data?.setting_value||"";}
 if(configured){const {data,error}=await supabase.from("products").select("*").order("created_at",{ascending:false});if(error)errorMessage=error.message;else items=(data||[]) as Product[];}
 return <main className="subPage">
  <section className="pageIntro shopIntro" style={{backgroundImage:`linear-gradient(rgba(12,18,12,.42),rgba(12,18,12,.52)),url("${shopBackground||"https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2200&q=85"}")`}}><p className="eyebrow">KL BEETLE COLLECTION</p><h1>SHOP</h1><p>Available specimens and breeding updates.</p></section>
  {!configured?<p className="notice">Supabase 연결 설정이 필요합니다. 관리자 안내서의 환경변수 단계를 완료해 주세요.</p>:errorMessage?<p className="notice">상품을 불러오지 못했습니다: {errorMessage}</p>:items.length===0?<p className="notice">현재 등록된 판매글이 없습니다.</p>:
  <section aria-label="판매 상품 목록" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))",gap:"28px",padding:"60px 8vw 110px",alignItems:"start"}}>
   {items.map(p=><Link href={`/shop/${p.id}`} key={p.id} style={{display:"flex",flexDirection:"column",minWidth:0,background:"#f2efe8",border:"1px solid #d5d0c5",color:"#292d25",textDecoration:"none"}}>
    <div style={{height:"280px",width:"100%",position:"relative",background:"#d6d1c4"}}>
     {p.image_url?<img src={p.image_url} alt={p.title} style={{display:"block",width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{display:"grid",placeItems:"center",height:"100%"}}>KL BEETLE</div>}
     {p.is_sold&&<b style={{position:"absolute",top:"15px",right:"15px",background:"#34392d",color:"#fff",padding:"8px 12px",fontSize:"9px"}}>SOLD OUT</b>}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:"12px",width:"100%",minHeight:"145px",padding:"22px",background:"#f2efe8",color:"#292d25"}}>
     <span style={{color:"#626a4e",fontSize:"10px",letterSpacing:"0.18em"}}>{p.category||"COLLECTION"}</span>
     <h2 style={{margin:0,color:"#292d25",fontSize:"22px",fontWeight:400}}>{p.title}</h2>
     {p.price&&<strong style={{color:"#292d25",fontSize:"14px"}}>{p.price}</strong>}
     <span style={{fontSize:"11px",color:"#626a4e",borderBottom:"1px solid #626a4e",paddingBottom:"5px",width:"fit-content"}}>사진 및 개체 정보 보기 ↗</span>
    </div>
   </Link>)}
  </section>}
 </main>;
}
