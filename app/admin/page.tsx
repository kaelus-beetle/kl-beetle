"use client";
import { useEffect, useState } from "react";
import { supabase, configured } from "../../lib/supabase";

type Product = { id:number; title:string; description:string|null; price:string|null; image_url:string|null; category:string|null; is_sold:boolean };
const imageSlots=[{key:"hero_image",label:"메인 배경 사진"},{key:"about_image",label:"ABOUT 프로필 사진"},{key:"gallery_1",label:"갤러리 사진 1"},{key:"gallery_2",label:"갤러리 사진 2"},{key:"gallery_3",label:"갤러리 사진 3"}];

export default function Admin(){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [user,setUser]=useState<any>(null); const [items,setItems]=useState<Product[]>([]);
 const [title,setTitle]=useState(""); const [description,setDescription]=useState(""); const [price,setPrice]=useState(""); const [category,setCategory]=useState("");
 const [scientificName,setScientificName]=useState(""); const [origin,setOrigin]=useState(""); const [specimenSize,setSpecimenSize]=useState(""); const [sex,setSex]=useState(""); const [specimenDescription,setSpecimenDescription]=useState("");
 const [image,setImage]=useState<File|null>(null); const [message,setMessage]=useState(""); const [uploading,setUploading]=useState<string|null>(null);
 useEffect(()=>{if(!configured)return;supabase.auth.getSession().then(({data})=>setUser(data.session?.user||null));const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));return()=>subscription.unsubscribe();},[]);
 async function load(){const {data}=await supabase.from("products").select("*").order("created_at",{ascending:false});setItems((data||[]) as Product[]);}
 useEffect(()=>{if(user)load();},[user]);
 async function login(e:any){e.preventDefault();const {error}=await supabase.auth.signInWithPassword({email,password});setMessage(error?.message||"로그인되었습니다.");}
 async function add(e:any){
  e.preventDefault();let image_url=null;
  if(image){const path=`products/${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g,"_")}`;const {error:upErr}=await supabase.storage.from("kl-beetle-images").upload(path,image);if(upErr){setMessage(upErr.message);return;}image_url=supabase.storage.from("kl-beetle-images").getPublicUrl(path).data.publicUrl;}
  const {error}=await supabase.from("products").insert({title,description,price,category,image_url,is_sold:false,scientific_name:scientificName,origin,specimen_size:specimenSize,sex,specimen_description:specimenDescription});
  setMessage(error?.message||"판매글을 등록했습니다.");
  if(!error){setTitle("");setDescription("");setPrice("");setCategory("");setScientificName("");setOrigin("");setSpecimenSize("");setSex("");setSpecimenDescription("");setImage(null);load();}
 }
 async function uploadSetting(key:string,file:File){setUploading(key);setMessage("");try{const ext=file.name.split(".").pop()?.toLowerCase()||"jpg";const path=`site/${key}-${Date.now()}.${ext}`;const {error:upErr}=await supabase.storage.from("kl-beetle-images").upload(path,file);if(upErr)throw upErr;const url=supabase.storage.from("kl-beetle-images").getPublicUrl(path).data.publicUrl;const {data:existing,error:readErr}=await supabase.from("site_settings").select("id").eq("setting_key",key).maybeSingle();if(readErr)throw readErr;const result=existing?.id?await supabase.from("site_settings").update({setting_value:url,updated_at:new Date().toISOString()}).eq("id",existing.id):await supabase.from("site_settings").insert({setting_key:key,setting_value:url});if(result.error)throw result.error;setMessage("사진 저장 완료! 사이트에 반영됐어.");}catch(error:any){setMessage("사진 저장 실패: "+(error?.message||"알 수 없는 오류"));}finally{setUploading(null);}}
 async function toggle(p:Product){await supabase.from("products").update({is_sold:!p.is_sold}).eq("id",p.id);load();}
 async function remove(id:number){if(!confirm("이 판매글을 삭제할까요?"))return;await supabase.from("products").delete().eq("id",id);load();}
 if(!configured)return <main className="adminPage"><h1>ADMIN</h1><p>Supabase 환경변수를 먼저 설정해 주세요.</p></main>;
 return <main className="adminPage"><p className="eyebrow">KL BEETLE / MANAGEMENT</p><h1>ADMIN</h1>
 {!user?<form className="adminForm" onSubmit={login}><h2>관리자 로그인</h2><label>이메일<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>비밀번호<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button>로그인</button><p>관리자 계정은 Supabase Authentication에서 별도로 생성해야 합니다.</p></form>:
 <>
 <div className="adminTop"><p>로그인: {user.email}</p><button onClick={()=>supabase.auth.signOut()}>로그아웃</button></div>
 <section className="adminSettings"><h2>사이트 사진 관리</h2><p>사진을 선택하면 저장 후 사이트에 자동 반영됩니다. 다시 배포할 필요가 없습니다.</p><div className="settingUploads">{imageSlots.map(slot=><label className="settingUpload" key={slot.key}>{slot.label}<input type="file" accept="image/*" disabled={uploading!==null} onChange={e=>{const file=e.target.files?.[0];if(file)uploadSetting(slot.key,file);e.currentTarget.value="";}}/>{uploading===slot.key&&<small>업로드 중...</small>}</label>)}</div></section>
 <form className="adminForm" onSubmit={add}>
  <h2>판매글 등록</h2>
  <label>상품명<input value={title} onChange={e=>setTitle(e.target.value)} required/></label>
  <label>분류<input value={category} onChange={e=>setCategory(e.target.value)} placeholder="HERCULES / P. MUELLERI"/></label>
  <label>학명<input value={scientificName} onChange={e=>setScientificName(e.target.value)} placeholder="예: Dynastes hercules"/></label>
  <label>산지<input value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="예: 과들루프"/></label>
  <label>개체 크기<input value={specimenSize} onChange={e=>setSpecimenSize(e.target.value)} placeholder="예: 수컷 165mm"/></label>
  <label>성별<input value={sex} onChange={e=>setSex(e.target.value)} placeholder="수컷 / 암컷 / 한쌍"/></label>
  <label>가격<input value={price} onChange={e=>setPrice(e.target.value)} placeholder="가격 협의"/></label>
  <label>간단한 설명<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="상품 목록에 표시될 짧은 소개"/></label>
  <label>개체 상세 설명<textarea value={specimenDescription} onChange={e=>setSpecimenDescription(e.target.value)} placeholder="혈통, 우화일, 먹이, 특징 등 상세한 설명을 작성해 주세요."/></label>
  <label>사진<input type="file" accept="image/*" onChange={e=>setImage(e.target.files?.[0]||null)}/></label>
  <button>판매글 등록</button>
 </form>
 <h2 className="adminHeading">등록된 판매글</h2>{items.map(p=><div className="adminItem" key={p.id}><span>{p.title} · {p.is_sold?"판매완료":"판매중"}</span><div><button onClick={()=>toggle(p)}>{p.is_sold?"판매중으로":"판매완료로"}</button><button className="danger" onClick={()=>remove(p.id)}>삭제</button></div></div>)}
 </>}
 {message&&<p className="notice">{message}</p>}</main>;
}
