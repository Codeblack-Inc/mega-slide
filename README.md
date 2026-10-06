<h1><img src="assets/mega-slide.svg" alt="mega-slide" width="220" /></h1>

[**처음 쓰는 사람을 위한 가이드**](docs/GUIDE.md) · [mega 제품군](https://codeblack-inc.github.io/mega-bi/) · [브랜드 가이드와 로고](https://github.com/Codeblack-Inc/mega-bi)

회색 글자와 가는 선으로 정리하는 조용한 포스터형 발표 슬라이드를 웹(HTML)·PDF·PowerPoint(.pptx)로 바로 만드는 Claude Code / Codex 플러그인.

mega-slide는 [mega 오픈소스 제품군](https://codeblack-inc.github.io/mega-bi/)의 발표용 슬라이드 도구입니다. 글이 적고 여백이 많은 슬라이드를 만듭니다. 표·차트·패널이 빽빽한 보고서형 장표(사업계획서 등)는 [mega-ppt](https://codeblack-inc.github.io/mega-ppt/)가 맡습니다.

- **웹 · PDF · PPT**: 키보드로 넘기는 HTML 한 파일(←/→·스페이스, `f` 전체화면, `#3`으로 특정 장 열기), 슬라이드 1장 = 1쪽 PDF(16:9), 열어서 고칠 수 있는 PowerPoint(.pptx)를 한 번에 만든다. PPT는 글이 텍스트 상자, 선이 선, 그림이 그림으로 들어간다
- **Type Poster 디자인**: 장식 없이 한글의 크기와 굵기(Bold ↔ ExtraLight)로 위계를 세우고 가는 선으로 칸을 나눈다. 색은 mega Ink에서 한 톤 낮춘 회보라 계열뿐, 강조도 굵기로 한다
- **레이아웃 9종**: 표지 · 장 구분 · 본문 · 한 문장 · 큰 숫자 · 세 칸 · 그림 · 글+그림 · 마무리. [`layouts.md`](skills/mega-slide/references/layouts.md)
- **글자 크기 자동**: 제목·문장·숫자·본문이 글자 수에 맞춰 커지고 줄어든다. 넘칠 만큼 길면 빌드가 경고한다
- **다이어그램**: 직접 그리지 않고 [mega-diagram](https://github.com/Codeblack-Inc/mega-diagram)의 SVG를 그림 슬라이드에 넣는다
- **시각 검수**: 슬라이드를 PNG로 내보내 AI가 직접 보고 고친다

## 설치

> 코딩이 처음이면 [docs/GUIDE.md](docs/GUIDE.md)를 보세요 — Claude 앱의 Code 탭, ChatGPT의 Codex 앱에서 쓰는 법과 요청 예시, 문제 해결이 있습니다.

**Claude Code**
```text
/plugin marketplace add Codeblack-Inc/mega-slide
/plugin install mega-slide@mega-slide
```

**Codex**
```bash
codex plugin marketplace add Codeblack-Inc/mega-slide
codex plugin add mega-slide@mega-slide
```

**로컬 개발(심볼릭 링크)**
```bash
ln -s "$PWD/skills/mega-slide" ~/.claude/skills/mega-slide
ln -s "$PWD/skills/mega-slide" ~/.codex/skills/mega-slide
```

필요 도구: Node 18+, Chrome(다른 위치면 `CHROME` 환경변수). 웹 폰트는 Google Fonts에서 받으므로 온라인이어야 서체와 굵기 대비가 맞습니다.

## 사용
> 이 내용으로 발표 슬라이드 만들어줘. 웹이랑 PDF로.

직접 실행:
```bash
node skills/mega-slide/scripts/slide.mjs build skills/mega-slide/examples/sample.json -o out/sample.html --pdf --png --pptx
```

## 구조
```
.claude-plugin/            Claude Code 플러그인 + 마켓플레이스 매니페스트
.codex-plugin/             Codex 플러그인 매니페스트
.agents/plugins/           Codex 마켓플레이스
skills/mega-slide/
  SKILL.md                 워크플로 (파악 → 스토리 → deck.json → 빌드 → 검수)
  references/layouts.md    레이아웃별 필드, 글 쓰는 법, 자동 크기 규칙
  scripts/slide.mjs        build (HTML · PDF · PNG · PPTX)
  scripts/pptx.mjs         측정한 레이아웃 → .pptx (ZIP·OOXML 직접 작성)
  assets/slide.css         Type Poster 스타일
  assets/extract.js        PPTX용: 슬라이드의 글줄·선·그림 위치를 재서 JSON으로 남김
  examples/                sample.json (가상의 발표) + 그림
docs/GUIDE.md              처음 쓰는 사람을 위한 가이드 (Claude · Codex)
tests/test.mjs             렌더 테스트 (node tests/test.mjs)
assets/mega-slide.svg      로고
```

## 한계
- 디자인 하나뿐이다(Type Poster). 시안 10가지 중 회색·가는 선 조합을 골랐다. 테마 교체, 발표자 노트, 애니메이션은 아직 없다.
- 글자 크기는 글자 수로 근사한다(폰트 실측 아님). 애매하면 PNG를 직접 확인한다.
- PPTX: 글은 줄바꿈이 고정된 텍스트 상자이고 그림은 PNG라 편집되지 않는다. Noto Sans KR·Space Grotesk가 설치돼 있어야 같은 서체로 보인다(`--font`로 바꿀 수 있음). macOS 미리보기로 모양을 확인했고, PowerPoint·Keynote·Google 슬라이드에서는 아직 확인하지 않았다.
- SVG 그림은 `<img>`로 들어가서 웹 폰트가 적용되지 않는다(글자가 윤곽선인 SVG는 무관).

## License
MIT
