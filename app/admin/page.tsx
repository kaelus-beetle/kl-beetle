"use client";
import { useEffect, useState } from "react";
import { supabase, configured } from "../../lib/supabase";

type Product = { id:number; title:string; price:string|null; image_url:string|null; image_urls?:string[]|null; category:string|null; is_sold:boolean; scientific_name?:string|null; origin?:string|null; specimen_size?:string|null; sex?:string|null; specimen_description?:string|null };
const imageSlots=[{key:"hero_image",label:"메인 배경 사진"},{key:"about_image",label:"ABOUT 프로필 사진"},{key:"gallery_1",label:"갤러리 사진 1"},{key:"gallery_2",label:"갤러리 사진 2"},{key:"gallery_3",label:"갤러리 사진 3"}];

export default function Admin(){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [user,setUser]=useState<any>(null); const [items,setItems]=useState<Product[]>([]);
 const [title,setTitle]=useState(""); const [price,setPrice]=useState(""); const [category,setCategory]=useState("");
 const [scientificName,setScientificName]=useState(""); const [origin,setOrigin]=useState(""); const [specimenSize,setSpecimenSize]=useState(""); const [sex,setSex]=useState(""); const [specimenDescription,setSpecimenDescription]=useState("");
 const [images,setImages]=useState<File[]>([]); const [editingId,setEditingId]=useState<number|null>(null); const [editingImages,setEditingImages]=useState<string[]>([]); const [message,setMessage]=useState(""); const [uploading,setUploading]=useState<string|null>(null);
 useEffect(()=>{if(!configured)return;supabase.auth.getSession().then(({data})=>setUser(data.session?.user||null));const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));return()=>subscription.unsubscribe();},[]);
 async function load(){const {data,error}=await supabase.from("products").select("*").order("created_at",{ascending:false});if(error){setMessage(error.message);return;}setItems((data||[]) as Product[]);}
 useEffect(()=>{if(user)load();},[user]);
 async function login(e:any){e.preventDefault();const {error}=await supabase.auth.signInWithPassword({email,password});setMessage(error?.message||"로그인되었습니다.");}
 function clearForm(){setEditingId(null);setEditingImages([]);setTitle("");setPrice("");setCategory("");setScientificName("");setOrigin("");setSpecimenSize("");setSex("");setSpecimenDescription("");setImages([]);}
 function edit(p:Product){setEditingId(p.id);setEditingImages(p.image_urls?.length?p.image_urls:(p.image_url?[p.image_url]:[]));setTitle(p.title||"");setPrice(p.price||"");setCategory(p.category||"");setScientificName(p.scientific_name||"");setOrigin(p.origin||"");setSpecimenSize(p.specimen_size||"");setSex(p.sex||"");setSpecimenDescription(p.specimen_description||"");setImages([]);setMessage("수정할 내용을 입력한 뒤 저장해 주세요.");window.scrollTo({top:0,behavior:"smooth"});}
 async function add(e:any){
  e.preventDefault();setMessage("");
  let image_urls=editingId!==null?editingImages:[];
  if(images.length){const uploaded:string[]=[];for(let i=0;i<images.length;i++){const file=images[i];const path=`products/${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g,"_")}`;const {error:upErr}=await supabase.storage.from("kl-beetle-images").upload(path,file);if(upErr){setMessage("사진 업로드 실패: "+upErr.message);return;}uploaded.push(supabase.storage.from("kl-beetle-images").getPublicUrl(path).data.publicUrl);}image_urls=uploaded;}
  const image_url=image_urls[0]||null;
  const values={title,price,category,image_url,image_urls,scientific_name:scientificName,origin,specimen_size:specimenSize,sex,specimen_description:specimenDescription};
  const result=editingId!==null?await supabase.from("products").update(values).eq("id",editingId):await supabase.from("products").insert({...values,is_sold:false});
  if(result.error){setMessage("저장 실패: "+result.error.message);return;}
  setMessage(editingId!==null?"판매글을 수정했습니다.":"판매글을 등록했습니다.");clearForm();await load();
 }
 async function uploadSetting(key:string,file:File){setUploading(key);setMessage("");try{const ext=file.name.split(".").pop()?.toLowerCase()||"jpg";const path=`site/${key}-${Date.now()}.${ext}`;const {error:upErr}=await supabase.storage.from("kl-beetle-images").upload(path,file);if(upErr)throw upErr;const url=supabase.storage.from("kl-beetle-images").getPublicUrl(path).data.publicUrl;const {data:existing,error:readErr}=await supabase.from("site_settings").select("id").eq("setting_key",key).maybeSingle();if(readErr)throw readErr;const result=existing?.id?await supabase.from("site_settings").update({setting_value:url,updated_at:new Date().toISOString()}).eq("id",existing.id):await supabase.from("site_settings").insert({setting_key:key,setting_value:url});if(result.error)throw result.error;setMessage("사진 저장 완료! 사이트에 반영됐어.");}catch(error:any){setMessage("사진 저장 실패: "+(error?.message||"알 수 없는 오류"));}finally{setUploading(null);}}
 async function toggle(p:Product){const {error}=await supabase.from("products").update({is_sold:!p.is_sold}).eq("id",p.id);if(error)setMessage(error.message);else await load();}
 async function remove(id:number){if(!confirm("이 판매글을 삭제할까요?"))return;const {error}=await supabase.from("products").delete().eq("id",id);if(error)setMessage(error.message);else{if(editingId===id)clearForm();await load();}}
 if(!configured)return <main className="adminPage"><h1>ADMIN</h1><p>Supabase 환경변수를 먼저 설정해 주세요.</p></main>;
 return <main className="adminPage"><p className="eyebrow">KL BEETLE / MANAGEMENT</p><h1>ADMIN</h1>
 {!user?<form className="adminForm" onSubmit={login}><h2>관리자 로그인</h2><label>이메일<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>비밀번호<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button>로그인</button><p>관리자 계정은 Supabase Authentication에서 별도로 생성해야 합니다.</p></form>:
 <>
 <div className="adminTop"><p>로그인: {user.email}</p><button onClick={()=>supabase.auth.signOut()}>로그아웃</button></div>
 <section className="adminSettings"><h2>사이트 사진 관리</h2><p>사진을 선택하면 저장 후 사이트에 자동 반영됩니다. 다시 배포할 필요가 없습니다.</p><div className="settingUploads">{imageSlots.map(slot=><label className="settingUpload" key={slot.key}>{slot.label}<input type="file" accept="image/*" disabled={uploading!==null} onChange={e=>{const file=e.target.files?.[0];if(file)uploadSetting(slot.key,file);e.currentTarget.value="";}}/>{uploading===slot.key&&<small>업로드 중...</small>}</label>)}</div></section>
 <form className="adminForm" onSubmit={add}>
  <h2>{editingId!==null?"판매글 수정":"판매글 등록"}</h2>
  <label>상품명<input value={title} onChange={e=>setTitle(e.target.value)} required/></label>
  <label>분류<input value={category} onChange={e=>setCategory(e.target.value)} placeholder="HERCULES / P. MUELLERI"/></label>
  <label>학명<input value={scientificName} onChange={e=>setScientificName(e.target.value)} placeholder="예: Dynastes hercules"/></label>
  <label>산지<input value={origin} onChange={e=>setOrigin(e.target.value)} placeholder="예: 과들루프"/></label>
  <label>개체 크기<input value={specimenSize} onChange={e=>setSpecimenSize(e.target.value)} placeholder="예: 수컷 165mm"/></label>
  <label>성별<input value={sex} onChange={e=>setSex(e.target.value)} placeholder="수컷 / 암컷 / 한쌍"/></label>
  <label>가격<input value={price} onChange={e=>setPrice(e.target.value)} placeholder="가격 협의"/></label>
  <label>개체 설명<textarea value={specimenDescription} onChange={e=>setSpecimenDescription(e.target.value)} placeholder="혈통, 우화일, 먹이, 특징 등 개체에 대한 설명을 작성해 주세요."/></label>
  <label>사진 여러 장 선택 가능<input type="file" accept="image/*" multiple onChange={e=>setImages(Array.from(e.target.files||[]))}/><small>{editingId!==null?"기존 사진은 유지돼. 새 사진을 선택하면 사진 전체가 새 사진들로 교체돼.":"여러 장을 한 번에 선택할 수 있어."}</small>{images.length>0&&<small>새로 선택한 사진: {images.length}장</small>}{editingId!==null&&editingImages.length>0&&images.length===0&&<small>현재 등록된 사진: {editingImages.length}장</small>}</label>
  <button type="submit">{editingId!==null?"수정 내용 저장":"판매글 등록"}</button>{editingId!==null&&<button type="button" onClick={clearForm}>수정 취소</button>}
 </form>
 <h2 className="adminHeading">등록된 판매글</h2>{items.map(p=><div className="adminItem" key={p.id}><span>{p.title} · {p.is_sold?"판매완료":"판매중"}</span><div><button type="button" onClick={()=>edit(p)}>수정</button><button type="button" onClick={()=>toggle(p)}>{p.is_sold?"판매중으로":"판매완료로"}</button><button type="button" className="danger" onClick={()=>remove(p.id)}>삭제</button></div></div>)}
 </>}
 {message&&<p className="notice">{message}</p>}</main>;
}
