"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function SiteHeader() {
  const path = usePathname();
  return <header className={`header ${path === "/" ? "homeHeader" : ""}`}>
    <Link href="/" className="brand">KL BEETLE<span>BREEDING · COLLECTION · NATURE</span></Link>
    <nav>
      <Link className={path === "/" ? "active" : ""} href="/">HOME</Link>
      <Link className={path === "/about" ? "active" : ""} href="/about">ABOUT</Link>
      <Link className={path === "/shop" ? "active" : ""} href="/shop">SHOP</Link>
    </nav>
    <a className="headerContact" href="https://open.kakao.com/o/sunFEYTi" target="_blank" rel="noreferrer">CONTACT</a>
  </header>;
}
