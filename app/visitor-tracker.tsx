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

    // Location consent is required only when entering the SHOP section.
    if (!pathname.startsWith("/shop")) {
      setShowLocationPrompt(false);
      setAccessDenied(false);
      setLocationMessage("");
      return;
    }

    setAccessDenied(false);
    try {
      const consent = localStorage.getItem("klb_gps_consent");
      if (consent === "granted") {
        const saved = localStorage.getItem("klb_gps_position");
        if (saved) setGpsPosition(JSON.parse(saved));
        setShowLocationPrompt(false);
      } else {
        // Ask again whenever the visitor enters SHOP or reloads while on SHOP.
        setShowLocationPrompt(true);
        setLocationMessage("");
      }
    } catch {
      setShowLocationPrompt(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_path: pathname,
        ...(gpsPosition ? { gps_consent: true, ...gpsPosition } : {})
      }),
      keepalive: true
    }).catch(() => {});
  }, [pathname, gpsPosition]);

  function declineLocation() {
    try { localStorage.setItem("klb_gps_consent", "declined"); } catch {}
    setLocationMessage("");
    setAccessDenied(true);
    setShowLocationPrompt(false);
  }

  function acceptLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("위치 확인을 지원하는 브라우저에서 이용해 줘.");
      return;
    }
    setLocationMessage("기기의 위치 확인을 기다리는 중이야.");
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
        setLocationMessage("");
        setShowLocationPrompt(false);
      },
      () => {
        setLocationMessage("대한민국에서만 KL BEETLE에 접속할 수 있어. 위치 권한을 허용하고 다시 시도해 줘.");
        try { localStorage.setItem("klb_gps_consent", "declined"); } catch {}
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  if (accessDenied) {
    return (
      <div role="alert" style={{position:"fixed",inset:0,zIndex:10001,background:"#171914",color:"#f8f6f0",display:"grid",placeItems:"center",padding:24,textAlign:"center"}}>
        <div style={{width:"min(100%,460px)"}}>
          <p style={{fontSize:11,letterSpacing:3,color:"#a5ad91",margin:"0 0 14px"}}>KL BEETLE / ACCESS DENIED</p>
          <h1 style={{fontSize:26,fontWeight:500,margin:"0 0 16px"}}>해외 접속 제한 안내</h1>
          <p style={{fontSize:14,lineHeight:1.9,color:"#d4d5cd",margin:0}}>KL BEETLE은 대한민국에서만 이용할 수 있습니다. 위치 정보 제공에 동의하지 않아 접속이 제한되었습니다.</p>
        </div>
      </div>
    );
  }

  if (!showLocationPrompt) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="klb-location-title" style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,.72)",display:"grid",placeItems:"center",padding:20}}>
      <div style={{width:"min(100%,430px)",background:"#f8f6f0",color:"#252820",padding:"28px 24px",boxShadow:"0 18px 60px rgba(0,0,0,.28)"}}>
        <p style={{fontSize:11,letterSpacing:3,color:"#747b62",margin:"0 0 12px"}}>KL BEETLE / ACCESS NOTICE</p>
        <h2 id="klb-location-title" style={{fontSize:22,fontWeight:500,margin:"0 0 14px"}}>해외 접속 제한 안내</h2>
        <p style={{fontSize:14,lineHeight:1.8,margin:"0 0 22px"}}>KL BEETLE은 대한민국 이용자를 위한 서비스로, 해외에서는 이용이 제한됩니다. 국내 접속 여부를 확인하기 위해 기기의 위치 정보 제공을 요청합니다.</p>
        <button onClick={acceptLocation} style={{width:"100%",padding:14,background:"#626a4e",color:"#fff",border:0,fontSize:14,cursor:"pointer"}}>위치 정보 제공 동의</button>
        <button onClick={declineLocation} style={{width:"100%",padding:13,marginTop:9,background:"transparent",color:"#4f5149",border:"1px solid #c9c6bb",fontSize:13,cursor:"pointer"}}>동의하지 않음</button>
        {locationMessage && <p role="status" style={{fontSize:12,lineHeight:1.6,margin:"12px 0 0",color:"#8a4a3d"}}>{locationMessage}</p>}
      </div>
    </div>
  );
}
