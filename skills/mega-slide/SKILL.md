---
name: mega-slide
description: 여백 있는 발표용 슬라이드를 웹(HTML)이나 PDF로 만든다. 사용자가 발표 슬라이드·토크 덱·발표 자료를 웹이나 PDF로 만들어 달라고 할 때 사용. PPT(.pptx) 파일은 만들지 않는다 — 그건 mega-ppt. 스토리 설계 → deck.json 작성 → build로 HTML+PDF 생성 → 슬라이드 PNG로 시각 검수. 한국어 우선.
license: MIT
metadata:
  version: "0.1.0"
---

# mega-slide

글이 적고 여백이 많은 **발표용 슬라이드**를 만든다. 결과는 키보드로 넘기는 HTML 한 파일과 PDF다. 색과 서체는 mega 브랜드(Noto Sans KR · Space Grotesk, Ink·Violet·Amber)를 쓴다.

이 파일이 있는 디렉터리를 `$SKILL`이라 한다. Node 18+와 Chrome이 필요하다(Chrome이 다른 곳에 있으면 `CHROME` 환경변수). 웹 폰트는 Google Fonts에서 받으므로 온라인이어야 서체가 맞는다.

```bash
node $SKILL/scripts/slide.mjs build deck.json -o out/deck.html --pdf --png
#  out/deck.html   ←/→·스페이스로 넘김, f 전체화면, 주소 끝 #3 으로 3번 슬라이드
#  out/deck.pdf    슬라이드 1장 = 1쪽 (16:9)
#  out/deck-png/NN.png   검수용 슬라이드 이미지
```

## 워크플로

### 1. 파악
- 주제, 청중, 발표 시간(≈ 장수), 소스 자료를 확인한다. 모르면 묻는다(최대 3개).
- **숫자·사실은 소스에서만** 가져온다. 없으면 `[확인 필요]`로 둔다.
- 편집 가능한 PowerPoint(.pptx)가 필요하거나 표·차트가 빽빽한 보고서형 장표면 mega-ppt를 안내한다.

### 2. 스토리
- 한 장에 메시지 하나. 제목은 짧은 주제어나 한 문장으로, 글은 적게 쓴다 (잠정 기준: 본문 줄 5개 이하, 장당 대략 100자 안쪽).
- 장이 바뀌는 곳에 `section`을 둔다. 핵심 한 문장은 `statement`로 크게 보인다.
- 구조·흐름·비교는 글보다 그림. 다이어그램은 mega-diagram으로 SVG를 만들어 `figure`/`split`에 넣는다.

### 3. deck.json
레이아웃 종류와 필드는 [`references/layouts.md`](references/layouts.md), 예시는 [`examples/sample.json`](examples/sample.json). 첫 장은 `cover`, 마지막은 `closing`.

### 4. 빌드와 검수
- `build … --pdf --png`를 실행하고 **PNG를 직접 열어 본다**: 글이 넘치거나 줄바꿈이 어색한 곳, 텅 빈 장, 그림이 잘린 곳을 찾아 `deck.json`을 고친다.
- 오류 메시지(모르는 layout, 필수 필드 누락)는 슬라이드 번호와 함께 나온다.
