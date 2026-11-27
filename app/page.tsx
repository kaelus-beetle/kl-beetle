import Link from "next/link";
import { supabase, configured } from "../lib/supabase";
const fallbackHero = "https://images.unsplash.com/photo-1597776941486-054bf4a8d7a1?auto=format&fit=crop&w=2200&q=90";
const fallbackGallery = [
  "https://images.unsplash.com/photo-1558944351-cd4b5b1f6d7d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1597776941486-054bf4a8d7a1?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=900&q=85"
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
        {gallery.map((src, i) => <Link href={i === 0 ? "/about" : "/shop"} className="homeGalleryItem" key={i}>
          <img src={src} alt={["P. muelleri beetle","Hercules beetle","Stag beetle"][i]}/>
        </Link>)}
      </div>
    </section>
  </main>;
}
