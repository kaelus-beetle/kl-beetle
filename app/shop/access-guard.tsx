"use client";

import { useEffect, useState, type ReactNode } from "react";

function hasValidConsent() {
  try {
    if (localStorage.getItem("klb_gps_consent") !== "granted") return false;
    const value = JSON.parse(localStorage.getItem("klb_gps_position") || "null");
    return Boolean(value &&
      Number.isFinite(value.latitude) &&
      Number.isFinite(value.longitude) &&
      Number.isFinite(value.accuracy));
  } catch {
    return false;
  }
}

export default function ShopAccessGuard({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const refresh = () => setAllowed(hasValidConsent());
    refresh();
    window.addEventListener("klb-gps-consent-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("klb-gps-consent-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!allowed) return <main className="subPage" aria-live="polite" style={{minHeight:"60vh",display:"grid",placeItems:"center"}}><p className="notice">SHOP 위치 확인이 필요해. 안내창에서 동의하고 위치 확인을 완료해 줘.</p></main>;
  return <>{children}</>;
}
