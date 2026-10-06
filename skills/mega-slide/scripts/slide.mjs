#!/usr/bin/env node
// deck.json → 단일 HTML(키보드로 넘김) → Chrome으로 PDF · PNG · PPTX.  의존성 없음 (Node 18+, Chrome)
//   node slide.mjs build deck.json [-o out/deck.html] [--pdf] [--png] [--pptx [--font "서체"]]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, extname, basename, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { pptx } from "./pptx.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(join(HERE, "../assets/slide.css"), "utf8");
const EXTRACT = readFileSync(join(HERE, "../assets/extract.js"), "utf8");   // ?pptx 로 열 때만 동작: 슬라이드 레이아웃을 재서 JSON으로 남긴다
const FONTS = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Noto+Sans+KR:wght@200;300;400;500;700&family=Space+Grotesk:wght@500&display=swap";

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
// 이스케이프한 뒤 **강조**(굵게) · `코드` · 줄바꿈만 살린다
const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
const plain = (t) => String(t ?? "").replace(/\*\*/g, "").replace(/\n/g, " ");

// ── 글자 크기: 글자 수에 맞춰 정한다 ──────────────────────────────────────────────
// K = 크기 배율. 시안 8(회색, 70%)과 9(가는 선, 55%)을 합쳐 60%로 정했다. 키우거나 줄이려면 이 값 하나만 고친다.
const K = 0.6;
const px = (n) => Math.round(n * K);
// wlen = 글자 폭의 합(em). 한글은 1em에서 자간(-.06em)을 뺀 0.94em, 그 밖은 0.6em, 공백은 0.3em으로 근사한다.
// ponytail: 폰트 실측이 아니라 근사 — 큰 오차가 나는 글은 PNG로 보고 max/min을 조정한다
const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힯一-鿿]/;
export const wlen = (t) => [...String(t ?? "").replace(/\*\*|`/g, "")].reduce((n, c) => n + (HANGUL.test(c) ? 0.94 : c === " " ? 0.3 : 0.6), 0);
// 줄바꿈("\n")이 있으면 가장 긴 줄이 한 줄에 들어가게, 없으면 wrap줄까지 감아 쓴다고 보고 크기를 정한다
export function fit(text, { max, min, width = 1728, wrap = 1 }, c, what) {
  const lines = String(text).split("\n");
  const longest = Math.max(...lines.map(wlen), 1);
  const raw = Math.floor((lines.length > 1 ? width : width * wrap * 0.9) / longest);
  if (raw < min) c?.w(`${what}이(가) 너무 길다 — 줄이거나 줄바꿈("\\n")을 넣는다`);
  return Math.max(min, Math.min(max, raw));
}

// 본문 줄: 최상위 줄이 많을수록, 긴 줄이 있을수록 작게
function listSize(lines, width = 1728) {
  const items = lines.filter((l) => !/^\s+- /.test(l)).length;
  const base = px(items <= 3 ? 74 : items === 4 ? 64 : items === 5 ? 56 : 48);
  const longest = Math.max(...lines.map((l) => wlen(l.replace(/^\s*- /, ""))), 1);
  return Math.max(28, Math.min(base, Math.floor((width * 0.95) / longest)));
}

// 줄 배열: "- "로 시작하면 불릿, 앞에 공백이 있으면 2단계(작고 연하게)
function body(lines = [], c, width, css = true) {
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
  const top = lines.filter((l) => !/^\s+- /.test(l)).length;
  if (top > 6) c.w(`본문 줄이 ${top}개다 — 6개 이하로 줄이거나 장을 나눈다`);
  return `<div class="tx"${css ? ` style="--li:${listSize(lines, width)}px"` : ""}>${out}${list ? "</ul>" : ""}</div>`;
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
const head = (s, c) => `<h2 style="font-size:${fit(s.title, { max: px(160), min: px(88), wrap: 2 }, c, "제목")}px">${inline(s.title)}</h2>`;
const small = (s) => `<h2>${inline(s.title)}</h2>`;
// 표지·마무리 공통: 첫 줄은 Black, 나머지 줄은 ExtraLight
function big(title, max, c) {
  const [first, ...rest] = String(title).split("\n");
  if (rest.length > 2) c.w("표지·마무리 제목은 3줄까지");
  return `<h1 style="font-size:${fit(title, { max, min: px(96), width: 1752 }, c, "제목")}px">${inline(first)}${rest.map((r) => `<span>${inline(r)}</span>`).join("")}</h1>`;
}
const top = (d) => `${d.event ? `<div class="ev">${esc(d.event)}</div>` : ""}${d.author ? `<div class="au">${esc(d.author)}</div>` : ""}`;

// 레이아웃 = (slide, ctx) → 슬라이드 안쪽 HTML.  새 레이아웃은 여기에 추가하고 references/layouts.md에 적는다
export const LAYOUTS = {
  cover(s, c) {
    const d = { ...c.deck, ...s };
    return top(d) + big(d.title, px(252), c) + (d.subtitle ? `<div class="sub">${inline(d.subtitle)}</div>` : "");
  },
  section(s, c) {
    need(s, "title");
    const no = String(s.no ?? ++c.sec.n);
    return `<div class="no${no.length > 1 ? " long" : ""}">${esc(no)}</div>` +
      `<h1 style="font-size:${fit(s.title, { max: px(160), min: px(72) }, c, "제목")}px">${inline(s.title)}</h1>${s.text ? `<p>${inline(s.text)}</p>` : ""}`;
  },
  content(s, c) {
    need(s, "title", "body");
    return page(c, head(s, c) + body(s.body, c));
  },
  statement(s, c) {
    need(s, "text");
    return `<p style="font-size:${fit(s.text, { max: px(200), min: px(100), wrap: 3 }, c, "문장")}px">${inline(s.text)}</p>${s.note ? `<div class="note">${inline(s.note)}</div>` : ""}`;
  },
  number(s, c) {
    need(s, "value", "label");
    const fs = fit(s.value, { max: px(560), min: px(200) }, c, "숫자");
    return page(c, `<div class="lab">${inline(s.label)}</div><div><span class="val" style="font-size:${fs}px">${inline(s.value)}</span>${s.note ? `<div class="note">${inline(s.note)}</div>` : ""}</div>`);
  },
  cols(s, c) {
    need(s, "title", "cols");
    const n = s.cols.length;
    if (n < 2 || n > 3) throw new Error(`slide ${s._n} (cols): 칸은 2~3개`);
    const w = (1728 - 64 * (n - 1)) / n;
    const fs = Math.min(...s.cols.map((k) => fit(k.title, { max: px(100), min: px(56), width: w }, c, "칸 제목")));
    s.cols.forEach((k) => { if ((k.body ?? []).length > 4) c.w(`칸 본문이 ${k.body.length}줄이다 — 4줄 이하로`); });
    const cards = s.cols.map((k) => `<div class="card"><h3 style="font-size:${fs}px">${inline(k.title)}</h3>${body(k.body, c, w, false)}</div>`).join("");
    return page(c, small(s) + `<div class="g" style="--n:${n}">${cards}</div>`);
  },
  figure(s, c) {
    need(s, "title", "image");
    return page(c, small(s) + `<div class="fig">${img(s.image, c.base, s.alt ?? s.title)}${cap(s)}</div>`);
  },
  split(s, c) {
    need(s, "title", "body", "image");
    return page(c, small(s) + `<div class="g">${body(s.body, c, 816)}<div class="fig">${img(s.image, c.base, s.alt ?? s.title)}${cap(s)}</div></div>`);
  },
  closing(s, c) {
    const d = { ...c.deck, title: "감사합니다", ...s };
    return top(d) + big(d.title, px(250), c) + ((s.body ?? []).length ? `<div class="sub">${s.body.map((l) => `<div>${inline(l)}</div>`).join("")}</div>` : "");
  },
};
const CLASS = { closing: "cover closing", cols: "cols small", figure: "figure small", split: "split small" };

// warnings: 넘칠 것 같은 슬라이드를 문자열로 모은다
export function render(deck, base = ".", warnings = []) {
  if (!deck?.title || !Array.isArray(deck.slides) || !deck.slides.length) throw new Error("deck.title과 slides가 필요하다");
  let section = "";
  const total = deck.slides.length, sec = { n: 0 };
  const slides = deck.slides.map((s, i) => {
    const layout = LAYOUTS[s.layout];
    if (!layout) throw new Error(`slide ${i + 1}: 모르는 layout "${s.layout}" (${Object.keys(LAYOUTS).join(" · ")})`);
    if (s.layout === "section") section = plain(s.title);
    const c = { deck, base, section, sec, n: i + 1, total, w: (m) => warnings.push(`slide ${i + 1} (${s.layout}): ${m}`) };
    return `<section class="slide ${CLASS[s.layout] ?? s.layout}">${layout({ ...s, _n: i + 1 }, c)}</section>`;
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
<script>${EXTRACT}</script>
</body></html>
`;
}

export function findChrome() {
  const found = [process.env.CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium"].filter(Boolean).find(existsSync);
  if (found) return found;
  for (const n of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) if (spawnSync("which", [n]).status === 0) return n;
  return null;
}
function chrome() {
  const c = findChrome();
  if (!c) throw new Error("Chrome을 찾지 못했다. CHROME 환경변수에 실행 파일 경로를 지정한다");
  return c;
}

// 웹 폰트를 받을 시간을 주고(virtual-time-budget) 실행한다
function headless(out, ...args) {
  spawnSync(chrome(), ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=15000", ...args], { stdio: "ignore" });
  if (!existsSync(out)) throw new Error(`Chrome이 ${out}을(를) 만들지 못했다`);
  return out;
}

// ?pptx 로 연 페이지가 남긴 레이아웃 JSON을 읽는다 (--dump-dom: 렌더가 끝난 DOM을 stdout으로)
export function measure(url) {
  const r = spawnSync(chrome(), ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=15000", "--window-size=1920,1080", "--dump-dom", `${url}?pptx`], { maxBuffer: 1 << 30 });
  const m = /<script type="application\/json" id="pptx-layout">([\s\S]*?)<\/script>/.exec(r.stdout.toString("utf8"));
  if (!m) throw new Error("슬라이드 레이아웃을 읽지 못했다 (Chrome을 확인한다)");
  return JSON.parse(m[1]);
}

function main([cmd, input, ...rest]) {
  if (cmd !== "build" || !input) {
    console.error('사용: node slide.mjs build deck.json [-o out/deck.html] [--pdf] [--png] [--pptx [--font "서체"]]');
    process.exit(1);
  }
  const at = rest.indexOf("-o");
  const out = resolve(at >= 0 ? rest[at + 1] : join("out", basename(input, extname(input)) + ".html"));
  mkdirSync(dirname(out), { recursive: true });
  const deck = JSON.parse(readFileSync(input, "utf8")), warnings = [];
  writeFileSync(out, render(deck, dirname(resolve(input)), warnings));
  console.log(out);
  warnings.forEach((w) => console.error(`경고: ${w}`));
  const url = pathToFileURL(out).href, stem = out.replace(/\.html$/, "");
  if (rest.includes("--pdf")) console.log(headless(`${stem}.pdf`, "--no-pdf-header-footer", `--print-to-pdf=${stem}.pdf`, url));
  if (rest.includes("--pptx")) {
    const fi = rest.indexOf("--font"), font = fi >= 0 ? rest[fi + 1] : "";
    writeFileSync(`${stem}.pptx`, pptx(measure(url), plain(deck.title), font));
    console.log(`${stem}.pptx`);
    if (!font) console.error("안내: PPTX는 Noto Sans KR·Space Grotesk 서체를 씁니다. 설치돼 있지 않으면 다른 서체로 보입니다 (--font \"서체\"로 바꿀 수 있다)");
  }
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
