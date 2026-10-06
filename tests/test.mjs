// node tests/test.mjs — HTML 렌더 검사 (Chrome 없이 돈다)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render, fit, LAYOUTS } from "../skills/mega-slide/scripts/slide.mjs";

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

console.log("ok");
