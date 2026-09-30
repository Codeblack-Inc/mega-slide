#!/usr/bin/env node
// deck.json → 단일 HTML(키보드로 넘김) → Chrome으로 PDF · PNG.  의존성 없음 (Node 18+, Chrome)
//   node slide.mjs build deck.json [-o out/deck.html] [--pdf] [--png]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, extname, basename, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(join(HERE, "../assets/slide.css"), "utf8");
const FONTS = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Noto+Sans+KR:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap";

const JS = `
const S = [...document.querySelectorAll(".slide")], bar = document.getElementById("bar");
let i = 0;
const fit = () => document.documentElement.style.setProperty("--s", Math.min(innerWidth / 1920, innerHeight / 1080));
const go = (n) => {
  i = Math.max(0, Math.min(S.length - 1, n));
  S.forEach((s, k) => s.classList.toggle("active", k === i));
  bar.style.width = ((i + 1) / S.length) * 100 + "%";
  try { history.replaceState(null, "", "#" + (i + 1)); } catch {}
};
if (location.search.includes("shot")) document.body.classList.add("shot");
addEventListener("resize", fit); fit();
addEventListener("keydown", (e) => {
  if ([" ", "Enter", "ArrowRight", "ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); go(i + 1); }
  else if (["Backspace", "ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); go(i - 1); }
  else if (e.key === "Home") go(0);
  else if (e.key === "End") go(S.length - 1);
  else if (e.key === "f") document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
});
addEventListener("click", (e) => go(e.clientX > innerWidth / 2 ? i + 1 : i - 1));
go((parseInt(location.hash.slice(1)) || 1) - 1);
`;

const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// 이스케이프한 뒤 **강조** · `코드`만 살린다
const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
const plain = (t) => String(t ?? "").replace(/\*\*/g, "");

// 줄 배열: "- "로 시작하면 불릿, 앞에 공백이 있으면 2단계
function body(lines = []) {
  let out = "", list = false;
  for (const line of lines) {
    const m = /^(\s*)- (.*)$/.exec(line);
    if (m) {
      if (!list) { out += "<ul>"; list = true; }
      out += `<li${m[1] ? ' class="sub"' : ""}>${inline(m[2])}</li>`;
    } else {
      if (list) { out += "</ul>"; list = false; }
      out += `<p>${inline(line)}</p>`;
    }
  }
  return `<div class="tx">${out}${list ? "</ul>" : ""}</div>`;
}

const MIME = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };
function img(src, base, alt = "") {
  const file = resolve(base, src), mime = MIME[extname(file).toLowerCase()];
  if (!mime) throw new Error(`지원하지 않는 이미지 형식: ${src}`);
  if (!existsSync(file)) throw new Error(`이미지가 없다: ${src}`);
  return `<img src="data:${mime};base64,${readFileSync(file).toString("base64")}" alt="${esc(alt)}">`;
}

const need = (s, ...keys) => keys.forEach((k) => { if (!s[k]) throw new Error(`slide ${s._n} (${s.layout}): "${k}"가 필요하다`); });
const cap = (s) => (s.caption ? `<div class="cap">${inline(s.caption)}</div>` : "");
const page = (c, inner) =>
  `<header class="hd"><span>${esc(plain(c.deck.title))}</span><span>${esc(c.section)}</span></header>` +
  `<div class="pad">${inner}</div><div class="pg">${c.n} / ${c.total}</div>`;
const title = (s) => `<h2>${inline(s.title)}</h2>`;
const circles = '<i class="c c1"></i><i class="c c2"></i><i class="c c3"></i>';

// 레이아웃 = (slide, ctx) → 슬라이드 안쪽 HTML.  새 레이아웃은 여기에 추가하고 references/layouts.md에 적는다
export const LAYOUTS = {
  cover(s, c) {
    const d = { ...c.deck, ...s };
    return circles + `<div class="in">${d.event ? `<div class="ev">${esc(d.event)}</div>` : ""}<h1>${inline(d.title)}</h1>` +
      `${d.subtitle ? `<div class="sub">${inline(d.subtitle)}</div>` : ""}${d.author ? `<div class="au">${esc(d.author)}</div>` : ""}</div>`;
  },
  section(s) {
    need(s, "title");
    return `<div class="in"><h1>${inline(s.title)}</h1>${s.text ? `<p>${inline(s.text)}</p>` : ""}</div>`;
  },
  content(s, c) {
    need(s, "title", "body");
    return page(c, title(s) + body(s.body));
  },
  statement(s) {
    need(s, "text");
    return `<div class="in"><p>${inline(s.text)}</p>${s.note ? `<div class="note">${inline(s.note)}</div>` : ""}</div>`;
  },
  cols(s, c) {
    need(s, "title", "cols");
    if (s.cols.length < 2 || s.cols.length > 3) throw new Error(`slide ${s._n} (cols): 칸은 2~3개`);
    const cards = s.cols.map((k) => `<div class="card"><h3>${inline(k.title)}</h3>${body(k.body)}</div>`).join("");
    return page(c, title(s) + `<div class="g" style="--n:${s.cols.length}">${cards}</div>`);
  },
  figure(s, c) {
    need(s, "title", "image");
    return page(c, title(s) + `<div class="fig">${img(s.image, c.base, s.alt ?? s.title)}${cap(s)}</div>`);
  },
  split(s, c) {
    need(s, "title", "body", "image");
    return page(c, title(s) + `<div class="g">${body(s.body)}<div class="fig">${img(s.image, c.base, s.alt ?? s.title)}${cap(s)}</div></div>`);
  },
  closing(s, c) {
    const d = { title: "감사합니다", ...s };
    return circles + `<div class="in"><h1>${inline(d.title)}</h1>${(d.body ?? []).map((l) => `<div class="sub">${inline(l)}</div>`).join("")}</div>`;
  },
};

export function render(deck, base = ".") {
  if (!deck?.title || !Array.isArray(deck.slides) || !deck.slides.length) throw new Error("deck.title과 slides가 필요하다");
  let section = "";
  const total = deck.slides.length;
  const slides = deck.slides.map((s, i) => {
    const layout = LAYOUTS[s.layout];
    if (!layout) throw new Error(`slide ${i + 1}: 모르는 layout "${s.layout}" (${Object.keys(LAYOUTS).join(" · ")})`);
    if (s.layout === "section") section = plain(s.title);
    const html = layout({ ...s, _n: i + 1 }, { deck, base, section, n: i + 1, total });
    return `<section class="slide ${s.layout === "closing" ? "cover closing" : s.layout}">${html}</section>`;
  });
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(plain(deck.title))}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>${CSS}</style></head>
<body>
${slides.join("\n")}
<div id="bar"></div>
<script>${JS}</script>
</body></html>
`;
}

function chrome() {
  const found = [process.env.CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium"].filter(Boolean).find(existsSync);
  if (found) return found;
  for (const n of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) if (spawnSync("which", [n]).status === 0) return n;
  throw new Error("Chrome을 찾지 못했다. CHROME 환경변수에 실행 파일 경로를 지정한다");
}

// 웹 폰트를 받을 시간을 주고(virtual-time-budget) 실행한다
function headless(out, ...args) {
  spawnSync(chrome(), ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=15000", ...args], { stdio: "ignore" });
  if (!existsSync(out)) throw new Error(`Chrome이 ${out}을(를) 만들지 못했다`);
  return out;
}

function main([cmd, input, ...rest]) {
  if (cmd !== "build" || !input) {
    console.error("사용: node slide.mjs build deck.json [-o out/deck.html] [--pdf] [--png]");
    process.exit(1);
  }
  const at = rest.indexOf("-o");
  const out = resolve(at >= 0 ? rest[at + 1] : join("out", basename(input, extname(input)) + ".html"));
  mkdirSync(dirname(out), { recursive: true });
  const deck = JSON.parse(readFileSync(input, "utf8"));
  writeFileSync(out, render(deck, dirname(resolve(input))));
  console.log(out);
  const url = pathToFileURL(out).href, stem = out.replace(/\.html$/, "");
  if (rest.includes("--pdf")) console.log(headless(`${stem}.pdf`, "--no-pdf-header-footer", `--print-to-pdf=${stem}.pdf`, url));
  if (rest.includes("--png")) {
    mkdirSync(`${stem}-png`, { recursive: true });
    for (let k = 1; k <= deck.slides.length; k++) {
      const png = `${stem}-png/${String(k).padStart(2, "0")}.png`;
      console.log(headless(png, "--window-size=1920,1080", `--screenshot=${png}`, `${url}?shot#${k}`));
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(1); }
}
