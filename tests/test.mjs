// node tests/test.mjs — HTML 렌더·PPTX 작성 검사. Chrome이 없으면 PPTX 종단 검사만 건너뛴다
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { inflateRawSync } from "node:zlib";
import { render, fit, LAYOUTS, measure, findChrome } from "../skills/mega-slide/scripts/slide.mjs";
import { pptx, crc32 } from "../skills/mega-slide/scripts/pptx.mjs";

const dir = new URL("../skills/mega-slide/examples/", import.meta.url).pathname;
const sample = JSON.parse(readFileSync(dir + "sample.json", "utf8"));
const warnings = [];
const html = render(sample, dir, warnings);

assert.equal((html.match(/<section class="slide /g) ?? []).length, sample.slides.length, "슬라이드 수");
for (const name of Object.keys(LAYOUTS)) assert(sample.slides.some((s) => s.layout === name), `샘플이 ${name} 레이아웃을 안 쓴다`);
assert.deepEqual(warnings, [], "예시 덱은 경고가 없어야 한다");
assert(html.includes("<span>왜 작은 도구인가</span>"), "머리글 우측에 현재 섹션명");
assert(html.includes("<strong>이유가 분명하다</strong>"), "**강조**");
assert(html.includes('<div class="no">1</div>') && html.includes('<div class="no">2</div>'), "장 번호는 자동으로 1, 2, …");
assert(/<h1 style="font-size:\d+px">감사합니다<\/h1>/.test(html), "마무리 기본 제목");
assert(/<h1 [^>]*>작은 도구를<span>오래 쓰는 법<\/span><\/h1>/.test(html), "표지: 첫 줄 Black, 나머지 줄 ExtraLight");

// 글자 크기는 글자 수에 맞춰 줄어든다
const size = (t, o) => fit(t, { min: 40, ...o });
assert(size("짧은 제목", { max: 160 }) === 160, "짧으면 최대 크기");
assert(size("아주아주아주아주아주아주 긴 제목입니다 정말로 그렇습니다", { max: 160 }) < 100, "길면 줄어든다");
assert(size("가\n나나나나나나나나나나나나", { max: 250, width: 1752 }) < size("가\n나나나", { max: 250, width: 1752 }), "줄바꿈이 있으면 가장 긴 줄 기준");

// 넘칠 만한 글은 경고한다
const w = [];
render({ title: "t", slides: [{ layout: "content", title: "제목", body: Array.from({ length: 8 }, (_, i) => `- 항목 ${i}`) }, { layout: "section", title: "아주 긴 장 제목이라서 한 줄에 도저히 들어가지 않는 경우를 가정한다 정말로 그렇게 길어서 최소 크기로도 넘치는 제목" }] }, ".", w);
assert.equal(w.length, 2, "본문 8줄 + 긴 장 제목 = 경고 2개");

// 보안·오류
const evil = render({ title: "<img src=x onerror=alert(1)>", slides: [{ layout: "cover" }] });
assert(!evil.includes("<img src=x"), "제목은 이스케이프된다");
assert.throws(() => render({ title: "t", slides: [{ layout: "nope" }] }), /모르는 layout/);
assert.throws(() => render({ title: "t", slides: [{ layout: "content", title: "제목만" }] }), /"body"가 필요/);
assert.throws(() => render({ title: "t", slides: [{ layout: "cols", title: "x", cols: [{ title: "하나", body: [] }] }] }), /2~3개/);

// ── PPTX ─────────────────────────────────────────────────────────────────────────
function unzip(buf) {                                          // 우리가 쓴 ZIP을 다시 읽어 CRC까지 확인한다
  const end = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06])), n = buf.readUInt16LE(end + 10);
  const out = {};
  for (let i = 0, p = buf.readUInt32LE(end + 16); i < n; i++) {
    const nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), lo = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nl), at = lo + 30 + buf.readUInt16LE(lo + 26) + buf.readUInt16LE(lo + 28);
    const data = inflateRawSync(buf.subarray(at, at + buf.readUInt32LE(p + 20)));
    assert.equal(crc32(data), buf.readUInt32LE(p + 16), `CRC: ${name}`);
    out[name] = data.toString("latin1") === data.toString("utf8") ? data.toString("utf8") : data;
    p += 46 + nl + xl + cl;
  }
  return out;
}
function wellFormed(xml, name) {                               // 태그 짝이 맞는지 (우리가 만든 XML 한정의 간이 검사)
  const stack = [];
  for (const m of xml.matchAll(/<(\/?)([\w:.-]+)[^>]*?(\/?)>/g)) {
    if (m[3]) continue;
    if (!m[1]) stack.push(m[2]);
    else assert.equal(stack.pop(), m[2], `태그 짝: ${name}`);
  }
  assert.equal(stack.length, 0, `닫히지 않은 태그: ${name}`);
}
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const fake = [{
  texts: [{ x: 96, y: 100, w: 400, lh: 60, ls: -2, lines: [[{ t: "가나다", fw: 700, fs: 44, color: "4A4760", ff: "Noto Sans KR" }], [{ t: "<b>&", fw: 200, fs: 44, color: "4A4760", ff: "Noto Sans KR" }]] }],
  lines: [{ x1: 96, x2: 1824, y: 52, w: 2, color: "9A97AE" }],
  images: [{ x: 0, y: 0, w: 10, h: 10, alt: "그림", png: PNG }],
}];
const files = unzip(pptx(fake, "제목"));
for (const need of ["[Content_Types].xml", "_rels/.rels", "ppt/presentation.xml", "ppt/slides/slide1.xml", "ppt/slides/_rels/slide1.xml.rels", "ppt/media/image1_1.png", "ppt/theme/theme1.xml"]) assert(need in files, `PPTX 부품: ${need}`);
for (const [name, data] of Object.entries(files)) if (typeof data === "string") wellFormed(data, name);
const slide = files["ppt/slides/slide1.xml"];
assert(slide.includes("&lt;b&gt;&amp;") && !slide.includes("<b>&"), "PPTX 글자는 이스케이프된다");
assert(slide.includes("<a:br>") && slide.includes('b="1"') && slide.includes("Noto Sans KR ExtraLight"), "줄바꿈 · 굵게 · 굵기별 서체");
assert(pptx(fake, "t", "Pretendard").toString("latin1").length > 0 && unzip(pptx(fake, "t", "Pretendard"))["ppt/slides/slide1.xml"].includes('typeface="Pretendard"'), "--font는 모든 글자에 적용된다");

// 종단: Chrome이 있으면 샘플 전체를 재서 PPTX로 만든다
if (findChrome()) {
  const tmp = mkdtempSync(join(tmpdir(), "mega-slide-"));
  writeFileSync(join(tmp, "deck.html"), html);
  const layout = measure(pathToFileURL(join(tmp, "deck.html")).href);
  assert.equal(layout.length, sample.slides.length, "측정한 슬라이드 수");
  const parts = unzip(pptx(layout, "샘플"));
  const all = Object.entries(parts).filter(([n]) => /^ppt\/slides\/slide\d+\.xml$/.test(n)).map(([, d]) => d).join("");
  for (const t of ["오래 쓰는 법", "10분", "감사합니다"]) assert(all.includes(t), `PPTX에 글이 있다: ${t}`);
  assert.equal((all.match(/<p:pic>/g) ?? []).length, 2, "그림 2장 (figure, split)");
  assert(all.includes("<p:cxnSp>"), "가는 선이 있다");
} else console.log("(Chrome 없음: PPTX 종단 검사는 건너뜀)");

console.log("ok");
