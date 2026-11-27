// Trigger a fresh Vercel production deployment.
import Link from "next/link";
import { supabase, configured } from "../lib/supabase";

export const dynamic = "force-dynamic";
const fallbackHero = "https://images.unsplash.com/photo-1673295671950-dc7f478d1f22?auto=format&fit=crop&fm=jpg&q=85&w=3000";
const fallbackGallery = [
  "https://upload.wikimedia.org/wikipedia/commons/5/54/Rainbow_stag_beetle.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/1/15/Dynaste_hercule_%2814%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/e/e2/Stag_Beetle_%28Lamprima_adolphinae%29_%288430587514%29.jpg"
];
export default async function Home() {
  let settings: Record<string, string> = {};
  if (configured) {
    const { data } = await supabase.from("site_settings").select("setting_key,setting_value");
    for (const row of data || []) settings[row.setting_key] = row.setting_value;
  }
  const heroImage = settings.hero_image || fallbackHero;
  const gallery = [settings.gallery_1 || fallbackGallery[0], settings.gallery_2 || fallbackGallery[1], settings.gallery_3 || fallbackGallery[2]];
  return <main className="homePage">
    <section className="homeHero" style={{ backgroundImage: `linear-gradient(90deg,rgba(13,18,12,.76),rgba(13,18,12,.30) 48%,rgba(13,18,12,.08)),url("${heroImage}")` }}>
      <div className="homeHeroText">
        <p className="homeEyebrow">KL BEETLE</p>
        <h1>Small wonders.<br/>Endless<br/>fascination.</h1>
        <p className="homeHeroSub">Nature, in every detail.</p>
        <Link className="homeOutlineButton" href="/shop">EXPLORE SHOP <span>↗</span></Link>
      </div>
      <div className="homeScroll">SCROLL TO EXPLORE</div>
    </section>
    <section className="homePhilosophy">
      <div className="homePhilosophyCopy">
        <p className="homeEyebrow dark">OUR PHILOSOPHY</p>
        <h2>P. muelleri &amp;<br/>Hercules.</h2>
        <p className="homeKoreanCopy">곤충이 가진 형태와 생명력, 그리고 한 세대씩 이어지는 브리딩의 가치. KL BEETLE은 개체 하나하나의 매력을 관찰하고 기록하며, 정성을 담아 사육한 곤충들을 소개합니다.</p>
        <Link className="homeTextLink" href="/about">MEET THE BREEDER ↗</Link>
      </div>
      <div className="homeGallery">
        {gallery.map((src, i) => {
          const labels = ["1. ABOUT", "2. SHOP", "3. CONTACT"];
          const species = ["P. MUELLERI", "HERCULES", "LAMPRIMA"];
          const korean = ["뮤엘러리사슴벌레", "헤라클레스장수풍뎅이", "람프리마"];
          const card = <div className="homeGalleryItem">
            <img src={src} alt={species[i] + " — " + korean[i]}/>
            <div className="homeGalleryCaption">
              <strong>{labels[i]}</strong>
            </div>
          </div>;
          if (i === 2) return <a href="https://open.kakao.com/o/sunFEYTi" target="_blank" rel="noreferrer" key={i}>{card}</a>;
          return <Link href={i === 0 ? "/about" : "/shop"} key={i}>{card}</Link>;
        })}
      </div>
      <p className="photoCredits">PHOTO CREDITS: <a href="https://commons.wikimedia.org/wiki/File:Rainbow_stag_beetle.jpg" target="_blank" rel="noreferrer">Jbjensen1 (CC0)</a> · <a href="https://commons.wikimedia.org/wiki/File:Dynaste_hercule_(14).jpg" target="_blank" rel="noreferrer">Cangadoba (CC BY-SA 4.0)</a> · <a href="https://commons.wikimedia.org/wiki/File:Stag_Beetle_(Lamprima_adolphinae)_(8430587514).jpg" target="_blank" rel="noreferrer">Bernard DUPONT (CC BY-SA 2.0)</a></p>
    </section>
  </main>;
}
