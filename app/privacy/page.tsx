export default function PrivacyPage() {
  return <main style={{maxWidth:860,margin:"0 auto",padding:"90px 24px 110px",color:"#292b25",lineHeight:1.9}}>
    <p style={{fontSize:11,letterSpacing:3,color:"#737b61"}}>KL BEETLE / PRIVACY</p>
    <h1 style={{fontSize:32,fontWeight:500,margin:"12px 0 28px"}}>개인정보 및 방문 기록 안내</h1>
    <p>KL BEETLE은 사이트 운영, 보안, 이용 통계 확인을 위해 방문 과정에서 브라우저와 접속 환경이 자동으로 제공하는 일부 정보를 기록합니다.</p>
    <h2 style={{fontSize:19,fontWeight:500,marginTop:32}}>수집하는 정보</h2>
    <ul>
      <li>접속 IP 주소와 IP 기반 국가·지역 정보</li>
      <li>접속 일시, 방문 페이지, 페이지 조회 기록</li>
      <li>기기 종류, 운영체제, 브라우저 종류</li>
      <li>브라우저가 제공하는 유입 출처 주소(제공되는 경우), 언어 및 시간대</li>
      <li>브라우저 식별용 무작위 방문 ID 및 재방문 여부</li>
      <li>페이지 체류 시간(페이지를 떠날 때 브라우저가 전송하는 값)</li>
    </ul>
    <h2 style={{fontSize:19,fontWeight:500,marginTop:32}}>수집 목적</h2>
    <p>사이트 보안 및 오류 대응, 방문·페이지 이용 통계 분석, 서비스 개선을 위해 사용합니다. 방문 ID는 브라우저 쿠키에 저장되며 브라우저 쿠키를 삭제하거나 다른 브라우저를 사용하면 방문자 구분이 달라질 수 있습니다.</p>
    <h2 style={{fontSize:19,fontWeight:500,marginTop:32}}>위치 정보</h2>
    <p>정확한 GPS 위치는 SHOP에서 별도 안내 후 이용자가 위치 정보 제공에 동의하고 브라우저 권한을 허용한 경우에만 수집합니다. GPS 제공에 동의하지 않아도 HOME 및 ABOUT은 이용할 수 있습니다.</p>
    <h2 style={{fontSize:19,fontWeight:500,marginTop:32}}>보관 및 문의</h2>
    <p>방문 기록은 사이트 운영 및 보안 목적에 필요한 기간 동안 보관하며, 목적 달성 후 삭제합니다. 관련 법령에 따라 별도 보관이 필요한 경우에는 해당 법령에서 정한 기간을 따릅니다. 개인정보 처리와 관련한 문의는 KL BEETLE 카카오톡 오픈채팅으로 연락해 주세요.</p>
    <p style={{marginTop:32}}><a href="https://open.kakao.com/o/sunFEYTi" target="_blank" rel="noreferrer" style={{color:"#596447",textDecoration:"underline"}}>KL BEETLE 문의하기 ↗</a></p>
    <p style={{fontSize:12,color:"#777",marginTop:36}}>본 안내는 현재 사이트에서 운영하는 방문 기록 기능을 설명합니다. 법적 적합성 검토를 대체하지 않으며, 실제 운영 주체·보관 기간 등 세부 사항은 운영자가 확인하고 확정해야 합니다.</p>
  </main>;
}
