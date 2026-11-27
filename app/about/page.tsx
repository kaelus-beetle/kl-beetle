import { supabase, configured } from "../../lib/supabase";

export const dynamic = "force-dynamic";
export default async function About() {
  let settings:Record<string,string>={};
  if(configured){const {data}=await supabase.from("site_settings").select("setting_key,setting_value").in("setting_key",["about_image","about_intro_background","about_philosophy_image","species_muelleri_image","species_hercules_image"]);for(const row of data||[])settings[row.setting_key]=row.setting_value||"";}
  const profileImage=settings.about_image||"";
  return <main className="subPage">
    <section className="pageIntro aboutIntro" style={settings.about_intro_background?{backgroundImage:`linear-gradient(rgba(15,19,13,.48),rgba(15,19,13,.48)),url("${settings.about_intro_background}")`}:undefined}><p className="eyebrow">ABOUT KL BEETLE</p><h1>MEET THE BREEDER</h1><p>Breeding with patience, care, and respect for every specimen.</p></section>
    <section className="section aboutPhilosophy">
      <p className="eyebrow">OUR PHILOSOPHY</p>
      <h2>Small wonders. Endless fascination.</h2>
      <p className="bodyCopy">작은 생명 안에 담긴 놀라운 형태와 생명력. KL BEETLE은 곤충이 가진 고유한 아름다움과 브리딩의 즐거움을 소중히 생각합니다. 정성스럽게 사육하고 관찰한 개체들을 소개합니다.</p>
      <p className="bodyCopy">한 마리의 곤충이 자라 성충이 되기까지의 과정에는 세심한 관리와 꾸준한 관찰이 필요합니다. 개체마다 다른 특징을 살피고 사육 과정과 혈통을 기록하며, 건강한 환경에서 이어지는 브리딩을 중요하게 생각합니다. KL BEETLE은 그 과정에서 발견한 곤충의 매력과 소중한 컬렉션을 함께 나누고자 합니다.</p>
      {settings.about_philosophy_image&&<div className="aboutPhilosophyImage"><img src={settings.about_philosophy_image} alt="KL BEETLE breeding and nature"/></div>}
    </section>
    <section className="aboutGrid section">
      <div className="profileBlank" aria-label="Breeder profile image area" style={profileImage?{backgroundImage:`url("${profileImage}")`,backgroundSize:"cover",backgroundPosition:"center"}:undefined}></div>
      <div className="aboutText"><p className="eyebrow">THE BREEDER</p><h2>KAELUS</h2><p>안녕하세요. KL BEETLE의 브리더 KAELUS입니다.</p><p>저는 뮤엘러리사슴벌레와 헤라클레스장수풍뎅이를 중심으로 다양한 곤충을 브리딩하고 있습니다. 단순히 크기나 외형만을 좇기보다 각 종이 지닌 고유한 형태와 습성, 개체마다 다른 매력을 이해하는 것을 브리딩의 첫걸음으로 생각합니다.</p><p>한 마리의 개체가 다음 세대로 이어지기까지 성장 과정과 혈통을 세심하게 살피고, 종과 개체의 특성에 맞는 안정적인 사육 환경을 만드는 데 집중합니다. 작은 변화도 놓치지 않도록 꾸준히 관찰하고 기록하며, 건강한 개체를 오래도록 만날 수 있는 사육과 브리딩을 지향합니다.</p><p>KL BEETLE은 이러한 경험과 애정을 바탕으로 제가 직접 사육하며 느낀 곤충의 아름다움과 브리딩의 즐거움을 나누는 공간입니다. 앞으로도 한 마리 한 마리를 소중히 여기며 신뢰할 수 있는 개체와 기록을 소개하겠습니다.</p></div>
    </section>
    <section className="species section"><article><div className="speciesImage">{settings.species_muelleri_image&&<img src={settings.species_muelleri_image} alt="뮤엘러리사슴벌레"/>}</div><p className="eyebrow">01 / SPECIES</p><h2>P. MUELLERI</h2><p>뮤엘러리사슴벌레 · <i>Phalacrognathus muelleri</i></p></article><article><div className="speciesImage">{settings.species_hercules_image&&<img src={settings.species_hercules_image} alt="헤라클레스장수풍뎅이"/>}</div><p className="eyebrow">02 / SPECIES</p><h2>HERCULES</h2><p>헤라클레스장수풍뎅이 · <i>Dynastes hercules hercules</i></p></article></section>
  </main>;
}
