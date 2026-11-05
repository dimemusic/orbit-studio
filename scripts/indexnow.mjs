// IndexNow: tell Bing, Yandex, Naver, Seznam and Yep that pages are new or changed (they crawl them within hours
// instead of days). Google does NOT take part: for Google use the sitemap + «Request indexing» in Search Console.
//
//   npm run indexnow            send every URL of the live sitemap (run AFTER the deploy is live)
//   npm run indexnow -- --dry   only print what would be sent
//
// The key is public by design: https://<site>/<key>.txt must contain the key itself (it is in /public).
import { readdirSync, readFileSync } from "node:fs";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.maxartdigital.com";
const dry = process.argv.includes("--dry");
const keyFile = readdirSync("public").find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) throw new Error("no IndexNow key file in /public (32 hex chars + .txt)");
const key = keyFile.replace(".txt", "");
if (readFileSync(`public/${keyFile}`, "utf8").trim() !== key) throw new Error("the key file must contain exactly its own name");

const xml = await fetch(`${SITE}/sitemap.xml`)
  .then((r) => {
    if (!r.ok) throw new Error(`the sitemap answered ${r.status}`);
    return r.text();
  })
  .catch((e) => {
    console.error(`Cannot read ${SITE}/sitemap.xml (${e.cause?.code ?? e.message}). Is the site live and online?`);
    process.exit(1);
  });
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`${urlList.length} URLs from ${SITE}/sitemap.xml`);
if (dry) {
  console.log(urlList.join("\n"));
  process.exit(0);
}
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/${keyFile}`, urlList }),
});
// 200 = accepted, 202 = accepted, the key is verified first; 4xx = see the message
console.log(`IndexNow answered ${res.status} ${res.statusText}`);
if (res.status >= 400) process.exitCode = 1;
