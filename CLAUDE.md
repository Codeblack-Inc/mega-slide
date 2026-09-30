# mega-slide

Claude Code + Codex 플러그인. 공용 스킬은 `skills/mega-slide/` 하나 — 두 호스트가 같은 파일을 쓴다.

- 현재는 초기 세팅 단계다. 엔진·워크플로·예시·테스트는 아직 없다 (`SKILL.md`는 자리표시)
- 버전 올릴 때 `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, SKILL.md `metadata.version` 함께 수정
- 예시 콘텐츠는 가상의 과제만 쓴다 (실제 고객·과제 자료 금지)
- 출력은 **웹(HTML)과 PDF뿐**이다. PPT(.pptx)는 제공하지 않는다 (그건 mega-ppt의 몫). mega-ppt는 장당 300~600자의 보고서형 고밀도 장표, mega-slide는 글이 적고 여백이 많은 발표용 슬라이드로 구분한다
- 디자인 방향 (결정): 구성은 [kciter.so/talks](https://kciter.so/talks/)의 슬라이드 스타일을 최대한 따르고(2024~2025년 덱 기준), 색과 서체는 mega 브랜드를 그대로 쓴다. 따르는 것은 **디자인·구성**뿐이고 그 사이트의 배포 방식(PDF→이미지 갤러리, slidef)은 범위 밖이다
- mega-ppt처럼 **여러 레이아웃(구성)을 카탈로그로 제공**한다 — 레이아웃 종류와 조합 방식은 아직 정하지 않았다 (mega-ppt는 전면 레이아웃 + 본문 패널 격자, `skills/mega-ppt/references/layouts.md`)
- kciter 스타일 관찰 (눈으로 본 것, 실측 전): 흰 배경 16:9, 표지는 파스텔 원형 그라데이션 + 제목 + 이름, 본문 위쪽에 작은 머리글(좌: 발표 제목, 우: 섹션명), 장마다 짧은 주제 제목 + 도식 중심, 글은 적고 여백이 많다. 컨퍼런스 발표(INFCON 등)의 검은/파란 배경은 행사 테마라서 기준이 아니다
- 브랜드는 [mega-bi](https://github.com/Codeblack-Inc/mega-bi)를 따른다: 색은 `tokens.css`/`tokens.json`(Ink·Violet·Paper 등, 제품색 Amber `#D98A00`), 서체는 Space Grotesk(제목)·Noto Sans KR(한글 본문)·IBM Plex Mono(코드). 로고는 `assets/mega-slide.svg`
