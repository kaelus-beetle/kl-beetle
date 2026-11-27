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
  <section className="shopProductGrid" aria-label="판매 상품 목록">
   {items.map(p=><Link href={`/shop/${p.id}`} key={p.id} className="shopProductCard">
    <div className="shopProductImage">
     {p.image_url?<img src={p.image_url} alt={p.title}/>:<div className="shopProductPlaceholder">KL BEETLE</div>}
     {p.is_sold&&<b className="shopSoldBadge">SOLD OUT</b>}
    </div>
    <div className="shopProductInfo">
     <span>{p.category||"COLLECTION"}</span>
     <h2>{p.title}</h2>
     {p.price&&<strong>{p.price}</strong>}
     <small>사진 및 개체 정보 보기 ↗</small>
    </div>
   </Link>)}
  </section>}
 </main>;
}
