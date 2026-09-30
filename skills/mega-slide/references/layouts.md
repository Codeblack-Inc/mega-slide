# 레이아웃

슬라이드마다 `layout`을 고르고 필드를 채운다. 무대는 1920×1080(16:9). 본문 슬라이드(`content`·`cols`·`figure`·`split`)에는 위쪽 작은 머리글(좌: 발표 제목, 우: 직전 `section`의 제목)과 쪽 번호가 자동으로 붙는다.

## 덱 필드

| 필드 | 설명 |
|---|---|
| `title` | 발표 제목 (필수). 표지·머리글에 쓰인다 |
| `subtitle` `author` `event` | 표지에 쓰인다 (선택) |
| `slides` | 슬라이드 배열 (필수) |

## 레이아웃

| layout | 필드 | 쓰임 |
|---|---|---|
| `cover` | (덱 필드를 그대로 씀, 슬라이드에서 덮어쓸 수 있음) | 표지. 파스텔 원 + 제목 |
| `section` | `title` `text`(선택, 예: "01") | 장 구분. 모서리 괄호 + 가운데 제목. 이후 슬라이드의 머리글 섹션명이 된다 |
| `content` | `title` `body` | 주제 제목 + 불릿·문단 |
| `statement` | `text` `note`(선택) | 한 문장. `\n`으로 줄바꿈 |
| `cols` | `title` `cols`: `[{title, body}]` (2~3칸) | 카드 2~3장 나란히 |
| `figure` | `title` `image` `caption`(선택) `alt`(선택) | 그림 한 장 (mega-diagram SVG 등) |
| `split` | `title` `body` `image` `caption`(선택) | 왼쪽 글, 오른쪽 그림 |
| `closing` | `title`(기본 "감사합니다") `body`(줄 배열) | 마무리. 표지와 같은 원 |

## 글 쓰는 법

- `body`는 줄 배열. `"- "`로 시작하면 불릿, 앞에 공백을 두면 2단계(`"  - "`), 그 외는 문단.
- 어디서나 `**강조**`(보라색 볼드)와 `` `코드` ``를 쓸 수 있다. HTML은 이스케이프된다.
- `image`는 `deck.json` 기준 상대 경로. png·jpg·webp·gif·svg를 HTML에 내장한다. SVG는 `<img>`로 들어가므로 웹 폰트가 적용되지 않는다 — 글자는 시스템 서체로 그려진다(mega-diagram처럼 글자가 윤곽선인 SVG면 무관).

## 새 레이아웃 추가

`scripts/slide.mjs`의 `LAYOUTS`에 `(slide, ctx) => 안쪽 HTML` 함수를 추가하고 → `assets/slide.css`에 스타일 → 이 표에 한 줄 → `examples/sample.json`에 한 장 (테스트가 모든 레이아웃이 샘플에 쓰였는지 검사한다).
