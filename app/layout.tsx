import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./site-header";
import { VisitorTracker } from "./visitor-tracker";
import { supabase, configured } from "../lib/supabase";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let breederImage = "";
  if (configured) {
    const { data } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "about_image")
      .maybeSingle();
    breederImage = data?.setting_value || "";
  }

  const image = breederImage || "https://ecoinsectos.com/wp-content/uploads/2025/04/Escarabajo-Hercules-Dynastes-Hercules.jpg";
  return {
    metadataBase: new URL("https://kl-beetle.vercel.app"),
    title: "KL BEETLE | Breeding & Collection",
    description: "KL BEETLE — Beetle breeding and collection.",
    openGraph: {
      type: "website",
      siteName: "KL BEETLE",
      title: "KL BEETLE | Breeding & Collection",
      description: "KL BEETLE — Beetle breeding and collection.",
      images: [{ url: image, width: 1200, height: 630, alt: "KL BEETLE 브리더 소개" }]
    },
    twitter: {
      card: "summary_large_image",
      title: "KL BEETLE | Breeding & Collection",
      description: "KL BEETLE — Beetle breeding and collection.",
      images: [image]
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body><SiteHeader /><VisitorTracker />{children}<footer className="footer">© KL BEETLE · BREEDING & COLLECTION</footer></body></html>;
}
