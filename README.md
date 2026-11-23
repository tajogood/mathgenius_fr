# 수학천재 Free · MathGenius

초등학교 1~6학년과 중학교 1~3학년을 위한 **100% 정적 웹사이트(GitHub Pages)** 무료 수학 개념 체험판입니다.

- 회원가입·PASS 인증·DB·서버 없이 이용합니다.
- 초등 1~6학년의 **원본 학습 콘텐츠를 그대로 유지**하고, 중학교 1~3학년의 **34개 개념 단원**을 추가했습니다.
- 중등 단원에 들어가면 숫자·그래프·도형을 바로 바꿔 볼 수 있으며, 이어서 문제 풀이와 해설을 제공합니다. 진도는 브라우저에 저장합니다.
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

**중요: Cloudflare Web Analytics는 호스트명을 검증합니다.** 기존
`tajogood.github.io`용 웹 애널리틱스 토큰은 `pages.dev`에서 동작하지 않습니다.
Web Analytics에서 `mathgenius-b0c.pages.dev`를 별도 사이트로 등록한 다음
새 추적 토큰을 Cloudflare Pages의 **Production 환경 변수 `WEB_ANALYTICS_TOKEN`**에
입력하고 재배포합니다. 별도의 데이터베이스는 필요하지 않습니다.
이 환경 변수를 설정하기 전에는 Cloudflare Pages 빌드에서 기존 GitHub 토큰을
의도적으로 제거하여 잘못된 집계를 방지합니다. GitHub Pages는 기존 추적을 유지합니다.
