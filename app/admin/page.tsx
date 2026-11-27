"use client";
import { useEffect, useRef, useState } from "react";
import { supabase, configured } from "../../lib/supabase";

type VisitorLog = { id:number; visitor_id:string; ip_address:string|null; country:string|null; region:string|null; city:string|null; device:string|null; operating_system:string|null; browser:string|null; page_path:string; created_at:string };
type Product = { id:number; title:string; price:string|null; image_url:string|null; image_urls?:string[]|null; category:string|null; is_sold:boolean; scientific_name?:string|null; origin?:string|null; specimen_size?:string|null; sex?:string|null; specimen_description?:string|null };
const imageSlots=[{key:"hero_image",label:"메인 배경 사진"},{key:"about_image",label:"ABOUT 프로필 사진"},{key:"gallery_1",label:"갤러리 사진 1"},{key:"gallery_2",label:"갤러리 사진 2"},{key:"gallery_3",label:"갤러리 사진 3"}];

export default function Admin(){
 const editorRef=useRef<HTMLFormElement>(null);
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [user,setUser]=useState<any>(null); const [items,setItems]=useState<Product[]>([]);
 const [title,setTitle]=useState(""); const [price,setPrice]=useState(""); const [category,setCategory]=useState("");
 const [scientificName,setScientificName]=useState(""); const [origin,setOrigin]=useState(""); const [specimenSize,setSpecimenSize]=useState(""); const [sex,setSex]=useState(""); const [specimenDescription,setSpecimenDescription]=useState("");
 const [images,setImages]=useState<File[]>([]); const [visitorLogs,setVisitorLogs]=useState<VisitorLog[]>([]); const [selectedVisitorIds,setSelectedVisitorIds]=useState<number[]>([]); const [totalViews,setTotalViews]=useState(0); const [uniqueVisitors,setUniqueVisitors]=useState(0); const [productViews,setProductViews]=useState<Record<number,number>>({}); const [editingId,setEditingId]=useState<number|null>(null); const [editingImages,setEditingImages]=useState<string[]>([]); const [message,setMessage]=useState(""); const [uploading,setUploading]=useState<string|null>(null);
 useEffect(()=>{if(!configured)return;supabase.auth.getSession().then(({data})=>setUser(data.session?.user||null));const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));return()=>subscription.unsubscribe();},[]);
 async function load(){const {data,error}=await supabase.from("products").select("*").order("created_at",{ascending:false});if(error){setMessage(error.message);return;}setItems((data||[]) as Product[]);}
 useEffect(()=>{if(user)load();},[user]);
 async function loadAnalytics(){
  const [{data:summary,error:summaryError},{data:logs,error:logsError}]=await Promise.all([
   supabase.rpc("get_visitor_summary"),
   supabase.from("visitor_logs").select("*").order("created_at",{ascending:false}).limit(100)
  ]);
  if(!summaryError&&summary?.[0]){setTotalViews(Number(summary[0].total_views||0));setUniqueVisitors(Number(summary[0].unique_visitors||0));}
  if(!logsError){setVisitorLogs((logs||[]) as VisitorLog[]);setSelectedVisitorIds([]);}
  if(items.length){
   const pairs=await Promise.all(items.map(async p=>{
    const {count,error}=await supabase.from("visitor_logs").select("id",{count:"exact",head:true}).eq("page_path",`/shop/${p.id}`);
    return [p.id,error?0:(count||0)] as [number,number];
   }));
   setProductViews(Object.fromEntries(pairs));
  }
 }
 useEffect(()=>{if(user)loadAnalytics();},[user,items]);
 async function deleteSelectedVisitors(){
  if(!selectedVisitorIds.length){setMessage("삭제할 방문 기록을 먼저 선택해 줘.");return;}
  if(!confirm(`선택한 방문 기록 ${selectedVisitorIds.length}건을 삭제할까?`))return;
  const {error}=await supabase.from("visitor_logs").delete().in("id",selectedVisitorIds);
  if(error){setMessage("방문 기록 삭제 실패: "+error.message);return;}
  setMessage(`선택한 방문 기록 ${selectedVisitorIds.length}건을 삭제했어.`);
  await loadAnalytics();
 }
 async function clearVisitorLogs(){
  if(!confirm("방문 기록을 전부 삭제할까? 삭제하면 되돌릴 수 없어."))return;
  const {error}=await supabase.from("visitor_logs").delete().gte("id",0);
  if(error){setMessage("방문 기록 초기화 실패: "+error.message);return;}
  setSelectedVisitorIds([]);
  setMessage("전체 방문 기록을 초기화했어.");
  await loadAnalytics();
 }
 async function login(e:any){e.preventDefault();const {error}=await supabase.auth.signInWithPassword({email,password});setMessage(error?.message||"로그인되었습니다.");}
 function clearForm(){setEditingId(null);setEditingImages([]);setTitle("");setPrice("");setCategory("");setScientificName("");setOrigin("");setSpecimenSize("");setSex("");setSpecimenDescription("");setImages([]);}
 function edit(p:Product){setEditingId(p.id);setEditingImages(p.image_urls?.length?p.image_urls:(p.image_url?[p.image_url]:[]));setTitle(p.title||"");setPrice(p.price||"");setCategory(p.category||"");setScientificName(p.scientific_name||"");setOrigin(p.origin||"");setSpecimenSize(p.specimen_size||"");setSex(p.sex||"");setSpecimenDescription(p.specimen_description||"");setImages([]);setMessage("수정할 내용을 입력한 뒤 저장해 주세요.");setTimeout(()=>editorRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),50);}
 async function add(e:any){
  e.preventDefault();setMessage("");
  let image_urls=editingId!==null?editingImages:[];
  if(images.length){const uploaded:string[]=[];for(let i=0;i<images.length;i++){const file=images[i];const path=`products/${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g,"_")}`;const {error:upErr}=await supabase.storage.from("kl-beetle-images").upload(path,file);if(upErr){setMessage("사진 업로드 실패: "+upErr.message);return;}uploaded.push(supabase.storage.from("kl-beetle-images").getPublicUrl(path).data.publicUrl);}image_urls=uploaded;}
  const image_url=image_urls[0]||null;
  const values={title,price,category,image_url,image_urls,scientific_name:scientificName,origin,specimen_size:specimenSize,sex,specimen_description:specimenDescription};
  const result=editingId!==null?await supabase.from("products").update(values).eq("id",editingId).select("id"):await supabase.from("products").insert({...values,is_sold:false}).select("id");
  if(result.error){setMessage("저장 실패: "+result.error.message);return;}
  if(!result.data?.length){setMessage("수정된 데이터가 없어. Supabase에서 products 테이블의 UPDATE 권한 정책을 확인해야 해.");return;}
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
 <section className="adminSettings">
  <h2>방문자 통계</h2>
  <p>사이트 전체 페이지 조회 및 최근 방문 기록이야. 관리자에게만 표시돼.</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"12px",margin:"20px 0"}}>
   <div style={{padding:"18px",background:"#faf8f3",border:"1px solid #d5d0c5"}}><small>누적 페이지 조회</small><strong style={{display:"block",fontSize:"28px",marginTop:"8px"}}>{totalViews.toLocaleString("ko-KR")}</strong></div>
   <div style={{padding:"18px",background:"#faf8f3",border:"1px solid #d5d0c5"}}><small>누적 방문자(브라우저 기준)</small><strong style={{display:"block",fontSize:"28px",marginTop:"8px"}}>{uniqueVisitors.toLocaleString("ko-KR")}</strong></div>
  </div>
  <h3 style={{fontWeight:400,marginTop:"28px"}}>게시글별 조회수</h3>
  {items.length===0?<p>등록된 게시글이 없어.</p>:items.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",gap:"12px",padding:"11px 0",borderBottom:"1px solid #d5d0c5",fontSize:"13px"}}><span>{p.title}</span><strong>{(productViews[p.id]??0).toLocaleString("ko-KR")}회</strong></div>)}
  <h3 style={{fontWeight:400,marginTop:"30px"}}>최근 방문 기록 (최대 100건)</h3>
  <div style={{display:"flex",flexWrap:"wrap",gap:"8px",margin:"12px 0"}}>
   <button type="button" onClick={deleteSelectedVisitors} disabled={!selectedVisitorIds.length} style={{border:0,background:"#626a4e",color:"#fff",padding:"9px 13px",cursor:"pointer",opacity:selectedVisitorIds.length?1:.5}}>선택 삭제 ({selectedVisitorIds.length})</button>
   <button type="button" onClick={clearVisitorLogs} style={{border:"1px solid #9a5148",background:"transparent",color:"#9a5148",padding:"9px 13px",cursor:"pointer"}}>전체 기록 초기화</button>
   <button type="button" onClick={()=>setSelectedVisitorIds(visitorLogs.map(v=>v.id))} disabled={!visitorLogs.length} style={{border:"1px solid #bdb8ad",background:"transparent",padding:"9px 13px",cursor:"pointer"}}>현재 목록 전체 선택</button>
  </div>
  <div style={{overflowX:"auto"}}>
   <table style={{width:"100%",borderCollapse:"collapse",fontSize:"11px",minWidth:"760px"}}>
    <thead><tr><th style={{textAlign:"left",padding:"10px 8px",borderBottom:"1px solid #bdb8ad"}}><input aria-label="현재 목록 전체 선택" type="checkbox" checked={visitorLogs.length>0&&visitorLogs.every(v=>selectedVisitorIds.includes(v.id))} onChange={e=>setSelectedVisitorIds(e.target.checked?visitorLogs.map(v=>v.id):[])} /></th>{["접속 시간","IP 주소","접속 지역","기기 / OS","브라우저","방문 페이지"].map(x=><th key={x} style={{textAlign:"left",padding:"10px 8px",borderBottom:"1px solid #bdb8ad"}}>{x}</th>)}</tr></thead>
    <tbody>{visitorLogs.map(v=><tr key={v.id}>
     <td style={{padding:"10px 8px",borderBottom:"1px solid #e0dcd3",whiteSpace:"nowrap"}}>{new Date(v.created_at).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"})}</td>
     <td style={{padding:"10px 8px",borderBottom:"1px solid #e0dcd3",whiteSpace:"nowrap"}}>{v.ip_address||"확인 불가"}</td>
     <td style={{padding:"10px 8px",borderBottom:"1px solid #e0dcd3"}}>{[v.country,v.region,v.city].filter(Boolean).join(" · ")||"확인 불가"}</td>
     <td style={{padding:"10px 8px",borderBottom:"1px solid #e0dcd3"}}>{[v.device,v.operating_system].filter(Boolean).join(" / ")||"-"}</td>
     <td style={{padding:"10px 8px",borderBottom:"1px solid #e0dcd3"}}>{v.browser||"-"}</td>
     <td style={{padding:"10px 8px",borderBottom:"1px solid #e0dcd3"}}>{v.page_path}</td>
    </tr>)}</tbody>
   </table>
  </div>
  {visitorLogs.length===0&&<p style={{fontSize:"12px",color:"#77786c"}}>아직 방문 기록이 없어. SQL 실행과 배포가 끝난 뒤 새로 들어오는 방문부터 기록돼.</p>}
  <button type="button" onClick={loadAnalytics} style={{marginTop:"18px",border:0,background:"#626a4e",color:"#fff",padding:"10px 16px",cursor:"pointer"}}>통계 새로고침</button>
 </section>
 <section className="adminSettings"><h2>사이트 사진 관리</h2><p>사진을 선택하면 저장 후 사이트에 자동 반영됩니다. 다시 배포할 필요가 없습니다.</p><div className="settingUploads">{imageSlots.map(slot=><label className="settingUpload" key={slot.key}>{slot.label}<input type="file" accept="image/*" disabled={uploading!==null} onChange={e=>{const file=e.target.files?.[0];if(file)uploadSetting(slot.key,file);e.currentTarget.value="";}}/>{uploading===slot.key&&<small>업로드 중...</small>}</label>)}</div></section>
 <form ref={editorRef} id="product-editor" className="adminForm" onSubmit={add} style={{scrollMarginTop:"24px"}}>
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
