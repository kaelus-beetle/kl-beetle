import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./site-header";
import { VisitorTracker } from "./visitor-tracker";

export const metadata: Metadata = {
  title: "KL BEETLE | Breeding & Collection",
  description: "KL BEETLE — Beetle breeding and collection."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body><SiteHeader /><VisitorTracker />{children}<footer className="footer">© KL BEETLE · BREEDING & COLLECTION<br /><span style={{display:"block",marginTop:"10px",fontSize:"10px",letterSpacing:"0",lineHeight:1.8}}>사이트 이용 통계 및 보안을 위해 IP 주소, 접속 시간, 방문 페이지, 기기·브라우저 정보와 대략적인 접속 지역을 수집합니다.</span></footer></body></html>;
}
