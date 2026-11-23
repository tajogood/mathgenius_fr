# 수학천재 Free · MathGenius

초등학교 1~6학년을 위한 **100% 정적 웹사이트(GitHub Pages)** 무료 수학 개념 체험판입니다.

- 회원가입·PASS 인증·DB·서버 없이 이용합니다.
- 교구를 직접 조작하며 초등 수학의 개념을 익히고 문제에 도전합니다.
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

`main`에 변경사항을 올리면 GitHub Actions의 `Deploy free MathGenius to GitHub Pages`가
Vite로 빌드한 `dist/`를 GitHub Pages에 배포합니다.

GitHub 저장소에서 **Settings → Pages → Build and deployment → Source = GitHub Actions**를
한 번 선택해야 할 수 있습니다. 배포 완료 후:

**https://tajogood.github.io/mathgenius_fr/**

GitHub Pages 프로젝트 경로 `/mathgenius_fr/`에 맞추어 Vite의 `base`를 설정했습니다.

## 개인정보

이 무료판에는 Supabase 연결, 학생 계정, 보호자 동의, 학부모 대시보드, PASS 인증,
관리자 시스템 및 서버 측 학습 기록 수집 기능이 포함되어 있지 않습니다.
학습 진도는 현재 브라우저의 `localStorage`에만 저장되며,
브라우저 데이터를 삭제하거나 다른 기기를 사용하면 이어서 학습할 수 없습니다.

## 운영

운영사: 주식회사 라릭 · https://larix.kr

교육부/교육청 공식 인증 서비스 또는 학교 공식 성취평가가 아닙니다.
