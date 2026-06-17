import { picsum } from "./lib/blocknote-helpers.mjs";

export const TOPICS = [
  {
    title: "Portfolio — Experience dot 끊김 수정",
    thumbnail: picsum("portfolio-dot-fix", 1200, 630),
    sections: [
      {
        title: "Portfolio — Experience dot 끊김 수정",
        lines: [
          {
            type: "p",
            parts: [
              {
                text: "포트폴리오 Experience 섹션에서 스크롤할 때 타임라인 dot이 한 박자 늦게 따라오거나, 첫 번째 카드 구간에서 끊기는 현상이 있었습니다. dot 위치 계산 방식과 카드 스타일 두 가지를 손봤습니다.",
              },
            ],
          },
        ],
      },
      {
        title: "Before / After",
        lines: [
          {
            type: "image",
            url: picsum("portfolio-dot-gif-placeholder", 1200, 675),
            caption: "[GIF 자리] Experience dot 스크롤 — 수정 전·후 gif를 여기에 넣을 예정",
          },
        ],
      },
      {
        title: "원인",
        lines: [
          {
            type: "p",
            parts: [
              {
                text: "dot 훅이 scroll 이벤트마다 카드마다 offsetTop·offsetHeight를 다시 읽고 있었습니다. 스크롤이 빠를수록 레이아웃 조회와 transform 갱신이 같은 프레임에 겹치면서 dot이 끊겨 보였습니다.",
              },
            ],
          },
          {
            type: "p",
            parts: [
              {
                text: "Experience 카드에 backdrop-blur가 걸려 있어서, 스크롤할 때마다 블러 합성이 반복되며 첫 항목 구간에서 프레임이 더 불안정해졌습니다.",
              },
            ],
          },
        ],
      },
      {
        title: "수정 1 — scroll-frame + 레이아웃 캐시",
        lines: [
          {
            type: "p",
            parts: [
              {
                text: "lib/scroll/frame.ts의 subscribeScrollFrame으로 dot 갱신을 RAF 한 번에 묶었습니다. scroll 이벤트가 연속으로 와도 프레임당 update()는 한 번만 실행됩니다.",
              },
            ],
          },
          {
            type: "code",
            language: "typescript",
            text: `// lib/scroll/frame.ts — 스크롤 콜백을 RAF로 묶음
function onScroll() {
  if (rafId !== 0) return;
  rafId = requestAnimationFrame(flush);
}

export function subscribeScrollFrame(wrapper, listener) {
  attach(wrapper);
  listeners.add(listener);
}`,
          },
          {
            type: "p",
            parts: [
              {
                text: "카드 위치는 rebuildCache()에서 미리 계산해 두고, 스크롤 중에는 캐시만 읽습니다. Experience 섹션에 들어왔을 때만 will-change: transform을 켜서 불필요한 레이어 생성도 막았습니다.",
              },
            ],
          },
          {
            type: "code",
            language: "typescript",
            text: `// useExperienceTimelineDot.ts
const rebuildCache = () => {
  itemsCache = listNode.querySelectorAll("li[data-timeline-item]").map((item) => ({
    topAbs: timelineTopAbs + getOffsetWithin(timelineNode, item),
    height: item.offsetHeight,
    // ...
  }));
};

const unsubscribeScroll = subscribeScrollFrame(wrapper, update);

// 섹션 안에서만 will-change 적용
tracker.style.willChange = inSection ? "transform" : "";`,
          },
        ],
      },
      {
        title: "수정 2 — 카드 blur 제거",
        lines: [
          {
            type: "p",
            parts: [
              {
                text: "ExperienceCard에서 backdrop-blur-md를 제거하고, 불투명 배경(bg-bg/90)과 gradient overlay로 같은 느낌을 냈습니다. 스크롤 중 블러 합성이 사라져 첫 카드 구간이 더 매끄럽게 이어집니다.",
              },
            ],
          },
          {
            type: "code",
            language: "typescript",
            text: `// ExperienceCard.tsx — blur 제거, solid bg + gradient
className="... bg-bg/90 ... before:bg-gradient-to-b before:from-fg/[0.05]"
// (이전) backdrop-blur-md`,
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
    ],
  },
];
