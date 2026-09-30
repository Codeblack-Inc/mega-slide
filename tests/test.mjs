// node tests/test.mjs — HTML 렌더 검사 (Chrome 없이 돈다)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { render, LAYOUTS } from "../skills/mega-slide/scripts/slide.mjs";

const dir = new URL("../skills/mega-slide/examples/", import.meta.url).pathname;
const sample = JSON.parse(readFileSync(dir + "sample.json", "utf8"));
const html = render(sample, dir);

assert.equal((html.match(/<section class="slide /g) ?? []).length, sample.slides.length, "슬라이드 수");
for (const name of Object.keys(LAYOUTS)) assert(sample.slides.some((s) => s.layout === name), `샘플이 ${name} 레이아웃을 안 쓴다`);
assert(html.includes("<span>왜 작은 도구인가</span>"), "머리글 우측에 현재 섹션명");
assert(html.includes("<strong>이유가 분명하다</strong>"), "**강조**");

const evil = render({ title: "<img src=x onerror=alert(1)>", slides: [{ layout: "cover" }] });
assert(!evil.includes("<img src=x"), "제목은 이스케이프된다");

assert.throws(() => render({ title: "t", slides: [{ layout: "nope" }] }), /모르는 layout/);
assert.throws(() => render({ title: "t", slides: [{ layout: "content", title: "제목만" }] }), /"body"가 필요/);
assert.throws(() => render({ title: "t", slides: [{ layout: "cols", title: "x", cols: [{ title: "하나", body: [] }] }] }), /2~3개/);

console.log("ok");
