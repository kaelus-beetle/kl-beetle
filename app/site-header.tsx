"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function SiteHeader() {
  const path = usePathname();
  return <header className="header">
    <Link href="/" className="brand">KL BEETLE<span>BREEDING & COLLECTION</span></Link>
    <nav><Link className={path==="/about"?"active":""} href="/about">ABOUT</Link><Link className={path==="/shop"?"active":""} href="/shop">SHOP</Link></nav>
  </header>;
}
