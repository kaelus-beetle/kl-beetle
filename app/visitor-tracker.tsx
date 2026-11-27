"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [gpsPosition, setGpsPosition] = useState<{latitude:number;longitude:number;accuracy:number}|null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (!pathname.startsWith("/shop")) {
      setShowLocationPrompt(false);
      setAccessDenied(false);
      setLocationMessage("");
      return;
    }
    setGpsPosition(null);
    setShowLocationPrompt(false);
    setAccessDenied(false);
    let cancelled = false;
    fetch("/api/location-consent", { cache: "no-store" })
      .then(response => response.json())
      .then(result => {
        if (cancelled) return;
        if (result.hasConsent === true) {
          try {
            const saved = localStorage.getItem("klb_gps_position");
            const parsed = saved ? JSON.parse(saved) : null;
            if (parsed && Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude) && Number.isFinite(parsed.accuracy)) {
              localStorage.setItem("klb_gps_consent", "granted");
              setGpsPosition(parsed);
              setShowLocationPrompt(false);
              setAccessDenied(false);
              return;
            }
          } catch {}
        }
        try {
          localStorage.removeItem("klb_gps_consent");
          localStorage.removeItem("klb_gps_position");
        } catch {}
        setAccessDenied(false);
        setShowLocationPrompt(true);
        setLocationMessage("");
      })
      .catch(() => {
        if (cancelled) return;
        setShowLocationPrompt(true);
        setLocationMessage("");
      });
    return () => { cancelled = true; };
  }, [pathname]);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const eventId = crypto.randomUUID();
    const startedAt = Date.now();
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_path: pathname,
        event_id: eventId,
        referrer: document.referrer,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(gpsPosition ? { gps_consent: true, ...gpsPosition } : {})
      }),
      keepalive: true
    }).catch(() => {});
    return () => {
      const duration = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "duration", event_id: eventId, duration_seconds: duration }),
        keepalive: true
      }).catch(() => {});
    };
  }, [pathname, gpsPosition]);

  function declineLocation() {
    try { localStorage.setItem("klb_gps_consent", "declined"); } catch {}
    setLocationMessage("");
    setAccessDenied(true);
    setShowLocationPrompt(false);
  }

  function acceptLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("위치 확인을 지원하지 않는 브라우저입니다.");
      return;
    }
    setLocationMessage("위치 서비스 이용 동의를 확인하고 있습니다. 잠시만 기다려 주세요.");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        try {
          localStorage.setItem("klb_gps_consent", "granted");
          localStorage.setItem("klb_gps_position", JSON.stringify(value));
        } catch {}
        setGpsPosition(value);
        window.dispatchEvent(new Event("klb-gps-consent-updated"));
        setLocationMessage("");
        setShowLocationPrompt(false);
      },
      () => {
        try { localStorage.setItem("klb_gps_consent", "declined"); } catch {}
        setLocationMessage("위치 정보를 확인할 수 없어 SHOP 이용이 제한되었습니다. 브라우저의 위치 권한을 허용한 후 다시 시도해 주세요.");
        setAccessDenied(true);
        setShowLocationPrompt(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  if (accessDenied) {
    return (
      <div role="alert" style={{position:"fixed",inset:0,zIndex:10001,background:"#171914",color:"#f8f6f0",display:"grid",placeItems:"center",padding:24,textAlign:"center"}}>
        <div style={{width:"min(100%,460px)"}}>
          <p style={{fontSize:11,letterSpacing:3,color:"#a5ad91",margin:"0 0 14px"}}>KL BEETLE / ACCESS DENIED</p>
          <h1 style={{fontSize:26,fontWeight:500,margin:"0 0 16px"}}>SHOP 이용이 제한되었습니다</h1>
          <p style={{fontSize:14,lineHeight:1.9,color:"#d4d5cd",margin:"0 0 18px"}}>SHOP을 이용하시려면 위치 서비스 이용에 동의하고 기기의 위치 확인을 완료해 주세요. 동의하지 않으시면 SHOP에 입장하실 수 없습니다.</p>
          <button onClick={() => { try { localStorage.removeItem("klb_gps_consent"); } catch {} setAccessDenied(false); setShowLocationPrompt(true); setLocationMessage(""); }} style={{padding:"12px 20px",background:"#626a4e",color:"#fff",border:0,cursor:"pointer"}}>다시 시도</button>
        </div>
      </div>
    );
  }

  if (!showLocationPrompt) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="klb-location-title" style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,.82)",display:"grid",placeItems:"center",padding:20}}>
      <div style={{width:"min(100%,430px)",background:"#f8f6f0",color:"#252820",padding:"28px 24px",boxShadow:"0 18px 60px rgba(0,0,0,.28)"}}>
        <p style={{fontSize:11,letterSpacing:3,color:"#747b62",margin:"0 0 12px"}}>KL BEETLE / LOCATION PERMISSION</p>
        <h2 id="klb-location-title" style={{fontSize:22,fontWeight:500,margin:"0 0 14px"}}>위치 서비스 이용 동의</h2>
        <p style={{fontSize:14,lineHeight:1.8,margin:"0 0 22px"}}>SHOP 이용을 위해 위치 정보 제공 동의가 필요합니다. 아래 버튼을 누르신 후 브라우저에 표시되는 위치 권한 요청에서도 허용해 주세요. 동의하지 않으시면 SHOP을 이용하실 수 없습니다.</p>
        <button onClick={acceptLocation} style={{width:"100%",padding:14,background:"#626a4e",color:"#fff",border:0,fontSize:14,cursor:"pointer"}}>위치 서비스 이용에 동의합니다</button>
        <button onClick={declineLocation} style={{width:"100%",padding:13,marginTop:9,background:"transparent",color:"#4f5149",border:"1px solid #c9c6bb",fontSize:13,cursor:"pointer"}}>동의하지 않습니다</button>
        {locationMessage && <p role="status" style={{fontSize:12,lineHeight:1.6,margin:"12px 0 0",color:"#8a4a3d"}}>{locationMessage}</p>}
      </div>
    </div>
  );
}
