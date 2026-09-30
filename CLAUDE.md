# mega-slide

Claude Code + Codex 플러그인. 공용 스킬은 `skills/mega-slide/` 하나 — 두 호스트가 같은 파일을 쓴다.

- 엔진: `skills/mega-slide/scripts/slide.mjs` 한 파일, 의존성 없음. `deck.json` → 단일 HTML(레이아웃별 HTML을 이어 붙이고 `assets/slide.css`·이미지를 내장) → Chrome 헤드리스로 PDF·PNG
- 출력은 **웹(HTML)과 PDF뿐**이다. PPT(.pptx)는 제공하지 않는다 (그건 mega-ppt의 몫). mega-ppt는 장당 300~600자의 보고서형 고밀도 장표, mega-slide는 글이 적고 여백이 많은 발표용 슬라이드로 구분한다
- 레이아웃 추가: `LAYOUTS`에 함수 → `assets/slide.css` → `references/layouts.md` → `examples/sample.json`에 한 장 (테스트가 모든 레이아웃이 샘플에 쓰였는지 검사)
- 테스트: `node tests/test.mjs` (Chrome 불필요)
- 시각 확인: `node skills/mega-slide/scripts/slide.mjs build skills/mega-slide/examples/sample.json -o /tmp/s/sample.html --pdf --png` → `/tmp/s/sample-png/NN.png`. 레이아웃·스타일을 바꿨으면 PNG를 직접 본다
- 구현 메모
  - 무대는 1920×1080 고정이고 창 크기에 맞춰 `transform: scale`로 줄인다. 인쇄(PDF)는 `@page` 1920×1080 + 슬라이드마다 쪽 나눔
  - Chrome은 `--virtual-time-budget`으로 웹 폰트(Google Fonts)를 받을 시간을 준다. 오프라인이면 시스템 서체로 그려진다
  - SVG 이미지는 `<img>`로 내장되어 웹 폰트가 적용되지 않는다
- 버전 올릴 때 `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, SKILL.md `metadata.version` 함께 수정
- 예시 콘텐츠는 가상의 발표만 쓴다 (실제 고객·발표 자료 금지)
- 디자인 방향 (결정): 구성은 [kciter.so/talks](https://kciter.so/talks/)의 슬라이드 스타일을 최대한 따르고(2024~2025년 덱 기준), 색과 서체는 mega 브랜드를 그대로 쓴다. 따르는 것은 **디자인·구성**뿐이고 그 사이트의 배포 방식(PDF→이미지 갤러리, slidef)은 범위 밖이다
- kciter 스타일 관찰 (눈으로 본 것, 실측 전): 흰 배경 16:9, 표지는 파스텔 원형 그라데이션 + 제목 + 이름, 본문 위쪽에 작은 머리글(좌: 발표 제목, 우: 섹션명), 장마다 짧은 주제 제목 + 도식 중심, 글은 적고 여백이 많다. 컨퍼런스 발표(INFCON 등)의 검은/파란 배경은 행사 테마라서 기준이 아니다. 현재 `slide.css`의 크기·여백은 이 관찰을 바탕으로 잡은 값이지 실측이 아니다
- 브랜드는 [mega-bi](https://github.com/Codeblack-Inc/mega-bi)를 따른다: 색은 `tokens.css`/`tokens.json`(Ink·Violet·Paper 등, 제품색 Amber `#D98A00`), 서체는 Space Grotesk(제목)·Noto Sans KR(한글 본문)·IBM Plex Mono(코드). `slide.css`의 `:root` 값은 mega-bi 토큰을 복사한 것이라 토큰이 바뀌면 함께 고친다. 로고는 `assets/mega-slide.svg`
