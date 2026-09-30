<h1><img src="assets/mega-slide.svg" alt="mega-slide" width="220" /></h1>

[mega 제품군](https://codeblack-inc.github.io/mega-bi/) · [브랜드 가이드와 로고](https://github.com/Codeblack-Inc/mega-bi)

발표용 슬라이드를 웹(HTML)이나 PDF로 바로 만드는 Claude Code / Codex 플러그인.

mega-slide는 [mega 오픈소스 제품군](https://codeblack-inc.github.io/mega-bi/)의 발표용 슬라이드 도구입니다. 글이 적고 여백이 많은 슬라이드를 만들며, PPT(.pptx)는 만들지 않습니다. 빽빽한 보고서형 장표와 편집 가능한 PowerPoint는 [mega-ppt](https://codeblack-inc.github.io/mega-ppt/)가 맡습니다.

- **웹과 PDF**: 키보드로 넘기는 HTML 한 파일(←/→·스페이스, `f` 전체화면, `#3`으로 특정 장 열기)과 슬라이드 1장 = 1쪽 PDF(16:9)를 한 번에 만든다
- **레이아웃 8종**: 표지 · 장 구분 · 본문 · 한 문장 · 카드 2~3칸 · 그림 · 글+그림 · 마무리. [`layouts.md`](skills/mega-slide/references/layouts.md)
- **구성**: [kciter.so/talks](https://kciter.so/talks/)의 슬라이드처럼 흰 바탕에 작은 머리글, 짧은 주제 제목, 도식 중심, 넉넉한 여백
- **mega 브랜드**: 색과 서체(Noto Sans KR · Space Grotesk)는 [mega-bi](https://github.com/Codeblack-Inc/mega-bi)를 따른다
- **다이어그램**: 직접 그리지 않고 [mega-diagram](https://github.com/Codeblack-Inc/mega-diagram)의 SVG를 그림 슬라이드에 넣는다
- **시각 검수**: 슬라이드를 PNG로 내보내 AI가 직접 보고 고친다

## 설치

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

필요 도구: Node 18+, Chrome(다른 위치면 `CHROME` 환경변수). 웹 폰트는 Google Fonts에서 받으므로 온라인이어야 서체가 맞습니다.

## 사용
> 이 내용으로 발표 슬라이드 만들어줘. 웹이랑 PDF로.

직접 실행:
```bash
node skills/mega-slide/scripts/slide.mjs build skills/mega-slide/examples/sample.json -o out/sample.html --pdf --png
```

## 구조
```
.claude-plugin/            Claude Code 플러그인 + 마켓플레이스 매니페스트
.codex-plugin/             Codex 플러그인 매니페스트
.agents/plugins/           Codex 마켓플레이스
skills/mega-slide/
  SKILL.md                 워크플로 (파악 → 스토리 → deck.json → 빌드 → 검수)
  references/layouts.md    레이아웃별 필드와 글 쓰는 법
  scripts/slide.mjs        build (HTML · PDF · PNG)
  assets/slide.css         무대·레이아웃 스타일 (mega 토큰)
  examples/                sample.json (가상의 발표) + 그림
tests/test.mjs             렌더 테스트 (node tests/test.mjs)
assets/mega-slide.svg      로고
```

## 한계
- 첫 버전이다. 레이아웃 8종뿐이고, 크기·여백은 kciter 슬라이드를 눈으로 보고 잡은 값이다(실측 전).
- 발표자 노트, 애니메이션, 테마 교체는 아직 없다.
- SVG 그림은 `<img>`로 들어가서 웹 폰트가 적용되지 않는다(글자가 윤곽선인 mega-diagram SVG는 무관).

## License
MIT
