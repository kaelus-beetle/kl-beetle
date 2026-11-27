import Link from "next/link";
import { supabase, configured } from "../lib/supabase";
export default async function Home() {
  let settings:Record<string,string>={};
  if(configured){const {data}=await supabase.from("site_settings").select("setting_key,setting_value");for(const row of data||[])settings[row.setting_key]=row.setting_value;}
  const heroStyle=settings.hero_image?{backgroundImage:`linear-gradient(90deg,rgba(15,20,12,.72),rgba(15,20,12,.08)),url("${settings.hero_image}")`}:undefined;
  const gallery=[settings.gallery_1,settings.gallery_2,settings.gallery_3];
  return <main>
    <section className="hero" style={heroStyle}>
      <div className="heroShade"></div>
      <div className="heroText"><p className="eyebrow">THE ART OF BEETLE BREEDING</p><h1>KL BEETLE</h1><p>BREEDING WITH PASSION.<br/>COLLECTING WITH PURPOSE.</p><Link className="lightButton" href="/shop">EXPLORE COLLECTION</Link></div>
    </section>
    <section className="intro section">
      <p className="eyebrow">WELCOME TO KL BEETLE</p><h2>Nature, shaped by patience.</h2>
      <p className="bodyCopy">A place for remarkable beetles, thoughtful breeding, and the details that make every individual unique.</p>
      <div className="featureGrid">
        <Link href="/about" className="feature"><div className="featureImage imageOne" style={gallery[0]?{backgroundImage:`url("${gallery[0]}")`}:undefined}></div><span>01 / ABOUT THE BREEDER</span><h3>Meet the breeder</h3></Link>
        <Link href="/shop" className="feature"><div className="featureImage imageTwo" style={gallery[1]?{backgroundImage:`url("${gallery[1]}")`}:undefined}></div><span>02 / AVAILABLE BEETLES</span><h3>Explore the collection</h3></Link>
        <a href="https://open.kakao.com/o/sunFEYTi" target="_blank" rel="noreferrer" className="feature"><div className="featureImage imageThree" style={gallery[2]?{backgroundImage:`url("${gallery[2]}")`}:undefined}></div><span>03 / CONTACT</span><h3>Let’s talk beetles</h3></a>
      </div>
    </section>
    <section className="quote"><p>“Every generation tells a story.”</p><span>KL BEETLE</span></section>
  </main>;
}
