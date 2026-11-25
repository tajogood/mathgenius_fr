# 수학천재 · MathGenius

초등학교 1~6학년, 중학교 1~3학년, 고등학교 수학을 위한 **100% 정적 웹사이트(GitHub Pages·Cloudflare Pages)** 수학 개념 학습 사이트입니다.

- 회원가입·PASS 인증·DB·서버 없이 이용합니다.
- 초등 1~6학년의 **원본 학습 콘텐츠를 그대로 유지**하고, 중학교 1~3학년의 **34개 개념 단원**을 추가했습니다.
- 중등 단원에 들어가면 숫자·그래프·도형을 바로 바꿔 볼 수 있으며, 이어서 문제 풀이와 해설을 제공합니다. 진도는 브라우저에 저장합니다.
- 고등학교 **공통수학1·공통수학2·대수·미적분Ⅰ·확률과 통계 46개 단원**을 같은 방식(개념 → 직접 조작 실험 → 문제·풀이)으로 제공합니다. [고등 안내](docs/HIGH_SCHOOL_GUIDE.md)
- 중·고등의 모든 분수는 분자 위·분모 아래로 조판합니다(`src/components/MathLine.tsx`).
- 학습 기록은 서버로 전송하지 않고 **방문자의 브라우저에만 저장**합니다.
- 학부모·초등 교사·교육 관계자를 위한 검색 노출용 수업 안내 페이지를 포함합니다.
- 본 저장소는 상용 및 회원 학습관리 앱 `tajogood/mathgenius`와 분리된 공개 무료판입니다.

## 실행

```bash
npm install
npm run dev
npm run build
npm run preview
```

## GitHub Pages

`source` 브랜치 변경 시 GitHub Actions가 빌드·검사를 수행한 뒤 완성된 `dist/`를 `site-build`와 GitHub Pages의 `main`에 자동 반영합니다.

GitHub Pages 설정은 **Deploy from a branch → main / (root)**입니다. 공개 주소:

**https://tajogood.github.io/mathgenius_fr/**

GitHub Pages 프로젝트 경로 `/mathgenius_fr/`에 맞추어 Vite의 `base`를 설정했습니다.

## 개인정보

이 무료판에는 Supabase 연결, 학생 계정, 보호자 동의, 학부모 대시보드, PASS 인증,
관리자 시스템 및 서버 측 학습 기록 수집 기능이 포함되어 있지 않습니다.
학습 진도는 현재 브라우저의 `localStorage`에만 저장되며,
브라우저 데이터를 삭제하거나 다른 기기를 사용하면 이어서 학습할 수 없습니다.

익명 방문자 통계는 Cloudflare Web Analytics로 집계합니다. 공개 첫 화면과 학년별 검색 안내 페이지에 동일한 방문자 추적 비콘을 삽입했으며, 수학 문제 정오답·학생 이름·학습 진도 등은 분석 이벤트로 전송하지 않습니다.

## 운영

운영사: 주식회사 라릭 · https://larix.kr

교육부/교육청 공식 인증 서비스 또는 학교 공식 성취평가가 아닙니다.

## Cloudflare Pages (독립 도메인 및 광고 운영)

Cloudflare Pages는 `tajogood/mathgenius_fr` 저장소의 **`source`** 브랜치를 빌드합니다.
React (Vite) · 명령어 `npm run build` · 출력 `dist` · Node 22 ·
`NPM_CONFIG_LEGACY_PEER_DEPS=true`를 사용합니다.

현재 기본 공개 주소는 **https://mathgenius-b0c.pages.dev/** 입니다.
Cloudflare Pages가 제공하는 `CF_PAGES=1`에서는 Vite가 루트 경로(`/`)에
빌드되고, 검색엔진 대표 주소/사이트맵도 `mathgenius-b0c.pages.dev`를 기본으로 사용합니다.
정식 도메인을 연결하면 Cloudflare Pages 빌드 환경 변수 `SITE_URL=https://<정식도메인>/`으로
설정하면 됩니다. 기존 GitHub Pages의 `/mathgenius_fr/` 경로 빌드는 유지됩니다.

**중요: Cloudflare Web Analytics는 호스트명을 검증합니다.** 그래서 사이트마다 토큰이 다릅니다.
- GitHub Pages(`tajogood.github.io`): `d88a528d03094ff5894095a38b1792b8`
- Cloudflare Pages(`mathgenius-b0c.pages.dev`, `CF_PAGES=1` 빌드): `ef4f06e8eea14dd48885684291e55231`

두 값은 `scripts/generate-seo.mjs`에 기본값으로 들어 있고, 빌드 환경 변수
`WEB_ANALYTICS_TOKEN`을 설정하면 그 값이 우선합니다(정식 도메인을 연결할 때 등). 별도의 데이터베이스는 필요하지 않습니다.

## 영어 버전 (English)

- 사이트 언어는 브라우저에서 정합니다(`src/i18n/index.ts`). 우선순위: 주소의 `?lang=ko|en` → 방문자가 한/EN 버튼으로 고른 언어(브라우저에 저장) → 브라우저 언어(한국어면 한국어, 그 외는 영어).
- 검색 로봇과 자동화 브라우저는 주소에 `?lang=en`이 없으면 항상 한국어를 봅니다. 그래서 한국어 대표 주소가 한국어로 색인됩니다.
- 영어 번역은 `src/i18n/en.ts`에 **한국어 원문을 키로** 추가합니다. 번역이 없는 문장은 한국어로 보입니다. 화면 문구는 `L('한국어','English')`, 데이터 문구는 `tr(한국어)`로 감쌉니다.
- 검색엔진용 영어 첫 화면은 `/en/`이며, 한국어 첫 화면과 `hreflang`으로 연결됩니다.
- **초등 1~6학년은 전체 영어**(개념 설명·애니메이션 자막·교구 화면·문제·풀이·힌트·성취기준 121개 학습)입니다. 중·고등은 메뉴·단원명만 영어이고 단원 내용은 번역 예정입니다.
- 번역 방식: 문장 속 숫자를 `⟨0⟩`, `⟨1⟩` 자리표시로 바꾼 '틀'을 키로 사용하므로, 숫자가 바뀌는 문제도 틀 하나만 번역하면 됩니다. 수식 문장은 `MathText`/`MathLine`에서, 교구 화면의 글자·aria-label 등은 `src/i18n/domTranslate.ts`가 화면에서 바로 바꿉니다.
- 초등 수업 문장 사전(`src/i18n/en-elementary.ts`)은 영어 방문자에게만 따로 내려받습니다.
- 새 한국어 문장을 추가했다면 `npx vitest run --config scripts/i18n/vitest.harvest.config.ts`로 번역되지 않은 문장을 모은 뒤(`/tmp/harvest*.json`), `scripts/i18n/keys-*.json`과 `tr-*.txt`에 추가하고 `python3 scripts/i18n/build.py`로 사전을 다시 만듭니다.
