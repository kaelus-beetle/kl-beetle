export default function CountryBlockedPage() {
  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#171914",color:"#f8f6f0",textAlign:"center"}}>
      <div style={{width:"min(100%,460px)"}}>
        <p style={{fontSize:11,letterSpacing:3,color:"#a5ad91",margin:"0 0 14px"}}>KL BEETLE / ACCESS DENIED</p>
        <h1 style={{fontSize:26,fontWeight:500,margin:"0 0 16px"}}>해외 접속 제한 안내</h1>
        <p style={{fontSize:14,lineHeight:1.9,color:"#d4d5cd",margin:0}}>KL BEETLE은 대한민국에서만 이용할 수 있습니다. 위치 정보 제공에 동의하지 않아 접속이 제한되었습니다.</p>
      </div>
    </main>
  );
}
