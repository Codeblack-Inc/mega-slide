---
name: mega-slide
description: 회색 글자와 가는 선으로 정리하는 조용한 포스터형 발표 슬라이드를 웹(HTML)·PDF·PowerPoint(.pptx)로 만든다. 사용자가 발표 슬라이드·토크 덱·발표 자료를 웹, PDF, PPT로 만들어 달라고 할 때 사용. 표·차트가 빽빽한 보고서형 장표는 mega-ppt. 스토리 설계 → deck.json 작성 → build로 HTML+PDF(+PPTX) 생성 → 슬라이드 PNG로 시각 검수. 한국어 우선.
license: MIT
metadata:
  version: "0.4.0"
---

# mega-slide

글이 적고 여백이 많은 **조용한 포스터형 발표 슬라이드**를 만든다. 장식 없이 글자의 크기와 굵기(Bold ↔ ExtraLight)로 위계를 세우고 가는 선으로 칸을 나눈다. 색은 mega Ink에서 한 톤 낮춘 회보라 계열뿐이고 서체는 Noto Sans KR·Space Grotesk다. 결과는 키보드로 넘기는 HTML 한 파일, PDF, 그리고 편집 가능한 PowerPoint(.pptx)다.

이 파일이 있는 디렉터리를 `$SKILL`이라 한다. Node 18+와 Chrome이 필요하다(Chrome이 다른 곳에 있으면 `CHROME` 환경변수). 웹 폰트는 Google Fonts에서 받으므로 온라인이어야 서체가 맞는다.

```bash
node $SKILL/scripts/slide.mjs build deck.json -o out/deck.html --pdf --png --pptx
#  out/deck.html   ←/→·스페이스로 넘김, f 전체화면, 주소 끝 #3 으로 3번 슬라이드
#  out/deck.pdf    슬라이드 1장 = 1쪽 (16:9)
#  out/deck.pptx   PowerPoint — 글은 텍스트 상자, 선은 선, 그림은 그림 (--pptx 를 줄 때만)
#  out/deck-png/NN.png   검수용 슬라이드 이미지
```

## 워크플로

### 1. 파악
- 주제, 청중, 발표 시간(≈ 장수), 소스 자료를 확인한다. 모르면 묻는다(최대 3개).
- **숫자·사실은 소스에서만** 가져온다. 없으면 `[확인 필요]`로 둔다.
- 표·차트·패널이 빽빽한 보고서형 장표(사업계획서 등)면 mega-ppt를 안내한다. 같은 여백 있는 디자인을 PowerPoint로 받고 싶은 것이면 이 스킬의 `--pptx`다.

### 2. 스토리
- 한 장에 메시지 하나. 제목은 짧은 주제어나 한 문장으로, 글은 적게 쓴다. 이 디자인은 글자가 곧 그림이라 글이 길어지면 무너진다 — 본문 줄은 6개 이하(잠정), 넘치면 빌드가 경고한다.
- 장이 바뀌는 곳에 `section`, 핵심 한 문장은 `statement`, 숫자 하나가 메시지면 `number`로 화면 가득 보인다.
- 표지 제목은 `\n`으로 줄을 나눈다: 첫 줄은 Bold, 나머지는 ExtraLight로 굵기 대비가 생긴다.
- 강조는 `**굵게**`뿐이다. 색으로 강조하지 않는다.
- 구조·흐름·비교는 글보다 그림. 다이어그램은 mega-diagram으로 SVG를 만들어 `figure`/`split`에 넣되, 이 디자인에는 회색 단색에 얇은 선(3px)이 어울린다.

### 3. deck.json
레이아웃 종류와 필드는 [`references/layouts.md`](references/layouts.md), 예시는 [`examples/sample.json`](examples/sample.json). 첫 장은 `cover`, 마지막은 `closing`.

### 4. 빌드와 검수
- `build … --pdf --png`를 실행하고 **PNG를 직접 열어 본다**: 글이 넘치거나 줄바꿈이 어색한 곳, 텅 빈 장, 그림이 잘린 곳을 찾아 `deck.json`을 고친다.
- 오류 메시지(모르는 layout, 필수 필드 누락)와 `경고:`(글이 길어 넘칠 것 같음)는 슬라이드 번호와 함께 나온다. 경고는 글을 줄이거나 장을 나눠서 없앤다.

### 5. PowerPoint(.pptx)로 받을 때
- 사용자가 PPT·PowerPoint·.pptx를 말하면 `--pptx`를 붙인다. 그러면 `out/deck.pptx`가 만들어진다. Chrome이 화면에서 잰 글줄·선·그림 위치를 그대로 옮기므로 HTML·PDF와 같은 모양이다.
- 글은 줄바꿈 위치가 고정된 텍스트 상자다. PPT에서 글을 고치면 줄바꿈은 직접 맞춘다. 그림(SVG 포함)은 PNG 한 장으로 들어가 편집되지 않는다.
- 서체는 Noto Sans KR·Space Grotesk(굵기별 이름: Light, Medium …)를 지정한다. 받는 사람 PC에 없으면 다른 서체로 보이니 설치를 안내하거나 `--font "맑은 고딕"`처럼 한 서체로 통일한다(굵기는 굵게/보통만 남는다).
- 이 디자인은 표·차트·SmartArt 같은 PPT 고유 개체를 만들지 않는다. 그런 장표가 필요하면 mega-ppt.
