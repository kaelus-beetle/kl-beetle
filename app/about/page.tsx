import { supabase, configured } from "../../lib/supabase";

export const dynamic = "force-dynamic";
export default async function About() {
  let profileImage="";
  if(configured){const {data}=await supabase.from("site_settings").select("setting_value").eq("setting_key","about_image").maybeSingle();profileImage=data?.setting_value||"";}
  return <main className="subPage">
    <section className="pageIntro"><p className="eyebrow">ABOUT KL BEETLE</p><h1>MEET THE BREEDER</h1><p>Breeding with patience, care, and respect for every specimen.</p></section>
    <section className="section aboutPhilosophy">
      <p className="eyebrow">OUR PHILOSOPHY</p>
      <h2>Small wonders. Endless fascination.</h2>
      <p className="bodyCopy">작은 생명 안에 담긴 놀라운 형태와 생명력. KL BEETLE은 곤충이 가진 고유한 아름다움과 브리딩의 즐거움을 소중히 생각합니다. 정성스럽게 사육하고 관찰한 개체들을 소개합니다.</p>
      <p className="bodyCopy">한 마리의 곤충이 자라 성충이 되기까지의 과정에는 세심한 관리와 꾸준한 관찰이 필요합니다. 개체마다 다른 특징을 살피고 사육 과정과 혈통을 기록하며, 건강한 환경에서 이어지는 브리딩을 중요하게 생각합니다. KL BEETLE은 그 과정에서 발견한 곤충의 매력과 소중한 컬렉션을 함께 나누고자 합니다.</p>
    </section>
    <section className="aboutGrid section">
      <div className="profileBlank" aria-label="Breeder profile image area" style={profileImage?{backgroundImage:`url("${profileImage}")`,backgroundSize:"cover",backgroundPosition:"center"}:undefined}></div>
      <div className="aboutText"><p className="eyebrow">THE BREEDER</p><h2>KAELUS</h2><p>안녕하세요. KL BEETLE 브리더 KAELUS입니다.</p><p>뮤엘러리사슴벌레와 헤라클레스를 중심으로 브리딩하고 있으며, 그 외에도 다양한 곤충을 사육하고 있습니다. 개체 하나하나의 특징과 혈통, 건강한 사육 환경을 중요하게 생각합니다.</p></div>
    </section>
    <section className="species section"><article><p className="eyebrow">01 / SPECIES</p><h2>P. MUELLERI</h2><p>뮤엘러리사슴벌레 · <i>Phalacrognathus muelleri</i></p></article><article><p className="eyebrow">02 / SPECIES</p><h2>HERCULES</h2><p>헤라클레스장수풍뎅이</p></article></section>
  </main>;
}
