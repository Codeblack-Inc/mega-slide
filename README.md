<h1><img src="assets/mega-slide.svg" alt="mega-slide" width="220" /></h1>

[mega 제품군](https://codeblack-inc.github.io/mega-bi/) · [브랜드 가이드와 로고](https://github.com/Codeblack-Inc/mega-bi)

발표자료(PPT)를 만드는 Claude Code / Codex 플러그인.

> **상태: 초기 세팅.** 레포 구조와 플러그인 매니페스트만 있고, 슬라이드 생성은 아직 구현되지 않았습니다.

mega-slide는 [mega 오픈소스 제품군](https://codeblack-inc.github.io/mega-bi/)의 발표자료 도구입니다.

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
