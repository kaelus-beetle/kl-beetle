"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [gpsPosition, setGpsPosition] = useState<{latitude:number;longitude:number;accuracy:number}|null>(null);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    try {
      const consent = localStorage.getItem("klb_gps_consent");
      if (consent === "granted") {
        const saved = localStorage.getItem("klb_gps_position");
        if (saved) setGpsPosition(JSON.parse(saved));
      } else if (consent !== "declined") {
        setShowLocationPrompt(true);
      }
    } catch {}
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
    setShowLocationPrompt(false);
  }

  function acceptLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("이 기기 또는 브라우저에서는 위치 확인을 지원하지 않아.");
      return;
    }
    setLocationMessage("브라우저의 위치 권한 요청을 기다리는 중이야.");
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
      (error) => {
        setLocationMessage(error.code === error.PERMISSION_DENIED
          ? "브라우저에서 위치 권한이 차단되어 있어. 브라우저 설정에서 위치 권한을 허용해야 확인할 수 있어."
          : "현재 위치를 확인하지 못했어. 기기의 위치 설정을 확인해 줘.");
        try { localStorage.setItem("klb_gps_consent", "declined"); } catch {}
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  if (!showLocationPrompt) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="klb-location-title" style={{position:"fixed",inset:0,zIndex:10000,background:"rgba(0,0,0,.62)",display:"grid",placeItems:"center",padding:20}}>
      <div style={{width:"min(100%,430px)",background:"#f8f6f0",color:"#252820",padding:"28px 24px",boxShadow:"0 18px 60px rgba(0,0,0,.28)"}}>
        <p style={{fontSize:11,letterSpacing:3,color:"#747b62",margin:"0 0 12px"}}>KL BEETLE / LOCATION</p>
        <h2 id="klb-location-title" style={{fontSize:22,fontWeight:500,margin:"0 0 14px"}}>정확한 방문 지역 확인</h2>
        <p style={{fontSize:14,lineHeight:1.8,margin:"0 0 22px"}}>KL BEETLE은 한국 내 접속 환경 확인을 위해 위치 정보 제공을 요청합니다.</p>
        <button onClick={acceptLocation} style={{width:"100%",padding:14,background:"#626a4e",color:"#fff",border:0,fontSize:14,cursor:"pointer"}}>위치 정보 제공 동의</button>
        <button onClick={declineLocation} style={{width:"100%",padding:13,marginTop:9,background:"transparent",color:"#4f5149",border:"1px solid #c9c6bb",fontSize:13,cursor:"pointer"}}>동의하지 않음</button>
        {locationMessage&&<p role="status" style={{fontSize:12,lineHeight:1.6,margin:"12px 0 0",color:"#8a4a3d"}}>{locationMessage}</p>}
      </div>
    </div>
  );
}
