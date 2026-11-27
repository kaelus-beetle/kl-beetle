import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./site-header";

export const metadata: Metadata = {
  title: "KL BEETLE | Breeding & Collection",
  description: "KL BEETLE — Beetle breeding and collection."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body><SiteHeader />{children}<footer className="footer">© KL BEETLE · BREEDING & COLLECTION</footer></body></html>;
}
