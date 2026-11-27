"use client";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { supabase, configured } from "../../lib/supabase";

type VisitorLog = { id:number; visitor_id:string; ip_address:string|null; country:string|null; region:string|null; city:string|null; device:string|null; operating_system:string|null; browser:string|null; page_path:string; created_at:string };
type Product = { id:number; title:string; price:string|null; image_url:string|null; listing_image_url?:string|null; image_urls?:string[]|null; category:string|null; is_sold:boolean; scientific_name?:string|null; origin?:string|null; specimen_size?:string|null; sex?:string|null; specimen_description?:string|null };
const imageSlots=[{key:"hero_image",label:"메인 배경 사진"},{key:"shop_intro_background",label:"SHOP 상단 자연 배경 사진"},{key:"about_intro_background",label:"ABOUT 상단 MEET THE BREEDER 배경"},{key:"about_image",label:"ABOUT 브리더 프로필 사진"},{key:"about_philosophy_image",label:"ABOUT Small wonders 아래 사진"},{key:"species_muelleri_image",label:"ABOUT 뮤엘러리사슴벌레 사진"},{key:"species_hercules_image",label:"ABOUT 헤라클레스장수풍뎅이 사진"},{key:"gallery_1",label:"갤러리 사진 1"},{key:"gallery_2",label:"갤러리 사진 2"},{key:"gallery_3",label:"갤러리 사진 3"}];

export default function Admin(){
 const editorRef=useRef<HTMLFormElement>(null);
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [user,setUser]=useState<any>(null); const [items,setItems]=useState<Product[]>([]);
 const [title,setTitle]=useState(""); const [price,setPrice]=useState(""); const [category,setCategory]=useState("");
 const [scientificName,setScientificName]=useState(""); const [origin,setOrigin]=useState(""); const [specimenSize,setSpecimenSize]=useState(""); const [sex,setSex]=useState(""); const [specimenDescription,setSpecimenDescription]=useState("");
 const [images,setImages]=useState<File[]>([]); const [listingImage,setListingImage]=useState<File|null>(null);
 const [cropQueue,setCropQueue]=useState<File[]>([]);
 const [cropIndex,setCropIndex]=useState(0);
 const [cropDone,setCropDone]=useState<File[]>([]);
 const [cropTarget,setCropTarget]=useState<"product"|string|null>(null);
 const [cropFile,setCropFile]=useState<File|null>(null);
 const [cropUrl,setCropUrl]=useState("");
 const [cropSize,setCropSize]=useState({width:0,height:0});
 const [cropRatio,setCropRatio]=useState("4:3");
 const [cropZoom,setCropZoom]=useState(1);
 const [cropOffset,setCropOffset]=useState({x:0,y:0});
 const [cropRect,setCropRect]=useState({x:8,y:8,w:84,h:84});
 const [cropPreviewDevice,setCropPreviewDevice]=useState<"pc"|"mobile">("pc");
 const cropStageRef=useRef<HTMLDivElement>(null);
 const cropDragRef=useRef<{mode:"move"|"nw"|"ne"|"sw"|"se";startX:number;startY:number;origin:{x:number;y:number;w:number;h:number}}|null>(null); const [visitorLogs,setVisitorLogs]=useState<VisitorLog[]>([]); const [selectedVisitorIds,setSelectedVisitorIds]=useState<number[]>([]); const [totalViews,setTotalViews]=useState(0); const [uniqueVisitors,setUniqueVisitors]=useState(0); const [productViews,setProductViews]=useState<Record<number,number>>({}); const [editingId,setEditingId]=useState<number|null>(null); const [editingImages,setEditingImages]=useState<string[]>([]); const [message,setMessage]=useState(""); const [uploading,setUploading]=useState<string|null>(null);
 useEffect(()=>{if(!configured)return;supabase.auth.getSession().then(({data})=>setUser(data.session?.user||null));const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));return()=>subscription.unsubscribe();},[]);
 async function load(){const {data,error}=await supabase.from("products").select("*").order("created_at",{ascending:false});if(error){setMessage(error.message);return;}setItems((data||[]) as Product[]);}
 useEffect(()=>{if(user)load();},[user]);
 useEffect(()=>{if(!cropFile){setCropUrl("");setCropSize({width:0,height:0});return;}const url=URL.createObjectURL(cropFile);setCropUrl(url);const img=new Image();img.onload=()=>{setCropSize({width:img.naturalWidth,height:img.naturalHeight});const aspect=img.naturalWidth/img.naturalHeight;const ratio=targetCropRatio();let w=84,h=84;if(w/h*aspect>ratio)w=h*ratio/aspect;else h=w*aspect/ratio;setCropRect({x:(100-w)/2,y:(100-h)/2,w,h});};img.src=url;return()=>URL.revokeObjectURL(url);},[cropFile]);
 function targetCropRatio(){const key=cropTarget==="product_listing"?"product_listing":typeof cropTarget==="string"&&cropTarget.startsWith("setting:")?cropTarget.slice(8):"";const ratios:Record<string,number>={hero_image:16/9,shop_intro_background:2.5,about_intro_background:2.5,about_image:1.45,about_philosophy_image:1.45,species_muelleri_image:1.24,species_hercules_image:1.24,gallery_1:1.5,gallery_2:1.5,gallery_3:1.5,product:4/3,product_listing:1.5};return ratios[key]||4/3;}
 function initialCropRect(){const stageAspect=cropSize.width&&cropSize.height?cropSize.width/cropSize.height:4/3;const ratio=targetCropRatio();let w=84,h=84;if(w/h*stageAspect>ratio)w=h*ratio/stageAspect;else h=w*stageAspect/ratio;return {x:(100-w)/2,y:(100-h)/2,w,h};}
 function beginCrop(files:File[],target:"product"| "product_listing"|string){if(!files.length)return;setCropQueue(files);setCropIndex(0);setCropDone([]);setCropTarget(target);setCropFile(files[0]);setCropRatio("4:3");setCropZoom(1);setCropOffset({x:0,y:0});setCropRect({x:8,y:8,w:84,h:84});}
 function cropPreviewInfo(){
  const key=cropTarget==="product"?"product":typeof cropTarget==="string"&&cropTarget.startsWith("setting:")?cropTarget.slice(8):"";
  const targets:Record<string,{label:string;pc:number;mobile:number}>={
   hero_image:{label:"홈 메인 배경",pc:16/9,mobile:2/3},
   shop_intro_background:{label:"SHOP 상단 배경",pc:2.5,mobile:1.35},
   about_intro_background:{label:"ABOUT 상단 배경",pc:2.5,mobile:1.35},
   about_image:{label:"ABOUT 브리더 프로필",pc:1.45,mobile:1.2},
   about_philosophy_image:{label:"ABOUT 철학 소개 사진",pc:1.45,mobile:1},
   species_muelleri_image:{label:"뮤엘러리 사진 영역",pc:1.24,mobile:0.83},
   species_hercules_image:{label:"헤라클레스 사진 영역",pc:1.24,mobile:0.83},
   gallery_1:{label:"홈 갤러리 사진",pc:1.5,mobile:1.5},
   gallery_2:{label:"홈 갤러리 사진",pc:1.5,mobile:1.5},
   gallery_3:{label:"홈 갤러리 사진",pc:1.5,mobile:1.5},
   product:{label:"SHOP 상품 카드 사진",pc:1.12,mobile:1.12}
  };
  const info=targets[key]||{label:"사진 표시 영역",pc:4/3,mobile:4/3};
  return {...info,ratio:cropPreviewDevice==="pc"?info.pc:info.mobile};
 }
 function cropAspect(){return cropSize.width&&cropSize.height?cropSize.width/cropSize.height:4/3;}
 function cropStagePointerDown(e:ReactPointerEvent<HTMLDivElement>){
  if(!cropStageRef.current)return;
  const handle=(e.target as HTMLElement).closest("[data-crop-handle]") as HTMLElement|null;
  const mode=(handle?.dataset.cropHandle||"move") as "move"|"nw"|"ne"|"sw"|"se";
  e.currentTarget.setPointerCapture(e.pointerId);
  cropDragRef.current={mode,startX:e.clientX,startY:e.clientY,origin:{...cropRect}};
 }
 function cropStagePointerMove(e:ReactPointerEvent<HTMLDivElement>){
  if(!cropDragRef.current||!cropStageRef.current)return;
  const rect=cropStageRef.current.getBoundingClientRect();
  const dx=(e.clientX-cropDragRef.current.startX)/rect.width*100;
  const dy=(e.clientY-cropDragRef.current.startY)/rect.height*100;
  const o=cropDragRef.current.origin;
  if(cropDragRef.current.mode==="move"){
   setCropRect({...o,x:Math.max(0,Math.min(100-o.w,o.x+dx)),y:Math.max(0,Math.min(100-o.h,o.y+dy))});
   return;
  }
  const mode=cropDragRef.current.mode;
  const left=mode.includes("w"),top=mode.includes("n");
  const ratioPercent=targetCropRatio()/(rect.width/rect.height);
  const availableX=left?o.x+o.w:100-o.x;
  const availableY=top?o.y+o.h:100-o.y;
  const maxWidth=Math.min(availableX,availableY*ratioPercent);
  const horizontalDelta=left?-dx:dx;
  const verticalDelta=top?-dy:dy;
  const widthDelta=Math.abs(horizontalDelta)>=Math.abs(verticalDelta*ratioPercent)?horizontalDelta:verticalDelta*ratioPercent;
  const minWidth=Math.min(8,maxWidth);
  const width=Math.max(minWidth,Math.min(maxWidth,o.w+widthDelta));
  const height=width/ratioPercent;
  setCropRect({x:left?o.x+o.w-width:o.x,y:top?o.y+o.h-height:o.y,w:width,h:height});
 }
 async function finishCrop(){
  if(!cropFile||!cropUrl||!cropStageRef.current||!cropSize.width||!cropSize.height)return;
  const image=new Image();image.src=cropUrl;
  await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error("사진을 불러오지 못했어."));});
  const sx=Math.max(0,Math.floor(cropRect.x/100*cropSize.width));
  const sy=Math.max(0,Math.floor(cropRect.y/100*cropSize.height));
  const sw=Math.max(1,Math.min(cropSize.width-sx,Math.round(cropRect.w/100*cropSize.width)));
  const sh=Math.max(1,Math.min(cropSize.height-sy,Math.round(cropRect.h/100*cropSize.height)));
  const outW=1800;const outH=Math.max(1,Math.round(outW/(sw/sh)));
  const canvas=document.createElement("canvas");canvas.width=outW;canvas.height=outH;
  const ctx=canvas.getContext("2d");if(!ctx){setMessage("사진 편집을 시작하지 못했어.");return;}
  ctx.drawImage(image,sx,sy,sw,sh,0,0,outW,outH);
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/jpeg",.92));
  if(!blob){setMessage("편집한 사진을 저장하지 못했어.");return;}
  const edited=new File([blob],cropFile.name.replace(/\\.[^.]+$/,"")+".jpg",{type:"image/jpeg"});
  if(cropTarget==="product_listing"){setListingImage(edited);setMessage("SHOP 목록 대표 사진 편집 완료. 판매글을 저장하면 반영돼.");}
  else if(typeof cropTarget==="string"&&cropTarget.startsWith("setting:")){await uploadSetting(cropTarget.slice(8),edited);}
  setCropFile(null);setCropQueue([]);setCropDone([]);setCropTarget(null);
 }
 async function loadAnalytics(){
  const [{data:summary,error:summaryError},{data:logs,error:logsError},{data:counts,error:countsError}]=await Promise.all([
   supabase.rpc("get_visitor_summary"),
   supabase.from("visitor_logs").select("*").order("created_at",{ascending:false}).limit(100),
   supabase.from("page_view_counts").select("page_path,view_count")
  ]);
  if(!summaryError&&summary?.[0]){setTotalViews(Number(summary[0].total_views||0));setUniqueVisitors(Number(summary[0].unique_visitors||0));}
  if(!logsError){setVisitorLogs((logs||[]) as VisitorLog[]);setSelectedVisitorIds([]);}
  if(!countsError){
   const countMap=Object.fromEntries((counts||[]).map((row:any)=>[row.page_path,Number(row.view_count||0)]));
   setProductViews(Object.fromEntries(items.map(p=>[p.id,countMap[`/shop/${p.id}`]||0])));
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
 function clearForm(){setEditingId(null);setEditingImages([]);setListingImage(null);setTitle("");setPrice("");setCategory("");setScientificName("");setOrigin("");setSpecimenSize("");setSex("");setSpecimenDescription("");setImages([]);}
 function edit(p:Product){setEditingId(p.id);setListingImage(null);setEditingImages(p.image_urls?.length?p.image_urls:(p.image_url?[p.image_url]:[]));setTitle(p.title||"");setPrice(p.price||"");setCategory(p.category||"");setScientificName(p.scientific_name||"");setOrigin(p.origin||"");setSpecimenSize(p.specimen_size||"");setSex(p.sex||"");setSpecimenDescription(p.specimen_description||"");setImages([]);setListingImage(null);setMessage("수정할 내용을 입력한 뒤 저장해 주세요.");setTimeout(()=>editorRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),50);}
 async function add(e:any){
  e.preventDefault();setMessage("");
  let image_urls=editingId!==null?editingImages:[];
  if(images.length){const uploaded:string[]=[];for(let i=0;i<images.length;i++){const file=images[i];const path=`products/${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g,"_")}`;const {error:upErr}=await supabase.storage.from("kl-beetle-images").upload(path,file);if(upErr){setMessage("사진 업로드 실패: "+upErr.message);return;}uploaded.push(supabase.storage.from("kl-beetle-images").getPublicUrl(path).data.publicUrl);}image_urls=uploaded;}
  const image_url=image_urls[0]||null;
  let listing_image_url:string|null|undefined=editingId!==null?undefined:null;
  if(listingImage){const path=`products/listing-${Date.now()}-${listingImage.name.replace(/[^a-zA-Z0-9.-]/g,"_")}`;const {error:upErr}=await supabase.storage.from("kl-beetle-images").upload(path,listingImage);if(upErr){setMessage("목록용 사진 업로드 실패: "+upErr.message);return;}listing_image_url=supabase.storage.from("kl-beetle-images").getPublicUrl(path).data.publicUrl;}
  const values={title,price,category,image_url,image_urls,...(listing_image_url!==undefined?{listing_image_url}:{}),scientific_name:scientificName,origin,specimen_size:specimenSize,sex,specimen_description:specimenDescription};
  const result=editingId!==null?await supabase.from("products").update(values).eq("id",editingId).select("id"):await supabase.from("products").insert({...values,is_sold:false}).select("id");
  if(result.error){setMessage("저장 실패: "+result.error.message);return;}
  if(!result.data?.length){setMessage("수정된 데이터가 없어. Supabase에서 products 테이블의 UPDATE 권한 정책을 확인해야 해.");return;}
  setMessage(editingId!==null?"판매글을 수정했습니다.":"판매글을 등록했습니다.");clearForm();await load();
 }
 async function uploadSetting(key:string,file:File){setUploading(key);setMessage("");try{const ext=file.name.split(".").pop()?.toLowerCase()||"jpg";const path=`site/${key}-${Date.now()}.${ext}`;const {error:upErr}=await supabase.storage.from("kl-beetle-images").upload(path,file);if(upErr)throw upErr;const url=supabase.storage.from("kl-beetle-images").getPublicUrl(path).data.publicUrl;const {data:existing,error:readErr}=await supabase.from("site_settings").select("id").eq("setting_key",key).maybeSingle();if(readErr)throw readErr;const result=existing?.id?await supabase.from("site_settings").update({setting_value:url,updated_at:new Date().toISOString()}).eq("id",existing.id):await supabase.from("site_settings").insert({setting_key:key,setting_value:url});if(result.error)throw result.error;setMessage("사진 저장 완료! 사이트에 반영됐어.");}catch(error:any){setMessage("사진 저장 실패: "+(error?.message||"알 수 없는 오류"));}finally{setUploading(null);}}
 async function toggle(p:Product){const {error}=await supabase.from("products").update({is_sold:!p.is_sold}).eq("id",p.id);if(error)setMessage(error.message);else await load();}
 async function remove(id:number){if(!confirm("이 판매글을 삭제할까요? 삭제하면 되돌릴 수 없어."))return;setMessage("");const {data,error}=await supabase.from("products").delete().eq("id",id).select("id");if(error){setMessage("게시글 삭제 실패: "+error.message);return;}if(!data?.length){setMessage("삭제된 게시글이 없어. Supabase의 products DELETE 권한 정책을 확인해야 해.");return;}if(editingId===id)clearForm();setMessage("게시글을 삭제했어.");await load();}
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
     <td style={{padding:"10px 8px",borderBottom:"1px solid #e0dcd3"}}><input aria-label={`방문 기록 ${v.id} 선택`} type="checkbox" checked={selectedVisitorIds.includes(v.id)} onChange={e=>setSelectedVisitorIds(old=>e.target.checked?[...old,v.id]:old.filter(id=>id!==v.id))}/></td>
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
 <section className="adminSettings"><h2>사이트 사진 관리</h2><p>사진을 선택하면 저장 후 사이트에 자동 반영됩니다. 다시 배포할 필요가 없습니다.</p><div className="settingUploads">{imageSlots.map(slot=><label className="settingUpload" key={slot.key}>{slot.label}<input type="file" accept="image/*" disabled={uploading!==null} onChange={e=>{const file=e.target.files?.[0];if(file)beginCrop([file],`setting:${slot.key}`);e.currentTarget.value="";}}/>{uploading===slot.key&&<small>업로드 중...</small>}</label>)}</div></section>
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
  <label>상세 페이지 사진 (원본 그대로 · 여러 장 가능)<input type="file" accept="image/*" multiple onChange={e=>{const files=Array.from(e.target.files||[]);if(files.length){setImages(files);setMessage("상세 페이지용 원본 사진을 선택했어.");}e.currentTarget.value="";}}/><small>{editingId!==null?"기존 사진은 유지돼. 새 사진을 선택하면 편집 후 사진 전체가 교체돼.":"선택한 원본 사진이 상세 페이지에 그대로 등록돼."}</small>{images.length>0&&<small>편집 완료된 새 사진: {images.length}장</small>}{editingId!==null&&editingImages.length>0&&images.length===0&&<small>현재 등록된 사진: {editingImages.length}장</small>}</label>
  <label>SHOP 목록 카드 사진 (별도 자르기)<input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0];if(file)beginCrop([file],"product_listing");e.currentTarget.value="";}}/><small>{listingImage?"새 목록용 사진 편집 완료":editingId!==null?"새 사진을 선택하지 않으면 기존 목록 사진을 유지해.":"목록 카드에 표시할 사진을 별도로 올려줘."}</small></label>
  <button type="submit">{editingId!==null?"수정 내용 저장":"판매글 등록"}</button>{editingId!==null&&<button type="button" onClick={clearForm}>수정 취소</button>}
 </form>
 <h2 className="adminHeading">등록된 판매글</h2>{items.map(p=><div className="adminItem" key={p.id}><span>{p.title} · {p.is_sold?"판매완료":"판매중"}</span><div><button type="button" onClick={()=>edit(p)}>수정</button><button type="button" onClick={()=>toggle(p)}>{p.is_sold?"판매중으로":"판매완료로"}</button><button type="button" className="danger" onClick={()=>remove(p.id)}>삭제</button></div></div>)}
 </>}
 {cropFile&&<div className="photoCropOverlay" role="dialog" aria-modal="true" aria-label="사진 편집">
  <div className="photoCropDialog">
   <div className="photoCropHeader"><div><p className="eyebrow">KL BEETLE / PHOTO EDITOR</p><h2>사진 위치 및 크기 조절</h2><small>{cropIndex+1} / {cropQueue.length}장 편집 중</small></div><button type="button" onClick={()=>{setCropFile(null);setCropQueue([]);setCropDone([]);setCropTarget(null);}}>닫기</button></div>
   <p className="photoCropHint">원본 사진 경계 안에서만 자를 수 있어. 네 꼭짓점은 표시 비율을 유지하며 움직이고, 사진 바깥으로 넘어가지 않아. 안쪽을 드래그해 위치를 옮겨줘.</p>
   <div className="photoCropWorkspace">
    <div className="photoCropEditorColumn">
     <strong className="photoCropSectionTitle">원본 사진 · 표시할 영역 선택</strong>
     <div ref={cropStageRef} className="photoCropStage" style={{aspectRatio:cropAspect(),width:`min(100%, calc(52vh * ${cropAspect()}))`,touchAction:"none"}} onPointerDown={cropStagePointerDown} onPointerMove={cropStagePointerMove} onPointerUp={()=>{cropDragRef.current=null;}} onPointerCancel={()=>{cropDragRef.current=null;}}>
      {cropUrl&&<img src={cropUrl} alt="편집할 사진" draggable={false} style={{transform:"translate(-50%,-50%)"}}/>}
      <div className="photoCropSelection" style={{left:`${cropRect.x}%`,top:`${cropRect.y}%`,width:`${cropRect.w}%`,height:`${cropRect.h}%`}}>
       <span className="photoCropSelectionLabel">자를 영역</span>
       {(["nw","ne","sw","se"] as const).map(h=><span key={h} data-crop-handle={h} className={`photoCropHandle photoCropHandle-${h}`}/>)}
      </div>
     </div>
    </div>
   </div>
   <div className="photoCropControls">
    <label>표시 영역 비율 <strong>{targetCropRatio().toFixed(2)} : 1 (자동 고정)</strong></label>
    <label>확대 / 축소 <strong>{Math.round(cropZoom*100)}%</strong><input type="range" min="1" max="3" step=".01" value={cropZoom} onChange={e=>setCropZoom(Number(e.target.value))}/></label>
   </div>
   <div className="photoCropActions"><button type="button" className="photoCropReset" onClick={()=>{setCropRect(initialCropRect());}}>자르기 영역 초기화</button><button type="button" onClick={finishCrop}> {cropIndex+1<cropQueue.length?"다음 사진":"편집 완료"} </button></div>
  </div>
 </div>}
 {message&&<p className="notice">{message}</p>}</main>;
}
