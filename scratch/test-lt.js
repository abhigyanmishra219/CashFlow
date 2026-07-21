async function testLocaltunnelFetch() {
  const url = "https://tasty-seals-tell.loca.lt/api/receipts/REC-2026-00014/pdf";
  const res = await fetch(url);
  console.log("Status:", res.status);
  console.log("Content-Type:", res.headers.get("content-type"));
  const text = await res.text();
  console.log("Response Preview:", text.slice(0, 300));
}
testLocaltunnelFetch().catch(console.error);
