# 처음 쓰는 사람을 위한 mega-slide 가이드

> 코딩을 몰라도 됩니다. "이 내용으로 발표 슬라이드 만들어줘"처럼 말로 부탁하면, AI가 키보드로 넘기는 **웹 슬라이드(HTML)**와 **PDF**, 그리고 열어서 고칠 수 있는 **PowerPoint(.pptx)**를 만들어 줍니다.
> 표·차트·패널이 빽빽한 보고서형 장표(사업계획서 등)는 [mega-ppt](https://codeblack-inc.github.io/mega-ppt/)가 더 맞습니다. mega-slide의 PPT는 "여백 있는 발표용 디자인"을 PowerPoint로 옮긴 것입니다.

---

## 1. 무엇을 할 수 있나요

| 하고 싶은 일 | 이렇게 말하세요 |
|---|---|
| 슬라이드 만들기 | "이 글로 15분 발표 슬라이드 만들어줘. 웹이랑 PDF로" |
| PPT로 받기 | "이 슬라이드를 PPT로도 뽑아줘" (글꼴은 아래 준비물 4 참고) |
| 자료에서 발표 구성하기 | "이 보고서를 10장짜리 발표로 정리해줘. 먼저 장 구성부터 보여줘" |
| 고치기 | "3장은 글이 너무 많아. 두 장으로 나눠줘", "표지 제목을 두 줄로 바꿔줘" |
| 그림 넣기 | "4장에 데이터 흐름도 넣어줘" ([mega-diagram](https://github.com/Codeblack-Inc/mega-diagram) 필요) |

**결과물 4가지**

| 파일 | 쓰임 |
|---|---|
| `deck.html` | 발표할 때 그대로 엽니다. 키보드로 넘기고 전체화면으로 보여 줍니다. 파일 하나라서 메일·메신저로 보내도 됩니다 |
| `deck.pdf` | 슬라이드 1장 = 1쪽(16:9). 배포·인쇄용 |
| `deck.pptx` | PowerPoint 파일. 글은 텍스트 상자, 선은 선으로 들어가 열어서 고칠 수 있습니다. "PPT로도"라고 요청했을 때 만들어집니다 |
| `deck-png/` | 슬라이드를 장마다 찍은 이미지. AI가 직접 보고 고칠 때 쓰고, 썸네일로도 쓸 수 있습니다 |

**디자인은 하나입니다.** 회색 글자와 가는 선만 쓰고, 한글의 크기와 굵기(Bold ↔ ExtraLight)로 위계를 만듭니다. 글이 적고 여백이 많은 슬라이드에 맞습니다. 색 강조는 없고, 강조는 **굵게**만 됩니다.

---

## 2. 어디서 쓰나요 — 내 상황에 맞는 길 고르기

| 나는… | 추천 방법 | 난이도 |
|---|---|---|
| **Claude**를 쓴다 (Pro·Max·Team) | **A. Claude 데스크톱 앱의 Code 탭** | ★☆☆ 가장 쉬움 |
| **ChatGPT**를 쓴다 (Plus·Pro·Team) | **B. Codex 앱** (ChatGPT 계정으로 로그인) | ★☆☆ |
| 터미널이 익숙하다 | C. Claude Code / Codex CLI | ★★☆ |

> mega-slide는 내 컴퓨터에서 슬라이드를 만들고 Chrome으로 PDF·PPT·이미지를 뽑습니다. 그래서 **Code 탭 / Codex**에서 쓰고, claude.ai·chatgpt.com의 일반 채팅에서는 쓸 수 없습니다.

### 준비물 (한 번만)

1. **Node.js 18 이상** (무료) — <https://nodejs.org> 에서 "LTS" 버튼을 눌러 설치. 다음, 다음만 누르면 됩니다.
2. **Google Chrome** — PDF·PPT·슬라이드 이미지를 만들 때 씁니다. 이미 쓰고 있다면 그대로 됩니다. (Chrome이 없어도 HTML 슬라이드는 만들어집니다.)
3. **인터넷 연결** — 글꼴(Noto Sans KR·Space Grotesk)을 Google Fonts에서 받습니다. 오프라인이면 다른 글꼴로 그려져 굵기 대비가 약해집니다.
4. (PPT를 쓸 때) **글꼴 설치** — PPT 파일은 글꼴을 담지 않습니다. [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR)과 [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)를 설치하면(무료) 웹·PDF와 같은 모양으로 보입니다. 설치하기 싫다면 "PPT는 맑은 고딕으로"처럼 글꼴을 정해 달라고 하세요(굵게/보통만 남습니다).

### A. Claude 데스크톱 앱 (가장 쉬움)

1. <https://claude.ai/download> 에서 Claude 앱 설치 → 로그인
2. 왼쪽 위에서 **Code** 탭 선택 → 작업할 폴더 고르기 (예: 바탕화면에 `발표` 폴더를 만들고 선택)
3. 입력창에 아래 두 줄을 **한 줄씩** 입력하고 Enter

   ```text
   /plugin marketplace add Codeblack-Inc/mega-slide
   /plugin install mega-slide@mega-slide
   ```

   그림도 넣으려면 mega-diagram도 같이 설치합니다.

   ```text
   /plugin marketplace add Codeblack-Inc/mega-diagram
   /plugin install mega-diagram@mega-diagram
   ```

4. 앱을 다시 시작 (또는 새 대화)
5. 발표 자료(글·문서·메모)를 그 폴더에 넣고, 말로 부탁합니다 → [3. 이렇게 부탁하세요](#3-이렇게-부탁하세요)

> 명령을 치는 대신 "Codeblack-Inc/mega-slide 플러그인 설치해줘"라고 말해도 됩니다.

### B. ChatGPT 사용자 — Codex 앱

1. <https://openai.com/codex> 에서 Codex 앱 설치 → **ChatGPT 계정으로 로그인**
2. 작업할 폴더 열기
3. 앱 안의 터미널(또는 Mac의 터미널 앱)에 아래를 붙여 넣기

   ```bash
   codex plugin marketplace add Codeblack-Inc/mega-slide
   codex plugin add mega-slide@mega-slide
   ```

   그림도 넣으려면:

   ```bash
   codex plugin marketplace add Codeblack-Inc/mega-diagram
   codex plugin add mega-diagram@mega-diagram
   ```

4. Codex를 다시 시작하고 말로 부탁합니다.

> **모델 오류가 나면** — `The '…' model is not supported when using Codex with a ChatGPT account.`
> ChatGPT 계정으로 로그인한 Codex는 쓸 수 있는 모델이 정해져 있습니다. 설정 파일 `~/.codex/config.toml`(Windows: `%USERPROFILE%\.codex\config.toml`)의 `model` 줄을 지원 모델로 바꾸세요. (예: `model = "gpt-5.5"`) 지원 모델은 요금제·시기에 따라 바뀌니, 앱의 모델 목록에 보이는 것으로 고르세요.

### C. 터미널 (Claude Code / Codex CLI)

A·B와 명령이 같습니다. Claude Code는 `claude`를 실행한 뒤 `/plugin …` 두 줄, Codex CLI는 위 `codex plugin …` 두 줄.

직접 고쳐 가며 쓰려면(개발용) 레포를 받아 스킬 폴더를 연결합니다.

```bash
git clone https://github.com/Codeblack-Inc/mega-slide && cd mega-slide
ln -s "$PWD/skills/mega-slide" ~/.claude/skills/mega-slide
ln -s "$PWD/skills/mega-slide" ~/.codex/skills/mega-slide
```

---

## 3. 이렇게 부탁하세요

### 기본 원칙 3가지

1. **내용을 주세요.** 숫자·사실은 AI가 지어내지 않고 준 자료에서만 가져옵니다. 없으면 `[확인 필요]`로 둡니다. 글, 문서, 메모를 폴더에 넣고 "이 폴더 자료로"라고 하세요.
2. **발표 상황을 말하세요.** 청중, 시간("15분"), 장 수("10장 정도"). 시간으로 장 수를 가늠합니다.
3. **구성을 먼저 확인하세요.** "먼저 장 구성부터 보여줘"라고 하면 슬라이드를 만들기 전에 고칠 수 있습니다.

### 바로 쓰는 요청 예시

```text
이 문서(제안서.md)로 15분짜리 발표 슬라이드를 만들어줘. 청중은 개발자야.
먼저 장 구성부터 보여주고, 괜찮으면 웹이랑 PDF로 만들어줘.
```

```text
"작은 도구를 오래 쓰는 법"이라는 주제로 20분 발표 슬라이드를 만들어줘.
핵심 메시지는 '한 가지를 잘하는 도구가 오래 간다'야. 숫자는 내가 주는 것만 써.
```

```text
방금 만든 슬라이드에서 3장은 글이 너무 많아. 두 장으로 나누고, 6장은 큰 숫자 한 개로 바꿔줘.
```

```text
4장에 입력 → 변환 → 출력 흐름도를 넣어줘. 흑백 프리셋으로.
```

```text
이 슬라이드를 PPT로도 뽑아줘. 글꼴은 맑은 고딕으로 통일해줘.
```

### 진행 순서 (AI가 알아서 합니다)

1. 주제·청중·시간·자료 확인 → 2. **장 구성과 핵심 문장을 먼저 보여 줌** (여기서 고칠 점을 말하세요) → 3. `deck.json` 작성 → 4. HTML·PDF·슬라이드 이미지 생성 → 5. 이미지를 직접 보고 넘친 곳·어색한 곳 수정 → 6. 결과 전달

결과는 보통 작업 폴더의 `out/`에 만들어집니다.

---

## 4. 만든 슬라이드 보는 법

`deck.html`을 더블클릭하면 브라우저(Chrome 권장)에서 열립니다.

| 하려면 | 누르세요 |
|---|---|
| 다음 / 이전 슬라이드 | `→` `스페이스` `Enter` / `←` `Backspace` (화면 오른쪽 · 왼쪽 절반을 눌러도 됩니다) |
| 처음 / 끝 | `Home` / `End` |
| 전체화면 | `f` |
| 특정 슬라이드로 | 주소 끝에 `#3` 처럼 번호를 붙여 열기 |

창 크기가 16:9가 아니어도 비율을 지켜 맞춰 줍니다. 아래쪽의 가는 막대는 진행 정도입니다(PDF에는 나오지 않습니다).

**PPT(`deck.pptx`)** 는 PowerPoint·Keynote·Google 슬라이드로 엽니다. 글줄 바꿈 위치가 고정된 텍스트 상자라서, 글을 고칠 때는 원하는 곳에서 `Enter`로 줄을 직접 나눠 주세요.

---

## 5. 슬라이드 종류와 글 쓰는 요령

| 종류 | 이럴 때 |
|---|---|
| 표지 / 마무리 | 첫 장 / 마지막 장. 발표 제목을 두 줄로 나누면 첫 줄은 굵게, 둘째 줄은 가늘게 나옵니다 |
| 장 구분 | 이야기가 바뀌는 곳. 오른쪽 위에 장 번호가 자동으로 붙습니다 |
| 본문 | 큰 제목 + 항목 3~5개 |
| 한 문장 | 꼭 기억시킬 문장 하나 |
| 큰 숫자 | 숫자 하나가 메시지일 때 ("10분", "63%") |
| 세 칸 | 같은 무게의 세 가지를 나란히 |
| 그림 / 글+그림 | 흐름·구조를 그림으로 보여 줄 때 |

종류별 필드는 [layouts.md](../skills/mega-slide/references/layouts.md)에 있습니다. (AI가 알아서 고르니 몰라도 됩니다.)

**잘 만드는 요령**

- **한 장에 메시지 하나.** 이 디자인은 글자가 곧 그림이라 글이 길어지면 무너집니다. 항목은 6개 이하.
- 글이 너무 길면 AI가 "경고"를 보고 줄이거나 장을 나눕니다. 그대로 두고 싶으면 알려 주세요.
- 글자 크기는 글자 수에 맞춰 자동으로 정해집니다. 짧은 제목은 크게, 긴 제목은 작게.
- 다른 색으로 강조하는 건 안 됩니다. **굵게**만 됩니다.

---

## 6. mega-diagram과 같이 쓰기

흐름도·구성도·간트·차트 같은 그림은 짝꿍 플러그인 [mega-diagram](https://codeblack-inc.github.io/mega-diagram/)이 투명 배경 SVG/PNG로 그려서 슬라이드에 넣습니다.

- 이 디자인은 회색 단색이라 그림도 **"흑백(mono) 프리셋으로"** 요청하면 어울립니다.
- 그림 한 장에는 요소를 9개 이하로. 많으면 두 장으로 나누는 게 낫습니다.
- 그림만 따로 필요하면: "이 내용으로 추진체계도 PNG만 만들어줘"

---

## 7. 자주 묻는 질문

**Q. PPT로 받을 수 있나요?**
네. "PPT로도 뽑아줘"라고 하면 `deck.pptx`가 만들어집니다. 글은 텍스트 상자, 선은 선으로 들어가 열어서 고칠 수 있습니다. 다만 ① 줄바꿈 위치가 고정돼 있고 ② 그림은 이미지 한 장이라 편집되지 않으며 ③ 글꼴(Noto Sans KR·Space Grotesk)이 설치돼 있어야 같은 모양입니다. 표준 PPTX 형식이지만 모든 프로그램에서 확인한 것은 아니니, 열리지 않거나 모양이 이상하면 [알려 주세요](https://github.com/Codeblack-Inc/mega-slide/issues). 표·차트·SmartArt 같은 PPT 고유 개체나 빽빽한 보고서형 장표는 [mega-ppt](https://codeblack-inc.github.io/mega-ppt/)가 맡습니다.

**Q. 다른 디자인(색·글꼴)으로 바꿀 수 있나요?**
아직 디자인은 하나입니다(Type Poster). 테마 교체는 지원하지 않습니다.

**Q. 수치를 지어내지 않나요?**
준 자료에 없는 수치는 넣지 않고 `[확인 필요]`로 표시하거나 물어봅니다. 예시 덱의 숫자는 설명용 **가상** 값입니다.

**Q. 보안이 걱정돼요.**
파일은 내 컴퓨터 폴더에서 만들어지고 저장됩니다. AI 서비스에 보내는 내용은 쓰는 Claude/ChatGPT 요금제의 데이터 정책을 따릅니다. 민감한 원본은 가려서 쓰세요.

**Q. 안 될 때는?**

| 증상 | 해결 |
|---|---|
| `node: command not found` | 준비물 1의 Node.js 설치 후 앱 재시작 |
| `Chrome을 찾지 못했다` | HTML 슬라이드는 이미 만들어졌습니다. PDF·PPT·이미지는 Chrome 설치 후 다시 요청하세요. Chrome이 특별한 곳에 있으면 환경변수 `CHROME`에 실행 파일 경로를 지정 |
| 글꼴이 다르고 굵기 대비가 약함 | 인터넷에 연결해서 다시 열기 (글꼴을 Google Fonts에서 받습니다) |
| PPT에서 글꼴이 다르고 굵기 대비가 없음 | Noto Sans KR·Space Grotesk를 설치하세요(준비물 4) |
| `경고: … 너무 길다` | 글을 줄이거나 장을 나누라는 뜻입니다. AI에게 "경고 없애줘"라고 하세요 |
| 플러그인 명령이 안 먹음 | Claude는 **Code 탭**인지, ChatGPT는 **Codex**인지 확인 |
| 그림이 슬라이드에 없음 | mega-diagram 설치 확인, "그림도 넣어줘"라고 요청 |

문제·제안: <https://github.com/Codeblack-Inc/mega-slide/issues>
