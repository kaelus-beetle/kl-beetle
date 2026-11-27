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
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const refresh = () => {
      setAllowed(hasValidConsent());
      setChecked(true);
    };
    refresh();
    window.addEventListener("klb-gps-consent-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("klb-gps-consent-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!checked) return null;
  if (!allowed) return <main className="subPage" aria-live="polite" style={{minHeight:"60vh",display:"grid",placeItems:"center"}}><p className="notice">SHOP 이용을 위해 위치 서비스 이용 동의가 필요합니다. 안내창에서 동의하신 후 위치 확인을 완료해 주세요.</p></main>;
  return <>{children}</>;
}
