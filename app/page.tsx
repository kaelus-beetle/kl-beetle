import Link from "next/link";
export default function Home() {
  return <main>
    <section className="hero">
      <div className="heroShade"></div>
      <div className="heroText"><p className="eyebrow">THE ART OF BEETLE BREEDING</p><h1>KL BEETLE</h1><p>BREEDING WITH PASSION.<br/>COLLECTING WITH PURPOSE.</p><Link className="lightButton" href="/shop">EXPLORE COLLECTION</Link></div>
    </section>
    <section className="intro section">
      <p className="eyebrow">WELCOME TO KL BEETLE</p><h2>Nature, shaped by patience.</h2>
      <p className="bodyCopy">A place for remarkable beetles, thoughtful breeding, and the details that make every individual unique.</p>
      <div className="featureGrid">
        <Link href="/about" className="feature"><div className="featureImage imageOne"></div><span>01 / ABOUT THE BREEDER</span><h3>Meet the breeder</h3></Link>
        <Link href="/shop" className="feature"><div className="featureImage imageTwo"></div><span>02 / AVAILABLE BEETLES</span><h3>Explore the collection</h3></Link>
        <a href="https://open.kakao.com/o/sunFEYTi" target="_blank" className="feature"><div className="featureImage imageThree"></div><span>03 / CONTACT</span><h3>Let’s talk beetles</h3></a>
      </div>
    </section>
    <section className="quote"><p>“Every generation tells a story.”</p><span>KL BEETLE</span></section>
  </main>;
}
