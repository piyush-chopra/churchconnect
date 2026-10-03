import { readdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const base = process.env.VITE_BASE_PATH || "/";
if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base))
  throw new Error("VITE_BASE_PATH must be a slash-delimited repository path");
const manifest = JSON.parse(
  readFileSync("public/manifest.webmanifest", "utf8"),
);
manifest.id = base;
manifest.scope = base;
manifest.start_url = base + "#discover";
manifest.icons = manifest.icons.map((icon) => ({
  ...icon,
  src: base + icon.src.split("/").pop(),
}));
writeFileSync("dist/manifest.webmanifest", JSON.stringify(manifest, null, 2));
writeFileSync("dist/.nojekyll", "");
const assets = readdirSync("dist/assets").map(
  (name) => base + "assets/" + name,
);
const hash = createHash("sha256")
  .update(readFileSync("dist/index.html"))
  .digest("hex")
  .slice(0, 12);
// Scope cache cleanup to this installation, including on a shared github.io origin.
const prefix =
  "churchconnect-" +
  createHash("sha256").update(base).digest("hex").slice(0, 8) +
  "-";
const precache = [
  base,
  ...[
    "index.html",
    "manifest.webmanifest",
    "icon-192.png",
    "icon-512.png",
    "icon.svg",
  ].map((name) => base + name),
  ...assets,
];
writeFileSync(
  "dist/sw.js",
  `const PREFIX=${JSON.stringify(prefix)};
const CACHE=PREFIX+${JSON.stringify(hash)};
const BASE=${JSON.stringify(base)};
const ASSETS=${JSON.stringify(precache)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(url.origin!==self.location.origin||e.request.method!=='GET'||!url.pathname.startsWith(BASE)||url.pathname.startsWith('/api/')||url.pathname.startsWith('/admin/'))return;
 if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match(BASE+'index.html')));return;}
 if(ASSETS.includes(url.pathname))e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));
});`,
);
console.log(
  "Generated scoped service worker with " +
    precache.length +
    " public static assets.",
);
