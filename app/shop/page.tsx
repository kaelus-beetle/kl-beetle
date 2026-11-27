import { supabase, configured } from "../../lib/supabase";

type Product = {
  id: number;
  title: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
  category: string | null;
  is_sold: boolean;
};

export const dynamic = "force-dynamic";

export default async function Shop() {
  let items: Product[] = [];
  let errorMessage = "";

  if (configured) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) errorMessage = error.message;
    else items = (data || []) as Product[];
  }

  return (
    <main className="subPage">
      <section className="pageIntro">
        <p className="eyebrow">KL BEETLE COLLECTION</p>
        <h1>SHOP</h1>
        <p>Available specimens and breeding updates.</p>
      </section>

      {!configured ? (
        <p className="notice">Supabase 연결 설정이 필요합니다. 관리자 안내서의 환경변수 단계를 완료해 주세요.</p>
      ) : errorMessage ? (
        <p className="notice">상품을 불러오지 못했습니다: {errorMessage}</p>
      ) : items.length === 0 ? (
        <p className="notice">현재 등록된 판매글이 없습니다.</p>
      ) : (
        <section
          aria-label="판매 상품 목록"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "28px",
            padding: "60px 8vw 110px",
            alignItems: "start",
          }}
        >
          {items.map((p) => (
            <article
              key={p.id}
              style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                background: "#f2efe8",
                border: "1px solid #d5d0c5",
                color: "#292d25",
              }}
            >
              <div
                style={{
                  height: "280px",
                  width: "100%",
                  position: "relative",
                  background: "#d6d1c4",
                }}
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ display: "grid", placeItems: "center", height: "100%" }}>KL BEETLE</div>
                )}
                {p.is_sold && (
                  <b style={{ position: "absolute", top: "15px", right: "15px", background: "#34392d", color: "#fff", padding: "8px 12px", fontSize: "9px" }}>
                    SOLD OUT
                  </b>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  position: "relative",
                  zIndex: 2,
                  width: "100%",
                  minHeight: "180px",
                  padding: "22px",
                  background: "#f2efe8",
                  color: "#292d25",
                  visibility: "visible",
                  opacity: 1,
                }}
              >
                <span style={{ display: "block", color: "#626a4e", fontSize: "10px", letterSpacing: "0.18em" }}>
                  {p.category || "COLLECTION"}
                </span>
                <h2 style={{ display: "block", margin: 0, color: "#292d25", fontSize: "22px", fontWeight: 400 }}>
                  {p.title}
                </h2>
                {p.description && (
                  <p style={{ display: "block", margin: 0, color: "#77786c", fontSize: "12px", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                    {p.description}
                  </p>
                )}
                {p.price && (
                  <strong style={{ display: "block", color: "#292d25", fontSize: "14px" }}>
                    {p.price}
                  </strong>
                )}
                <a
                  href="https://open.kakao.com/o/sunFEYTi"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-block", width: "fit-content", color: "#292d25", fontSize: "11px", borderBottom: "1px solid #626a4e", paddingBottom: "5px" }}
                >
                  카카오톡으로 문의하기 ↗
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
