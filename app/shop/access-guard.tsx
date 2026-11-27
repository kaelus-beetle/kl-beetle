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
  if (!allowed) return null;
  return <>{children}</>;
}
