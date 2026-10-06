# mega-slide

Claude Code + Codex 플러그인. 공용 스킬은 `skills/mega-slide/` 하나 — 두 호스트가 같은 파일을 쓴다.

- 엔진: `skills/mega-slide/scripts/slide.mjs`(+ PPTX용 `pptx.mjs`·`assets/extract.js`), 의존성 없음. `deck.json` → 단일 HTML(레이아웃별 HTML을 이어 붙이고 `assets/slide.css`·이미지를 내장) → Chrome 헤드리스로 PDF·PNG·PPTX
- 출력은 **웹(HTML)·PDF·PowerPoint(.pptx)**다 (처음엔 PPT를 뺐다가 요청으로 다시 넣었다). mega-ppt는 장당 300~600자의 보고서형 고밀도 장표(네이티브 표·차트·패널), mega-slide는 글이 적고 여백이 많은 발표용 슬라이드로 구분한다. mega-slide의 PPTX는 같은 디자인을 텍스트 상자·선·그림으로 옮길 뿐 표·차트 같은 PPT 고유 개체는 만들지 않는다
- 레이아웃 추가: `LAYOUTS`에 함수 → `assets/slide.css` → `references/layouts.md` → `examples/sample.json`에 한 장 (테스트가 모든 레이아웃이 샘플에 쓰였는지 검사)
- 테스트: `node tests/test.mjs` (HTML 렌더·PPTX 구조는 Chrome 없이, Chrome이 있으면 샘플 전체를 PPTX로 만드는 종단 검사까지)
- 시각 확인: `node skills/mega-slide/scripts/slide.mjs build skills/mega-slide/examples/sample.json -o /tmp/s/sample.html --pdf --png --pptx` → `/tmp/s/sample-png/NN.png`. 레이아웃·스타일을 바꿨으면 PNG를 직접 본다. 글이 긴 덱(긴 제목·본문 8줄·긴 칸 제목)으로도 한 번 돌려 넘침을 확인한다
- 버전 올릴 때 `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, SKILL.md `metadata.version` 함께 수정
- 예시 콘텐츠는 가상의 발표만 쓴다 (실제 고객·발표 자료 금지)

## 디자인: Type Poster — 회색 + 가는 선 (결정)

- 시안을 두 번 비교해 정했다: ① 10가지 방향(브랜드 심벌형, 리소 인쇄형, 관계도형, 에디터형 등) 중 **Type Poster**, ② 그 변형 10가지(크기·굵기·색·배경·구성) 중 **8번 회색 + 9번 가는 선**. 나머지는 버렸다. 처음 만든 "파스텔 원 + 보라 불릿"은 흔한 기본값이라 촌스럽다는 평가로, 이어서 Type Poster 첫 버전은 "색감과 글씨 크기가 과하다"는 평가로 폐기
- 장식 없이 글자의 크기와 굵기로 위계를 만든다: 제목 Bold 700, 표지 둘째 줄부터 ExtraLight 200, 본문 Regular 400, 보조 Light 300. 가는 선(2px·1.5px)으로 머리글·항목·칸을 나눈다. **강조색을 두지 않는다** — 강조는 굵기(`**굵게**`)뿐이다
- 크기는 한 군데에서 정한다: `slide.mjs`의 `K = 0.6`(8번 70%와 9번 55%의 중간). 인라인으로 정하는 크기(`fit`·`listSize`)는 모두 `px()`를 거치고, 고정 크기(머리글 26px 등)는 `slide.css`에 있다
- 색은 mega Ink(`#17152B`)에서 한 톤 낮춘 회보라 계열(`--head #4A4760`, `--body #5F5C75`, `--muted #8A869E`, `--rule #9A97AE`)이다. **mega-bi 토큰이 아니라 이 레포에서 파생한 값**이라 mega-bi 색이 바뀌면 같이 검토한다. 흰 바탕, 진행 막대(뷰어 아래)만 제품색 Amber `#D98A00`. 로고는 `assets/mega-slide.svg`
- 서체는 mega-bi를 따른다: Noto Sans KR(한글)·Space Grotesk(라틴 머리글·쪽 번호)·IBM Plex Mono(코드)
- 구성 참고: [kciter.so/talks](https://kciter.so/talks/)의 발표처럼 짧은 제목·넉넉한 여백·도식 중심. 그 사이트의 배포 방식(PDF→이미지 갤러리)은 범위 밖이다

## 구현 메모

- 무대는 1920×1080 고정이고 창 크기에 맞춰 `transform: scale`로 줄인다. 인쇄(PDF)는 `@page` 1920×1080 + 슬라이드마다 쪽 나눔
- 글자 크기는 CSS가 아니라 `slide.mjs`가 글자 수로 정해 인라인으로 넣는다: `fit()`(제목·문장·숫자)과 `listSize()`(본문). 글자 폭은 `wlen()`이 근사한다(한글 0.94em, 그 밖 0.6em, 공백 0.3em) — 폰트 실측이 아니다. 최소 크기로도 안 들어가면 `경고:`를 낸다
- 항목 사이 간격은 `em`이라 글자가 작아지면 같이 줄어든다(줄이 많아도 넘치지 않게)
- 이 디자인의 굵기(Noto Sans KR 200·300·400·500·700, Space Grotesk 500)는 Google Fonts에서 받는다(`FONTS`). 굵기를 새로 쓰면 그 URL에도 추가한다 — 빠뜨리면 브라우저가 가까운 굵기로 대체해 그려서 대비가 틀어진다. 오프라인이면 시스템 서체로 그려진다
- Chrome은 `--virtual-time-budget`으로 웹 폰트를 받을 시간을 준다
- SVG 이미지는 `<img>`로 내장되어 웹 폰트가 적용되지 않는다
- 본문 6줄 초과·칸 본문 4줄 초과 경고 기준은 잠정값이다

## PPTX 구현 메모

- 흐름: HTML을 `?pptx`로 열면 `assets/extract.js`가 글자 하나하나의 위치로 글줄(줄바꿈 위치 포함)·테두리 선·`::before` 선·그림 영역을 재서 `#pptx-layout`에 JSON으로 남긴다 → `slide.mjs`의 `measure()`가 `chrome --dump-dom`으로 읽는다 → `pptx.mjs`가 OOXML을 써서 ZIP으로 묶는다. 레이아웃을 PPT용으로 따로 짜지 않으므로 새 레이아웃·스타일은 그대로 PPT에 반영된다
- 좌표 1920px 무대 = 13.333in → 1px = 6350 EMU = 0.5pt. 글자 크기 pt = px × 0.5, 자간(`spc`)·줄 간격(`lnSpc`)도 같은 비율
- 글은 `wrap="none"` + 줄마다 `<a:br>` + 줄 간격 고정. 줄이 서체에 따라 새로 감기지 않게 하려는 것이다. 단 macOS 미리보기는 `wrap="none"`을 무시하므로 상자를 슬라이드 오른쪽 끝까지 넓혀 둔다
- 굵기는 서체 이름으로 고른다(`Noto Sans KR Light`, `Space Grotesk Medium` …). `--font`를 주면 한 서체로 통일하고 굵게/보통만 남는다
- 그림은 캔버스로 PNG로 구워 넣는다(SVG는 viewBox 비율로 `contain` 영역 계산). 서체가 SVG 안에서는 시스템 서체다
- **검증**: 구조는 ZIP·XML·관계 대상 검사(`tests/test.mjs`), 모양은 슬라이드를 한 장씩 따로 PPTX로 만들어 `qlmanage -t`(macOS 미리보기)로 그려 HTML과 비교했다. PowerPoint·Keynote·Google 슬라이드·LibreOffice로는 열어 보지 못했다 — 문제가 보고되면 거기서부터 본다
