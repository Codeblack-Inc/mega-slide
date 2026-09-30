<h1><img src="assets/mega-slide.svg" alt="mega-slide" width="220" /></h1>

[mega 제품군](https://codeblack-inc.github.io/mega-bi/) · [브랜드 가이드와 로고](https://github.com/Codeblack-Inc/mega-bi)

발표용 슬라이드를 웹(HTML)이나 PDF로 바로 만드는 Claude Code / Codex 플러그인.

> **상태: 초기 세팅.** 레포 구조와 플러그인 매니페스트만 있고, 슬라이드 생성은 아직 구현되지 않았습니다.

mega-slide는 [mega 오픈소스 제품군](https://codeblack-inc.github.io/mega-bi/)의 발표용 슬라이드 도구입니다. 글이 적고 여백이 많은 슬라이드를 만들며, PPT(.pptx)는 만들지 않습니다. 빽빽한 보고서형 장표와 편집 가능한 PowerPoint는 [mega-ppt](https://codeblack-inc.github.io/mega-ppt/)가 맡습니다.

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

## 구조
```
.claude-plugin/            Claude Code 플러그인 + 마켓플레이스 매니페스트
.codex-plugin/             Codex 플러그인 매니페스트
.agents/plugins/           Codex 마켓플레이스
skills/mega-slide/
  SKILL.md                 스킬 (지금은 자리표시)
assets/mega-slide.svg      로고
```

## License
MIT
