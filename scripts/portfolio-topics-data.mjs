import { picsum } from "./lib/blocknote-helpers.mjs";

export const TOPICS = [
  {
    topicId: 128,
    title: "Portfolio — Next.js 인터랙티브 포트폴리오",
    thumbnail: picsum("portfolio-next", 1200, 630),
    sections: [
      {
        title: "Portfolio — Next.js 인터랙티브 포트폴리오",
        lines: [
        {
          type: "p",
          parts: [
            { text: "지금 작업 중인 프론트엔드 개발자 포트폴리오입니다. About · Experience · Projects · Skills · Contact를 한 페이지 스크롤로 이어 붙였습니다." },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "Next.js 16 · React 19 · GSAP ScrollTrigger · Three.js · Tailwind CSS v4 · Chart.js" },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "커스텀 스크롤 루트, 섹션 스냅, 가로 프로젝트 띠, WebGL 배경을 직접 엮으며 ‘보여 주는’ 포트폴리오를 만들고 있습니다." },
          ],
        },
        {
          type: "image",
          url: "https://picsum.photos/seed/portfolio-next-overview/1200/675",
          caption: "[임시 이미지] Next.js 포트폴리오 메인 — 추후 실제 캡처로 교체",
        },
        ],
      },
      {
        title: "링크",
        lines: [
        {
          type: "p",
          parts: [
            { text: "GitHub", bold: true },
            { text: " — https://github.com/kimkijun0226/portfolio" },
          ],
        },
        ],
      },
      {
        title: "기술 스택 상세",
        lines: [
        { type: "bullet", text: "프레임워크: Next.js 16 App Router, React 19, TypeScript" },
        { type: "bullet", text: "스타일: Tailwind CSS v4, CSS Modules, lib/design-system.ts 토큰" },
        { type: "bullet", text: "애니메이션: GSAP 3 + ScrollTrigger — data-reveal, 스크롤 컨테이너 scroller 연동" },
        { type: "bullet", text: "3D: Three.js + @react-three/fiber — 파티클 필드, GLSL 리본, 테마별 uniform" },
        { type: "bullet", text: "차트: Chart.js + react-chartjs-2 — Skills 섹션 시각화" },
        { type: "bullet", text: "기타: react-icons, sonner, prefers-color-scheme 다크/라이트" },
        {
          type: "image",
          url: "https://picsum.photos/seed/portfolio-next-stack/1200/675",
          caption: "[임시 이미지] 스크롤·GSAP·Three.js 레이어",
        },
        ],
      },
      {
        title: "주요 구현 하이라이트",
        lines: [
        { type: "bullet", text: "useScrollRoot — main[data-scroll-root] 커스텀 세로 스크롤 + CSS scroll-snap" },
        { type: "bullet", text: "useProjectsHorizontalScroll — sticky + translate3d 가로 프로젝트 띠" },
        { type: "bullet", text: "useExperienceTimelineDot — Experience 타임라인 dot·라벨 단일 동기화" },
        { type: "bullet", text: "useGsapScrollReveal — ScrollTrigger fade-up, stagger 그룹" },
        { type: "bullet", text: "data/ — profile, experience, projects, skills, contact TypeScript 상수로 콘텐츠 관리" },
        ],
      }
    ],
  },
  {
    topicId: 124,
    title: "Cursor Commerce Dashboard",
    thumbnail: picsum("cursor-commerce", 1200, 630),
    sections: [
      {
        title: "Cursor Commerce Dashboard",
        lines: [
        {
          type: "p",
          parts: [
            { text: "고객이 쇼핑하는 스토어와 운영자가 관리하는 대시보드를 한 프로젝트에서 다루는 커머스입니다." },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "Next.js 16 · Supabase · TanStack Query · Zustand · 토스페이먼츠 · Storybook" },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "Figma 토큰 동기화, RLS, 장바구니 persist, 결제 플로우까지 실무에 가까운 구조로 설계했습니다." },
          ],
        },
        {
          type: "image",
          url: "https://picsum.photos/seed/cursor-commerce-overview/1200/675",
          caption: "[임시 이미지] 커서 커머스 전체 구조 개요 — 추후 실제 스크린샷으로 교체",
        },
        ],
      },
      {
        title: "링크",
        lines: [
        {
          type: "p",
          parts: [
            { text: "GitHub", bold: true },
            { text: " — https://github.com/kimkijun0226/cursor-commerce-dashboard" },
          ],
        },
        ],
      },
      {
        title: "기술 스택 상세",
        lines: [
        {
          type: "code",
          language: "typescript",
          text: `// 기술 스택 (요약)
Next.js 16    App Router · React 19 · TypeScript
Tailwind v4   Figma 토큰 → commons/
Supabase      Postgres · Auth · Storage
TanStack Query v5  상품·주문·리뷰 캐시
Zustand       장바구니 persist · 검색 UI
토스페이먼츠   checkout → success / fail
Storybook 8   공통 UI 컴포넌트`,
        },
        ],
      },
      {
        title: "아키텍처·폴더 구조",
        lines: [
        {
          type: "p",
          parts: [
            { text: "스토어·어드민·인증을 라우트 그룹으로 나누고, 화면은 얇게 두고 `features/`에 도메인 로직을 모았습니다. 장바구니는 클라이언트 persist 후 체크아웃 시 서버 주문으로 넘깁니다." },
          ],
        },
        {
          type: "code",
          language: "typescript",
          text: `app/
  (commerce)/     # 스토어 — 홈, products, cart, checkout
  admin/            # 운영 — 주문, 상품, 통계
  auth/             # 로그인 · 회원가입 · 콜백

features/           # product, cart, order, review, admin …
commons/
  config/env        # Zod 환경 변수
  supabase/         # server · browser 클라이언트`,
        },
        ],
      },
      {
        title: "주요 구현 하이라이트",
        lines: [
        { type: "bullet", text: "장바구니 Zustand persist — 상품 ID·수량만 저장하고 렌더 시점에 최신 가격으로 합계 재계산해 데이터 정합성 유지" },
        { type: "bullet", text: "상품 검색·필터 — TanStack Query 키 분리로 카테고리·키워드 조합별 캐시, 무한 스크롤 또는 페이지네이션" },
        { type: "bullet", text: "어드민 대시보드 — 주문 상태 변경, 상품 CRUD, 매출·방문 지표 차트(도메인별 features/admin)" },
        { type: "bullet", text: "Storybook — Button, Card, Input 등 공통 컴포넌트를 Figma 스펙과 함께 문서화" },
        { type: "bullet", text: "토스페이먼츠 — 주문 생성 → 결제 요청 → success/fail 리다이렉트 → 주문 상태 업데이트 플로우" },
        ],
      }
    ],
  },
  {
    topicId: 125,
    title: "MyPage — 개인 블로그·커뮤니티",
    thumbnail: picsum("mypage-project", 1200, 630),
    sections: [
      {
        title: "MyPage — 개인 블로그·커뮤니티",
        lines: [
        {
          type: "p",
          parts: [
            { text: "글 쓰기를 넘어 댓글·팔로우·DM·알림까지 갖춘, 실제로 운영 중인 개인 커뮤니티 웹앱입니다." },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "React 19 · Vite 7 · Supabase · BlockNote · TanStack Query · Zustand" },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "비로그인 공개 조회, 익명 댓글, Realtime DM까지 직접 설계·배포했습니다." },
          ],
        },
        {
          type: "image",
          url: "https://picsum.photos/seed/mypage-overview/1200/675",
          caption: "[임시 이미지] My Page 메인 레이아웃 — 추후 실제 캡처로 교체",
        },
        ],
      },
      {
        title: "링크",
        lines: [
        {
          type: "p",
          parts: [
            { text: "Live", bold: true },
            { text: " — https://my-page.cloud" },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "GitHub", bold: true },
            { text: " — https://github.com/kimkijun0226/MyPageProject" },
          ],
        },
        ],
      },
      {
        title: "기술 스택 상세",
        lines: [
        { type: "bullet", text: "프론트: React 19, TypeScript, Vite 7, React Router 7 — SPA, 코드 스플리팅, Cloudflare Pages 정적 배포" },
        { type: "bullet", text: "백엔드: Supabase Auth, PostgreSQL, Storage(썸네일·프로필), Realtime(DM·알림 구독)" },
        { type: "bullet", text: "상태: TanStack Query v5(서버 데이터), Zustand(검색·카테고리·인증·DM UI 등 클라이언트 상태)" },
        { type: "bullet", text: "UI: Tailwind CSS v4, shadcn/ui, Radix primitives, lucide-react 아이콘" },
        { type: "bullet", text: "에디터: BlockNote 0.47 (@blocknote/core, react, mantine) — JSON 블록 배열을 topic.content에 저장" },
        { type: "bullet", text: "폼·검증: React Hook Form + Zod — 회원가입, 프로필 수정, 토픽 메타데이터" },
        {
          type: "image",
          url: "https://picsum.photos/seed/mypage-stack/1200/675",
          caption: "[임시 이미지] 프론트·Supabase 연동 구조",
        },
        ],
      },
      {
        title: "아키텍처·데이터 모델",
        lines: [
        {
          type: "p",
          parts: [
            { text: "Cloudflare Pages에 올린 React SPA가 Supabase를 BaaS로 쓰는 구조입니다. 별도 API 서버 없이 Auth·Postgres·Storage·Realtime을 한 스택으로 묶었고, 클라이언트는 `api/` 도메인 모듈과 `hooks/`만으로 데이터에 접근합니다." },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "도메인은 크게 세 덩어리로 나눴습니다. 게시(`topic`, `comment`, `like`, `follow`), 메시징(`dm_room`, `dm_message`), 알림(`notification`)이며, DM·알림은 Realtime 구독으로 목록·뱃지를 맞추고 글·댓글은 Query 캐시 invalidate로 맞춥니다. 토픽 본문은 BlockNote JSON을 `topic.content`에, 썸네일·본문 이미지는 Storage URL로 둡니다." },
          ],
        },
        {
          type: "code",
          language: "typescript",
          text: `// 시스템 구성 (요약)
// [SPA] ── PostgREST ──► Postgres (topic, comment, dm…)
//   ├─ Auth (세션·JWT)
//   ├─ Storage (files/ 썸네일·에디터 이미지)
//   └─ Realtime (dm_message, dm_room → 사이드바·DM 패널 갱신)

// api/ 도메인 모듈
topicApi    // 글 CRUD·검색·이미지 업로드
commentApi  // 댓글·답글
dmApi       // 방·메시지 + Realtime`,
        },
        ],
      },
      {
        title: "주요 기능 요약",
        lines: [
        { type: "bullet", text: "토픽 — 임시저장(draft)·발행(publish), 카테고리(resume/portfolio 등), 썸네일, visibility(PUBLIC/PRIVATE), 검색" },
        { type: "bullet", text: "소셜 — 댓글·답글 트리, 글/댓글 좋아요, 공유 수, 팔로우·팔로워 목록" },
        { type: "bullet", text: "DM — 대화 목록, Realtime 메시지 수신, 새 대화 시작 UI" },
        { type: "bullet", text: "알림 — 좋아요·댓글·팔로우·DM 등 타입별 Realtime 또는 폴링, 읽음 처리" },
        { type: "bullet", text: "UX — SiteWelcomeModal(오늘 하루 보지 않기), 이력서 카테고리 전용 ResumeCategoryPage, AppHeader 검색" },
        ],
      }
    ],
  },
  {
    topicId: 126,
    title: "커뮤니티 앱 (Expo)",
    thumbnail: picsum("community-app", 1200, 630),
    sections: [
      {
        title: "커뮤니티 앱 (Expo)",
        lines: [
        {
          type: "p",
          parts: [
            { text: "iOS·Android·웹을 하나의 codebase로 만든 Expo 기반 모바일 커뮤니티 앱입니다." },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "Expo SDK 52 · React Native · Expo Router · TanStack Query · secure-store" },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "홈·마이·설정 탭과 auth 스택으로, 웹에서 모바일 IA로 확장해 본 학습 프로젝트입니다." },
          ],
        },
        {
          type: "image",
          url: "https://picsum.photos/seed/community-overview/1200/675",
          caption: "[임시 이미지] 커뮤니티앱 탭 구조",
        },
        ],
      },
      {
        title: "링크",
        lines: [
        {
          type: "p",
          parts: [
            { text: "GitHub", bold: true },
            { text: " — https://github.com/kimkijun0226/ComunityApp" },
          ],
        },
        ],
      },
      {
        title: "기술 스택 상세",
        lines: [
        { type: "bullet", text: "런타임: Expo SDK 52, React Native, TypeScript" },
        { type: "bullet", text: "네비게이션: Expo Router — app/ 디렉터리 파일 = 라우트, (tabs) 그룹으로 하단 탭 바" },
        { type: "bullet", text: "데이터: TanStack Query, Axios — REST API 호출·캐싱·리트라이" },
        { type: "bullet", text: "폼: React Hook Form — 로그인·게시글·프로필 입력" },
        { type: "bullet", text: "네이티브: expo-secure-store(토큰), expo-haptics(터치 피드백), React Navigation 제스처" },
        {
          type: "image",
          url: "https://picsum.photos/seed/community-stack/1200/675",
          caption: "[임시 이미지] Expo·Router 스택",
        },
        ],
      },
      {
        title: "주요 구현",
        lines: [
        { type: "bullet", text: "탭 네비게이션 — 홈 피드, 마이 페이지(내 글·프로필), 설정(알림·테마·로그아웃)" },
        { type: "bullet", text: "auth 스택 — 비로그인 시 auth 레이아웃으로 redirect, 로그인 후 tabs 복귀" },
        { type: "bullet", text: "공통 컴포넌트 — 플랫폼별 StyleSheet, Pressable + haptics로 네이티브한 터치감" },
        { type: "bullet", text: "웹·앱 공유 코드베이스 — Platform.OS 분기 최소화, Expo web 빌드로 데스크톱 미리보기" },
        ],
      }
    ],
  },
  {
    topicId: 127,
    title: "레거시 프론트엔드 포트폴리오 사이트",
    thumbnail: picsum("portfolio-legacy", 1200, 630),
    sections: [
      {
        title: "레거시 프론트엔드 포트폴리오 사이트",
        lines: [
        {
          type: "p",
          parts: [
            { text: "프론트엔드를 처음 배울 때 직접 퍼블리싱하며 만든 초기 포트폴리오입니다." },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "HTML · CSS · JavaScript · GSAP · Locomotive Scroll" },
          ],
        },
        {
          type: "p",
          parts: [
            { text: "스크롤 애니메이션과 가로 스크롤 섹션을 실험한 출발점이 되었고, 이후 Next.js 포트폴리오로 이어졌습니다." },
          ],
        },
        {
          type: "image",
          url: "https://picsum.photos/seed/portfolio-legacy-overview/1200/675",
          caption: "[임시 이미지] 레거시 포트폴리오 — 추후 실제 캡처로 교체",
        },
        ],
      },
      {
        title: "기술 스택 상세",
        lines: [
        { type: "bullet", text: "마크업·스타일: HTML5, CSS3 — 반응형 레이아웃 직접 구현" },
        { type: "bullet", text: "스크립트: Vanilla JavaScript, 이후 React 도입 실험" },
        { type: "bullet", text: "애니메이션: GSAP — 스크롤 연동 fade·slide" },
        { type: "bullet", text: "스크롤: Locomotive Scroll — 부드러운 관성 스크롤·섹션 전환" },
        {
          type: "image",
          url: "https://picsum.photos/seed/portfolio-legacy-stack/1200/675",
          caption: "[임시 이미지] 레거시 스택",
        },
        ],
      },
      {
        title: "주요 구현",
        lines: [
        { type: "bullet", text: "단일 페이지 스크롤 — 섹션별 소개·프로젝트·연락처 구성" },
        { type: "bullet", text: "가로 스크롤 프로젝트 띠 — Locomotive Scroll과 GSAP 조합 실험" },
        { type: "bullet", text: "퍼블리싱 중심 — 디자인 시안을 HTML/CSS로 옮기며 레이아웃 감각 익히기" },
        ],
      }
    ],
  }
];
